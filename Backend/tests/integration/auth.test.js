const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, setupDatabase, createUser, lastEmailToken, emailOutbox, smsOutbox, PASSWORD } = require('./helpers');
const User = require('../../models/User');

setupDatabase();

describe('Registration and login', () => {
    it('registers each public role and returns the user without secrets', async () => {
        for (const role of ['renter', 'owner', 'broker']) {
            const res = await request(app).post('/api/auth/register')
                .send({ name: 'New User', email: `${role}@example.com`, password: PASSWORD, role });
            assert.equal(res.status, 201);
            assert.equal(res.body.role, role);
            assert.equal(res.body.password, undefined);
            assert.equal(res.body.emailVerificationToken, undefined);
            assert.match(res.headers['set-cookie'][0], /jwt=/);
        }
    });

    it('rejects admin self-registration', async () => {
        const res = await request(app).post('/api/auth/register')
            .send({ name: 'Mallory', email: 'm@example.com', password: PASSWORD, role: 'admin' });
        assert.equal(res.status, 400);
        assert.equal(await User.countDocuments(), 0);
    });

    it('sends a verification email on sign-up', async () => {
        await request(app).post('/api/auth/register')
            .send({ name: 'New User', email: 'verify@example.com', password: PASSWORD });
        assert.equal(emailOutbox.at(-1).to, 'verify@example.com');
        assert.equal(lastEmailToken('verify-email').length, 64);
    });

    it('rejects weak passwords and duplicate emails (case-insensitive)', async () => {
        let res = await request(app).post('/api/auth/register')
            .send({ name: 'Weak', email: 'weak@example.com', password: 'password' });
        assert.equal(res.status, 400);

        await createUser({ email: 'dup@example.com' });
        res = await request(app).post('/api/auth/register')
            .send({ name: 'Dup', email: 'DUP@example.com', password: PASSWORD });
        assert.equal(res.status, 400);
        assert.match(res.body.message, /already exists/);
    });

    it('logs in case-insensitively and rejects bad credentials', async () => {
        const { email } = await createUser();
        let res = await request(app).post('/api/auth/login').send({ email: email.toUpperCase(), password: PASSWORD });
        assert.equal(res.status, 200);

        res = await request(app).post('/api/auth/login').send({ email, password: 'Wrong1234' });
        assert.equal(res.status, 401);
    });

    it('blocks suspended users at login and on existing sessions', async () => {
        const { agent, email } = await createUser();
        await User.updateOne({ email }, { status: 'blocked' });

        let res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
        assert.equal(res.status, 403);

        res = await agent.get('/api/auth/me');
        assert.equal(res.status, 403);
    });
});

describe('Profile updates', () => {
    it('changes the password only with the current password, and the new one works', async () => {
        const { agent, email } = await createUser();

        let res = await agent.put('/api/auth/profile').send({ password: 'NewPassw0rd' });
        assert.equal(res.status, 400);

        res = await agent.put('/api/auth/profile').send({ currentPassword: PASSWORD, password: 'NewPassw0rd' });
        assert.equal(res.status, 200);

        // Regression: the password used to be hashed twice, locking the user out
        res = await request(app).post('/api/auth/login').send({ email, password: 'NewPassw0rd' });
        assert.equal(res.status, 200);
        res = await request(app).post('/api/auth/login').send({ email, password: PASSWORD });
        assert.equal(res.status, 401);

        // The agent got a fresh cookie with the change, so it stays logged in
        res = await agent.get('/api/auth/me');
        assert.equal(res.status, 200);
    });

    it('resets email verification when the email changes and refuses taken emails', async () => {
        await createUser({ email: 'taken@example.com' });
        const { agent } = await createUser();

        let res = await agent.put('/api/auth/profile').send({ email: 'Taken@example.com' });
        assert.equal(res.status, 400);

        res = await agent.put('/api/auth/profile').send({ email: 'fresh@example.com' });
        assert.equal(res.status, 200);
        assert.equal(res.body.isEmailVerified, false);
    });
});

describe('Email verification', () => {
    it('verifies with the emailed token, which is single-use', async () => {
        const { agent, email } = await createUser({}, { verified: false });
        const token = lastEmailToken('verify-email');

        let res = await request(app).post('/api/auth/verify-email').send({ token });
        assert.equal(res.status, 200);
        assert.equal((await User.findOne({ email })).isEmailVerified, true);

        res = await request(app).post('/api/auth/verify-email').send({ token });
        assert.equal(res.status, 400);

        res = await agent.get('/api/auth/me');
        assert.equal(res.body.isEmailVerified, true);
    });

    it('enforces a resend cooldown', async () => {
        const { agent } = await createUser({}, { verified: false });
        const res = await agent.post('/api/auth/verify-email/send');
        assert.equal(res.status, 429); // the sign-up email was sent seconds ago
    });
});

describe('Phone verification', () => {
    it('verifies a phone with the SMS code and rejects wrong codes', async () => {
        const { agent, email } = await createUser();

        let res = await agent.post('/api/auth/verify-phone/send').send({ phone: '077 123 4567' });
        assert.equal(res.status, 200);
        const sms = smsOutbox.at(-1);
        assert.equal(sms.to, '+94771234567');
        const code = sms.body.match(/(\d{6})/)[1];

        res = await agent.post('/api/auth/verify-phone').send({ otp: code === '000000' ? '111111' : '000000' });
        assert.equal(res.status, 400);

        res = await agent.post('/api/auth/verify-phone').send({ otp: code });
        assert.equal(res.status, 200);
        assert.equal((await User.findOne({ email })).isPhoneVerified, true);
    });

    it('locks the code after too many wrong attempts', async () => {
        const { agent } = await createUser();
        await agent.post('/api/auth/verify-phone/send').send({ phone: '0771234567' }).expect(200);
        const code = smsOutbox.at(-1).body.match(/(\d{6})/)[1];
        const wrong = code === '000000' ? '111111' : '000000';

        for (let i = 0; i < 5; i++) {
            await agent.post('/api/auth/verify-phone').send({ otp: wrong }).expect(400);
        }
        const res = await agent.post('/api/auth/verify-phone').send({ otp: code });
        assert.equal(res.status, 429);
    });

    it('rejects invalid phone numbers', async () => {
        const { agent } = await createUser();
        const res = await agent.post('/api/auth/verify-phone/send').send({ phone: '12345' });
        assert.equal(res.status, 400);
    });
});

describe('Password reset', () => {
    it('does not reveal whether an account exists', async () => {
        const res = await request(app).post('/api/auth/forgot-password').send({ email: 'nobody@example.com' });
        assert.equal(res.status, 200);
        assert.equal(emailOutbox.length, 0);
    });

    it('resets the password and invalidates existing sessions', async () => {
        const { agent, email } = await createUser();
        await request(app).post('/api/auth/forgot-password').send({ email }).expect(200);
        const token = lastEmailToken('reset-password');

        // Sessions are compared in whole seconds: make the reset happen in a later second
        await new Promise(resolve => setTimeout(resolve, 1100));

        let res = await request(app).post('/api/auth/reset-password').send({ token, password: 'Reset1234' });
        assert.equal(res.status, 200);

        res = await agent.get('/api/auth/me');
        assert.equal(res.status, 401);

        res = await request(app).post('/api/auth/login').send({ email, password: 'Reset1234' });
        assert.equal(res.status, 200);

        res = await request(app).post('/api/auth/reset-password').send({ token, password: 'Again1234' });
        assert.equal(res.status, 400);
    });
});
