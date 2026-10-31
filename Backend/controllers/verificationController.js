const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const User = require('../models/User');
const { createNotification } = require('./notificationController');

const DOC_TYPES = ['NIC', 'Utility Bill', 'Deed', 'Business Reg'];

// Signed delivery URL for a private (authenticated) document
const signedDocUrl = (doc) => {
    if (doc.publicId) {
        return cloudinary.url(doc.publicId, { type: 'authenticated', sign_url: true, secure: true, resource_type: 'image' });
    }
    return doc.url; // legacy public upload
};

// @desc    Submit verification documents
// @route   POST /api/verification
// @access  Private
const submitVerification = asyncHandler(async (req, res) => {
    const { docs } = req.body; // Array of { type, publicId }

    if (!Array.isArray(docs) || docs.length === 0 || docs.length > 4) {
        res.status(400);
        throw new Error('Please upload between 1 and 4 verification documents');
    }

    const validDocs = docs.every(doc =>
        DOC_TYPES.includes(doc.type) && typeof doc.publicId === 'string' && doc.publicId.startsWith('house_rent_lk_kyc/')
    );
    if (!validDocs) {
        res.status(400);
        throw new Error('Invalid verification documents');
    }

    const user = await User.findById(req.user.id);

    if (user.verificationStatus === 'verified') {
        res.status(400);
        throw new Error('Your identity is already verified');
    }

    user.verificationStatus = 'pending';
    user.verificationDocs = docs.map(doc => ({
        type: doc.type,
        publicId: doc.publicId,
        status: 'pending'
    }));
    user.verificationMessage = 'Under review by admin';

    await user.save();
    res.status(200).json({
        status: user.verificationStatus,
        message: user.verificationMessage
    });
});

// @desc    Get user verification status
// @route   GET /api/verification
// @access  Private
const getVerificationStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json({
        status: user.verificationStatus,
        docs: user.verificationDocs.map(doc => ({ type: doc.type, status: doc.status })),
        message: user.verificationMessage,
        verifiedAt: user.verifiedAt
    });
});

// @desc    Get all pending verifications (Admin)
// @route   GET /api/verification/pending
// @access  Private/Admin
const getPendingVerifications = asyncHandler(async (req, res) => {
    const users = await User.find({ verificationStatus: 'pending' })
        .select('name email phone role verificationStatus verificationDocs updatedAt')
        .sort({ updatedAt: 1 })
        .lean();

    res.status(200).json(users.map(user => ({
        ...user,
        verificationDocs: (user.verificationDocs || []).map(doc => ({
            _id: doc._id,
            type: doc.type,
            status: doc.status,
            url: signedDocUrl(doc),
        })),
    })));
});

// @desc    Review verification request (Admin)
// @route   PUT /api/verification/:userId
// @access  Private/Admin
const reviewVerification = asyncHandler(async (req, res) => {
    const { status, message } = req.body; // verified, rejected

    if (!['verified', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status. Use "verified" or "rejected".');
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.verificationStatus = status;
    user.verificationMessage = message || (status === 'verified' ? 'Identity verified successfully' : 'Verification rejected');

    if (status === 'verified') {
        user.verifiedAt = Date.now();
        user.isVerified = true;
        user.verificationDocs.forEach(doc => {
            if (doc.status === 'pending') doc.status = 'approved';
        });
    } else {
        user.isVerified = false;
        user.verificationDocs.forEach(doc => {
            if (doc.status === 'pending') doc.status = 'rejected';
        });
    }

    await user.save();

    await createNotification({
        userId: user._id,
        type: status === 'verified' ? 'verification_approved' : 'verification_rejected',
        title: status === 'verified' ? 'Identity Verified! ✅' : 'Verification Update',
        message: user.verificationMessage,
        link: '/profile',
    });

    res.status(200).json({
        status: user.verificationStatus,
        message: user.verificationMessage
    });
});

module.exports = {
    submitVerification,
    getVerificationStatus,
    getPendingVerifications,
    reviewVerification,
};
