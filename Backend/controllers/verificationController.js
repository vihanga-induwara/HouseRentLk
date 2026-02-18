const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Submit NIC for verification
// @route   POST /api/verification/submit
// @access  Private
const submitVerification = asyncHandler(async (req, res) => {
    const { nicFront, nicBack } = req.body;

    if (!nicFront || !nicBack) {
        res.status(400);
        throw new Error('Please upload both front and back of NIC');
    }

    const user = await User.findById(req.user.id);

    user.verification = {
        status: 'pending',
        nicFront,
        nicBack,
        message: 'Under review by admin',
    };

    await user.save();
    res.status(200).json(user.verification);
});

// @desc    Get user verification status
// @route   GET /api/verification/status
// @access  Private
const getVerificationStatus = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    res.status(200).json(user.verification);
});

// @desc    Get all pending verifications (Admin)
// @route   GET /api/verification/admin/pending
// @access  Private/Admin
const getPendingVerifications = asyncHandler(async (req, res) => {
    const users = await User.find({ 'verification.status': 'pending' })
        .select('name email phone verification');
    res.status(200).json(users);
});

// @desc    Review verification request (Admin)
// @route   PUT /api/verification/admin/:userId
// @access  Private/Admin
const reviewVerification = asyncHandler(async (req, res) => {
    const { status, message } = req.body; // approved, rejected, re_requested

    if (!['approved', 'rejected'].includes(status)) {
        res.status(400);
        throw new Error('Invalid status');
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.verification.status = status;
    user.verification.message = message || (status === 'approved' ? 'Identity verified successfully' : 'Verification rejected');

    if (status === 'approved') {
        user.verification.verifiedAt = Date.now();
        user.isVerified = true;
    } else {
        user.isVerified = false;
    }

    await user.save();

    // Notify user
    await createNotification({
        userId: user._id,
        type: status === 'approved' ? 'verification_approved' : 'verification_rejected',
        title: status === 'approved' ? 'Identity Verified! ✅' : 'Verification Update',
        message: user.verification.message,
        link: '/profile',
    });

    res.status(200).json(user.verification);
});

module.exports = {
    submitVerification,
    getVerificationStatus,
    getPendingVerifications,
    reviewVerification,
};
