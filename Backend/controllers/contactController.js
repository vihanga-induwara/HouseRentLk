const asyncHandler = require('express-async-handler');
const ContactMessage = require('../models/ContactMessage');
const Settings = require('../models/Settings');
const User = require('../models/User');
const { createNotification } = require('./notificationController');
const { sendEmail } = require('../services/emailService');

// @desc    Send a message to the support team
// @route   POST /api/contact
// @access  Public
const sendContactMessage = asyncHandler(async (req, res) => {
    const { name, email, subject, message } = req.body;

    const contact = await ContactMessage.create({
        name,
        email,
        subject,
        message,
        user: req.user?._id,
    });

    // Forward to the support inbox (best effort; the message is already stored)
    const settings = await Settings.findOne().select('contactEmail').lean();
    const supportEmail = process.env.SUPPORT_EMAIL || settings?.contactEmail;
    if (supportEmail) {
        try {
            await sendEmail({
                to: supportEmail,
                subject: `[Contact] ${subject || 'New message'} — ${name}`,
                text: `From: ${name} <${email}>\n\n${message}`,
            });
        } catch (error) {
            console.error('Failed to forward contact message:', error.message);
        }
    }

    const admins = await User.find({ role: 'admin', status: 'active' }).select('_id').lean();
    await Promise.all(admins.map(admin => createNotification({
        userId: admin._id,
        type: 'contact_message',
        title: 'New contact message',
        message: `${name}: ${subject || message.slice(0, 80)}`,
        link: '/admin',
    })));

    res.status(201).json({ message: 'Message sent', id: contact._id });
});

// @desc    List contact messages
// @route   GET /api/contact
// @access  Private (Admin)
const getContactMessages = asyncHandler(async (req, res) => {
    const filter = req.query.status ? { status: String(req.query.status) } : {};
    const messages = await ContactMessage.find(filter).sort({ createdAt: -1 }).limit(200);
    res.json(messages);
});

// @desc    Update contact message status
// @route   PUT /api/contact/:id/status
// @access  Private (Admin)
const updateContactMessageStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    if (!['new', 'read', 'resolved'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }
    const contact = await ContactMessage.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!contact) {
        res.status(404);
        throw new Error('Message not found');
    }
    res.json(contact);
});

module.exports = { sendContactMessage, getContactMessages, updateContactMessageStatus };
