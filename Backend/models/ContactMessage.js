const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        email: { type: String, required: true, trim: true, maxlength: 254 },
        subject: { type: String, trim: true, maxlength: 150 },
        message: { type: String, required: true, maxlength: 3000 },
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // set when sent while logged in
        status: { type: String, enum: ['new', 'read', 'resolved'], default: 'new' },
    },
    { timestamps: true }
);

contactMessageSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
