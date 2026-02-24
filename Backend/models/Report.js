const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    reason: {
        type: String,
        required: [true, 'Please provide a reason for the report'],
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        required: [true, 'Please provide a detailed description'],
        trim: true,
        maxlength: 1000
    },
    screenshot: {
        type: String, // Cloudinary URL
    },
    contactEmail: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email',
        ],
    },

    status: {
        type: String,
        enum: ['pending', 'reviewed', 'dismissed'],
        default: 'pending'
    }
}, { timestamps: true });

// Prevent duplicate reports from same user on same listing
reportSchema.index({ reporter: 1, listing: 1 }, { unique: true });

module.exports = mongoose.model('Report', reportSchema);
