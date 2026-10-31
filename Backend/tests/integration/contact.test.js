const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, setupDatabase, createUser, emailOutbox } = require('./helpers');
const ContactMessage = require('../../models/ContactMessage');
const Notification = require('../../models/Notification');

setupDatabase();

describe('Contact form', () => {
    it('stores the message, emails support and notifies admins', async () => {
        process.env.SUPPORT_EMAIL = 'support@example.com';
        const admin = await createUser({ role: 'admin' });

        const res = await request(app).post('/api/contact')
            .send({ name: 'Nimal', email: 'nimal@example.com', subject: 'Help', message: 'I cannot find the post ad button.' });

        assert.equal(res.status, 201);
        assert.equal(await ContactMessage.countDocuments(), 1);
        assert.equal(emailOutbox.at(-1).to, 'support@example.com');
        assert.ok(await Notification.exists({ user: admin.user._id, type: 'contact_message' }));

        const list = await admin.agent.get('/api/contact');
        assert.equal(list.body.length, 1);
        delete process.env.SUPPORT_EMAIL;
    });

    it('validates input and hides messages from non-admins', async () => {
        let res = await request(app).post('/api/contact').send({ name: 'N', email: 'bad', message: 'short' });
        assert.equal(res.status, 400);

        const user = await createUser({ role: 'renter' });
        res = await user.agent.get('/api/contact');
        assert.equal(res.status, 403);
    });
});
