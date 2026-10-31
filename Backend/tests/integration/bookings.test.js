const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { setupDatabase, createUser } = require('./helpers');
const Listing = require('../../models/Listing');
const Notification = require('../../models/Notification');

setupDatabase();

const daysFromNow = (days) => new Date(Date.now() + days * 86400000).toISOString().split('T')[0];

const createApprovedListing = (ownerId) => Listing.create({
    owner: ownerId,
    title: 'Annex in Nugegoda',
    description: 'Small annex',
    type: 'Annex',
    location: { town: 'Nugegoda', street: 'High Level Road', address: 'High Level Road, Nugegoda', coordinates: { type: 'Point', coordinates: [79.89, 6.87] } },
    price: 30000,
    beds: 1,
    baths: 1,
    size: 400,
    status: 'approved',
});

describe('Viewing bookings', () => {
    let owner, renter, listing;

    beforeEach(async () => {
        owner = await createUser();
        renter = await createUser({ role: 'renter' });
        listing = await createApprovedListing(owner.user._id);
    });

    const book = (agent, overrides = {}) => agent.post('/api/bookings').send({
        listingId: listing._id.toString(),
        date: daysFromNow(2),
        timeSlot: '11:00 AM',
        ...overrides,
    });

    it('creates a request and notifies the owner', async () => {
        const res = await book(renter.agent);
        assert.equal(res.status, 201);
        assert.equal(res.body.status, 'pending');
        assert.ok(await Notification.exists({ user: owner.user._id, type: 'booking_requested' }));
    });

    it('rejects past dates, own listings and taken slots', async () => {
        assert.equal((await book(renter.agent, { date: daysFromNow(-1) })).status, 400);
        assert.equal((await book(owner.agent)).status, 400);

        assert.equal((await book(renter.agent)).status, 201);
        const other = await createUser({ role: 'renter' });
        assert.equal((await book(other.agent)).status, 400);
    });

    it('only lets the owner confirm, and the renter cancel', async () => {
        const { body: booking } = await book(renter.agent);

        let res = await renter.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'confirmed' });
        assert.equal(res.status, 400);

        const stranger = await createUser({ role: 'renter' });
        res = await stranger.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'cancelled' });
        assert.equal(res.status, 403);

        res = await owner.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'confirmed' });
        assert.equal(res.status, 200);
        assert.ok(await Notification.exists({ user: renter.user._id, type: 'booking_updated' }));

        res = await renter.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'cancelled' });
        assert.equal(res.status, 200);

        // Cancelled bookings are final
        res = await owner.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'confirmed' });
        assert.equal(res.status, 400);
    });

    it('frees the slot after a cancellation', async () => {
        const { body: booking } = await book(renter.agent);
        await renter.agent.put(`/api/bookings/${booking._id}/status`).send({ status: 'cancelled' }).expect(200);

        const other = await createUser({ role: 'renter' });
        assert.equal((await book(other.agent)).status, 201);
    });
});
