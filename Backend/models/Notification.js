const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: [
                'inquiry_received',
                'inquiry_reply',
                'listing_approved',
                'listing_rejected',
                'listing_expiring',
                'listing_favorited',
                'new_listing_from_followed',
                'listing_reported',
                'listing_reviewed',
                'saved_search_match',
                'verification_approved',
                'verification_rejected',
                'booking_requested',
                'booking_updated',
                'contact_message',
            ],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        link: {
            type: String,
            default: '',
        },
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
