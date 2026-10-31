// HTTP-level checks of the Express app that need no database
const request = require('supertest');
const app = require('../app');

describe('App middleware', () => {
    it('serves the liveness check', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
    });

    it('reports not ready without a database', async () => {
        const res = await request(app).get('/ready');
        expect(res.status).toBe(503);
    });

    it('returns JSON 404s with a request id', async () => {
        const res = await request(app).get('/api/does-not-exist');
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Not Found/);
        expect(res.headers['x-request-id']).toBeTruthy();
    });

    it('rejects malformed JSON with 400', async () => {
        const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{bad');
        expect(res.status).toBe(400);
    });

    it('does not crash on malformed cookies', async () => {
        const res = await request(app).get('/api/auth/me').set('Cookie', 'jwt=%E0%A4%A');
        expect(res.status).toBe(401);
    });

    describe('CSRF guard', () => {
        it('blocks cookie-authenticated writes without origin or header', async () => {
            const res = await request(app).post('/api/bookings').set('Cookie', 'jwt=abc').send({});
            expect(res.status).toBe(403);
        });

        it('allows requests with X-Requested-With', async () => {
            const res = await request(app).post('/api/bookings').set('Cookie', 'jwt=abc').set('X-Requested-With', 'XMLHttpRequest').send({});
            expect(res.status).toBe(401); // passes the guard, then fails auth
        });

        it('allows requests from an allowed origin', async () => {
            const res = await request(app).post('/api/bookings').set('Cookie', 'jwt=abc').set('Origin', 'http://localhost:5173').send({});
            expect(res.status).toBe(401);
        });
    });

    describe('CORS', () => {
        it('echoes allowed origins', async () => {
            const res = await request(app).get('/health').set('Origin', 'http://localhost:5173');
            expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
        });

        it('does not allow foreign origins', async () => {
            const res = await request(app).get('/health').set('Origin', 'http://evil.example');
            expect(res.headers['access-control-allow-origin']).toBeUndefined();
        });
    });

    it('requires login for uploads', async () => {
        const res = await request(app).post('/api/upload/multiple');
        expect(res.status).toBe(401);
    });

    it('rejects admin self-registration', async () => {
        const res = await request(app).post('/api/auth/register')
            .send({ name: 'Mallory', email: 'm@example.com', password: 'Passw0rd!', role: 'admin' });
        expect(res.status).toBe(400);
    });
});
