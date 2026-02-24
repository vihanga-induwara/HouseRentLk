const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Follow a user (broker/owner)
// @route   POST /api/users/follow/:id
// @access  Private
const followUser = asyncHandler(async (req, res) => {
    const userToFollow = await User.findById(req.params.id);

    if (!userToFollow) {
        res.status(404);
        throw new Error('User not found');
    }

    if (userToFollow.id === req.user.id) {
        res.status(400);
        throw new Error('You cannot follow yourself');
    }

    const currentUser = await User.findById(req.user.id);

    if (currentUser.following.includes(req.params.id)) {
        res.status(400);
        throw new Error('Already following this user');
    }

    currentUser.following.push(req.params.id);
    await currentUser.save();

    res.status(200).json({ success: true, message: 'User followed' });
});

// @desc    Unfollow a user
// @route   POST /api/users/unfollow/:id
// @access  Private
const unfollowUser = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user.id);

    if (!currentUser.following.includes(req.params.id)) {
        res.status(400);
        throw new Error('Not following this user');
    }

    currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== req.params.id
    );
    await currentUser.save();

    res.status(200).json({ success: true, message: 'User unfollowed' });
});

// @desc    Get followers of a user (or self)
// @route   GET /api/users/followers
// @access  Private
const getFollowers = asyncHandler(async (req, res) => {
    const followers = await User.find({ following: req.user.id })
        .select('name email phone avatar createdAt')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: followers.length,
        data: followers
    });
});

// @desc    Check follow status
// @route   GET /api/users/follow-status/:id
// @access  Private
const getFollowStatus = asyncHandler(async (req, res) => {
    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(req.params.id);
    res.status(200).json({ isFollowing });
});

// @desc    Get all brokers
// @route   GET /api/users/brokers
// @access  Public
const getBrokers = asyncHandler(async (req, res) => {
    const { name, page = 1, limit = 12 } = req.query;
    const query = { role: 'broker', status: 'active' };

    if (name) {
        query.name = { $regex: name, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const brokers = await User.find(query)
        .select('name avatar bio verificationStatus createdAt')
        .sort({ verificationStatus: 1, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
        success: true,
        count: brokers.length,
        total,
        pages: Math.ceil(total / Number(limit)),
        data: brokers
    });
});

// @desc    Get public profile of a broker/owner
// @route   GET /api/users/profile/:id
// @access  Public
const getPublicProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('name avatar bio verificationStatus role createdAt');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json({
        success: true,
        data: user
    });
});

module.exports = {
    followUser,
    unfollowUser,
    getFollowers,
    getFollowStatus,
    getBrokers,
    getPublicProfile
};
