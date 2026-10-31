// Shared setup for the integration tests (run with Node's test runner, not Jest:
// the MongoDB driver's handshake fails inside Jest's VM sandbox).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_that_is_long_enough_for_validation';
process.env.FRONTEND_URL = 'http://localhost:5173';
process.env.ENABLE_SCHEDULER = 'false';
// AI scripts are not exercised here; a missing interpreter makes them fail fast,
// which the controllers already treat as "no AI result".
process.env.PYTHON_BIN = 'python-disabled-in-tests';

const { before, after, afterEach } = require('node:test');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../../app');
const User = require('../../models/User');
const emailService = require('../../services/emailService');
const smsService = require('../../services/smsService');

const PASSWORD = 'Passw0rd!';

// Registers before/afterEach/after hooks for the calling test file
const setupDatabase = () => {
    let server;

    before(async () => {
        // Generous launch timeout for slow CI runners / cold disks
        server = await MongoMemoryServer.create({ instance: { launchTimeout: 120000 } });
        await mongoose.connect(server.getUri());
        // Build indexes (unique email, booking slot, ...) before tests rely on them
        await Promise.all(mongoose.modelNames().map(name => mongoose.model(name).syncIndexes()));
    });

    afterEach(async () => {
        const { collections } = mongoose.connection;
        await Promise.all(Object.values(collections).map(c => c.deleteMany({})));
        emailService.outbox.length = 0;
        smsService.outbox.length = 0;
    });

    after(async () => {
        await mongoose.disconnect();
        if (server) await server.stop();
    });
};

let counter = 0;

// Supertest agent that keeps cookies and sends the header the CSRF guard expects
const newAgent = () => {
    const agent = request.agent(app);
    agent.set('X-Requested-With', 'XMLHttpRequest');
    return agent;
};

// Creates a user (through the API unless admin) and returns a logged-in agent
const createUser = async (overrides = {}, { verified = true } = {}) => {
    counter += 1;
    const body = {
        name: `Test User ${counter}`,
        email: `user${counter}@example.com`,
        password: PASSWORD,
        role: 'owner',
        ...overrides,
    };
    const agent = newAgent();

    if (body.role === 'admin') {
        // Admins cannot sign up through the API
        await User.create({ ...body, isEmailVerified: true });
        await agent.post('/api/auth/login').send({ email: body.email, password: PASSWORD }).expect(200);
    } else {
        await agent.post('/api/auth/register').send(body).expect(201);
        if (verified) await User.updateOne({ email: body.email }, { isEmailVerified: true });
    }

    const user = await User.findOne({ email: body.email });
    return { agent, user, email: body.email };
};

// Token from the most recent email link of the given kind (verify-email / reset-password)
const lastEmailToken = (kind) => {
    const message = emailService.outbox.at(-1);
    const match = message && message.text.match(new RegExp(`${kind}/([a-f0-9]{64})`));
    return match && match[1];
};

module.exports = {
    app,
    request,
    setupDatabase,
    newAgent,
    createUser,
    lastEmailToken,
    emailOutbox: emailService.outbox,
    smsOutbox: smsService.outbox,
    PASSWORD,
};
