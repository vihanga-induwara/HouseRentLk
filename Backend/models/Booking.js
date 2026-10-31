const mongoose = require('mongoose');

const BOOKING_STATUSES = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];
// Statuses that still occupy the time slot
const ACTIVE_STATUSES = ['pending', 'confirmed'];

const bookingSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    renter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true,
        maxlength: 50
    },
    status: {
        type: String,
        enum: BOOKING_STATUSES,
        default: 'pending'
    },
    // Maintained from status so the unique index only covers live bookings
    isActive: {
        type: Boolean,
        default: true
    },
    message: { type: String, maxlength: 500 },
    notes: { type: String, maxlength: 500 }
}, {
    timestamps: true
});

bookingSchema.pre('save', function () {
    this.isActive = ACTIVE_STATUSES.includes(this.status);
});

// Prevent double bookings of a live slot; cancelled/rejected slots can be booked again.
// Run `npm run db:sync-indexes` once to replace the old index that also blocked cancelled slots.
bookingSchema.index(
    { listing: 1, date: 1, timeSlot: 1 },
    { unique: true, partialFilterExpression: { isActive: true }, name: 'unique_active_slot' }
);
bookingSchema.index({ owner: 1, createdAt: -1 });
bookingSchema.index({ renter: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
Booking.STATUSES = BOOKING_STATUSES;

module.exports = Booking;
