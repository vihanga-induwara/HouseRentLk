const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { app, request, setupDatabase, createUser } = require('./helpers');
const Listing = require('../../models/Listing');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

setupDatabase();

const listingBody = (overrides = {}) => ({
    title: 'Two bedroom house in Kandy',
    description: 'Quiet house close to town.',
    type: 'House',
    location: {
        town: 'Kandy',
        street: 'Temple Road',
        address: '12 Temple Road, Kandy',
        coordinates: { type: 'Point', coordinates: [80.63, 7.29] },
    },
    price: 45000,
    beds: 2,
    baths: 1,
    size: 900,
    ...overrides,
});

describe('Creating listings', () => {
    it('requires a verified email or phone', async () => {
        const { agent } = await createUser({}, { verified: false });
        const res = await agent.post('/api/listings').send(listingBody());
        assert.equal(res.status, 403);
    });

    it('creates a pending listing and ignores server-controlled fields', async () => {
        const { agent } = await createUser();
        const res = await agent.post('/api/listings')
            .send(listingBody({ status: 'approved', isFeatured: true, views: 9999 }));
        assert.equal(res.status, 201);
        assert.equal(res.body.status, 'pending');
        assert.equal(res.body.isFeatured, false);
        assert.equal(res.body.views, 0);
        assert.ok(new Date(res.body.expiresAt).getTime() > Date.now());
    });

    it('lets admins feature a listing', async () => {
        const { agent } = await createUser({ role: 'admin' });
        const res = await agent.post('/api/listings').send(listingBody({ isFeatured: true }));
        assert.equal(res.status, 201);
        assert.equal(res.body.isFeatured, true);
    });

    it('lets only the owner edit, and edits go back to review', async () => {
        const owner = await createUser();
        const { body: listing } = await owner.agent.post('/api/listings').send(listingBody());
        await Listing.updateOne({ _id: listing._id }, { status: 'approved' });

        const other = await createUser();
        let res = await other.agent.put(`/api/listings/${listing._id}`).send({ price: 1 });
        assert.equal(res.status, 401);

        res = await owner.agent.put(`/api/listings/${listing._id}`).send({ price: 50000, views: 5 });
        assert.equal(res.status, 200);
        const saved = await Listing.findById(listing._id);
        assert.equal(saved.price, 50000);
        assert.equal(saved.status, 'pending');
        assert.equal(saved.views, 0);
    });
});

describe('Viewing listings', () => {
    let owner;
    let listing;

    beforeEach(async () => {
        owner = await createUser({ phone: '+94771234567' });
        const res = await owner.agent.post('/api/listings').send(listingBody());
        listing = res.body;
    });

    it('hides pending listings from the public but shows them to the owner', async () => {
        let res = await request(app).get(`/api/listings/${listing._id}`);
        assert.equal(res.status, 404);

        res = await owner.agent.get(`/api/listings/${listing._id}`);
        assert.equal(res.status, 200);
    });

    it('never exposes owner email publicly and shows phone only to logged-in users', async () => {
        await Listing.updateOne({ _id: listing._id }, { status: 'approved' });

        let res = await request(app).get(`/api/listings/${listing._id}`);
        assert.equal(res.status, 200);
        assert.equal(res.body.owner.email, undefined);
        assert.equal(res.body.owner.phone, undefined);

        const viewer = await createUser({ role: 'renter' });
        res = await viewer.agent.get(`/api/listings/${listing._id}`);
        assert.equal(res.body.owner.phone, '+94771234567');
        assert.equal(res.body.owner.email, undefined);

        res = await request(app).get('/api/listings');
        assert.equal(res.body.data.length, 1);
        assert.equal(res.body.data[0].owner.email, undefined);
        assert.equal(res.body.data[0].owner.phone, undefined);
    });

    it('counts views from visitors but not from the owner', async () => {
        await Listing.updateOne({ _id: listing._id }, { status: 'approved' });
        await owner.agent.get(`/api/listings/${listing._id}`);
        await request(app).get(`/api/listings/${listing._id}`);
        await request(app).get(`/api/listings/${listing._id}`);
        assert.equal((await Listing.findById(listing._id)).views, 2);
    });

    it('caps the page size and filters by town', async () => {
        await Listing.updateOne({ _id: listing._id }, { status: 'approved' });
        let res = await request(app).get('/api/listings?limit=100000&town=kan');
        assert.equal(res.status, 200);
        assert.equal(res.body.total, 1);

        res = await request(app).get('/api/listings?town=Galle');
        assert.equal(res.body.total, 0);
    });

    it('returns 404 for malformed ids instead of 500', async () => {
        const res = await request(app).get('/api/listings/not-an-id');
        assert.equal(res.status, 404);
    });
});

describe('Moderation', () => {
    it('lets only admins approve, validates status, and notifies the owner', async () => {
        const owner = await createUser();
        const { body: listing } = await owner.agent.post('/api/listings').send(listingBody());

        let res = await owner.agent.put(`/api/admin/listings/${listing._id}/status`).send({ status: 'approved' });
        assert.equal(res.status, 403);

        const admin = await createUser({ role: 'admin' });
        res = await admin.agent.put(`/api/admin/listings/${listing._id}/status`).send({ status: 'bogus' });
        assert.equal(res.status, 400);

        res = await admin.agent.put(`/api/admin/listings/${listing._id}/status`).send({ status: 'approved' });
        assert.equal(res.status, 200);
        assert.ok(await Notification.exists({ user: owner.user._id, type: 'listing_approved' }));
    });

    it('sends reports to admins, not to the reported owner', async () => {
        const owner = await createUser();
        const { body: listing } = await owner.agent.post('/api/listings').send(listingBody());
        await Listing.updateOne({ _id: listing._id }, { status: 'approved' });
        const admin = await createUser({ role: 'admin' });
        const reporter = await createUser({ role: 'renter' });

        const res = await reporter.agent.post('/api/listings/report')
            .send({ listingId: listing._id, reason: 'Scam', description: 'Asked for a deposit before viewing' });
        assert.equal(res.status, 201);

        assert.ok(await Notification.exists({ user: admin.user._id, type: 'listing_reported' }));
        assert.ok(!(await Notification.exists({ user: owner.user._id, type: 'listing_reported' })));
    });

    it('cuts off suspended users immediately', async () => {
        const { agent, user } = await createUser();
        await User.updateOne({ _id: user._id }, { status: 'suspended' });
        const res = await agent.post('/api/listings').send(listingBody());
        assert.equal(res.status, 403);
    });

    it('stops admins from locking themselves out', async () => {
        const admin = await createUser({ role: 'admin' });
        const res = await admin.agent.put(`/api/admin/users/${admin.user._id}/status`).send({ status: 'blocked' });
        assert.equal(res.status, 400);
    });
});

describe('Scheduler', () => {
    it('expires listings past their expiry date and notifies the owner', async () => {
        const { expireListings } = require('../../jobs/scheduler');
        const owner = await createUser();
        const { body: listing } = await owner.agent.post('/api/listings').send(listingBody());
        await Listing.updateOne({ _id: listing._id }, { status: 'approved', expiresAt: new Date(Date.now() - 1000) });

        assert.equal(await expireListings(), 1);
        assert.equal((await Listing.findById(listing._id)).status, 'expired');
        assert.ok(await Notification.exists({ user: owner.user._id, type: 'listing_expiring' }));
    });
});
