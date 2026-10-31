const asyncHandler = require('express-async-handler');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');
const { createNotification } = require('./notificationController');

// Allowed status changes, per role, from each current status
const TRANSITIONS = {
    owner: {
        pending: ['confirmed', 'rejected'],
        confirmed: ['completed', 'cancelled'],
    },
    renter: {
        pending: ['cancelled'],
        confirmed: ['cancelled'],
    },
};

const MAX_DAYS_AHEAD = 90;

// @desc    Create a new booking request
// @route   POST /api/bookings
// @access  Private
const createBooking = asyncHandler(async (req, res) => {
    const { listingId, date, timeSlot, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing || listing.status !== 'approved') {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() === req.user.id) {
        res.status(400);
        throw new Error('You cannot book a viewing of your own listing');
    }

    // Normalise to the start of the day so the slot uniqueness check is reliable
    const day = new Date(date);
    day.setUTCHours(0, 0, 0, 0);
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const latest = new Date(today.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000);

    if (day < today || day > latest) {
        res.status(400);
        throw new Error(`Please choose a date between today and ${MAX_DAYS_AHEAD} days from now`);
    }

    // Check for double booking
    const existingBooking = await Booking.findOne({ listing: listingId, date: day, timeSlot, isActive: true });
    if (existingBooking) {
        res.status(400);
        throw new Error('This time slot is already booked');
    }

    let booking;
    try {
        booking = await Booking.create({
            listing: listingId,
            renter: req.user._id,
            owner: listing.owner,
            date: day,
            timeSlot,
            message
        });
    } catch (error) {
        if (error.code === 11000) { // lost a race for the same slot
            res.status(400);
            throw new Error('This time slot is already booked');
        }
        throw error;
    }

    await createNotification({
        userId: listing.owner,
        type: 'booking_requested',
        title: 'New viewing request',
        message: `${req.user.name} wants to view "${listing.title}" on ${day.toDateString()} (${timeSlot}).`,
        link: '/owner/leads',
    });

    res.status(201).json(booking);
});

// @desc    Get user's bookings (as renter or owner)
// @route   GET /api/bookings
// @access  Private
const getMyBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({
        $or: [{ renter: req.user._id }, { owner: req.user._id }]
    })
        .populate('listing', 'title images price location')
        .populate('renter', 'name email phone avatar')
        .populate('owner', 'name phone avatar')
        .sort('-createdAt')
        .limit(500);

    res.json(bookings);
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (owner: confirm/reject/complete/cancel, renter: cancel)
const updateBookingStatus = asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id).populate('listing', 'title');

    if (!booking) {
        res.status(404);
        throw new Error('Booking not found');
    }

    const userId = req.user._id.toString();
    const role = booking.owner.toString() === userId ? 'owner'
        : booking.renter.toString() === userId ? 'renter'
            : null;

    if (!role) {
        res.status(403);
        throw new Error('Not authorized to update this booking');
    }

    const allowed = TRANSITIONS[role][booking.status] || [];
    if (!allowed.includes(status)) {
        res.status(400);
        throw new Error(`You cannot change a ${booking.status} booking to "${status}"`);
    }

    booking.status = status;
    if (notes) booking.notes = notes;
    await booking.save();

    // Tell the other party
    const notifyUser = role === 'owner' ? booking.renter : booking.owner;
    await createNotification({
        userId: notifyUser,
        type: 'booking_updated',
        title: `Viewing ${status}`,
        message: `The viewing for "${booking.listing?.title || 'a listing'}" on ${booking.date.toDateString()} was ${status}.`,
        link: '/owner/leads',
    });

    res.json(booking);
});

module.exports = {
    createBooking,
    getMyBookings,
    updateBookingStatus
};
