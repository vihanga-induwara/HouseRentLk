const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = asyncHandler(async (req, res) => {
    const { role, search } = req.query;

    let query = {};

    if (role) {
        query.role = role;
    }

    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
});

// @desc    Get user details with stats
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUserDetails = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Get user's listings
    const listings = await Listing.find({ owner: req.params.id });
    const totalListings = listings.length;
    const approvedListings = listings.filter(l => l.status === 'approved').length;
    const pendingListings = listings.filter(l => l.status === 'pending').length;

    res.status(200).json({
        user,
        stats: {
            totalListings,
            approvedListings,
            pendingListings
        }
    });
});

// @desc    Update user status (block/suspend/activate)
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin)
const updateUserStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'active', 'inactive', 'suspended', 'blocked'

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    user.status = status;
    await user.save();

    res.status(200).json({ message: `User status updated to ${status} successfully`, user });
});

// @desc    Update user details (role/status/verified/bio/phone)
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
    const { name, email, role, status, phone, bio, isVerified, renterProfile } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (phone !== undefined) user.phone = phone;
    if (bio !== undefined) user.bio = bio;
    if (isVerified !== undefined) user.isVerified = isVerified;
    if (renterProfile !== undefined) user.renterProfile = renterProfile;

    await user.save();

    res.status(200).json({ message: 'User updated successfully', user });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Optional: Delete user's listings
    await Listing.deleteMany({ owner: req.params.id });
    await user.deleteOne();

    res.status(200).json({ message: 'User and their listings deleted successfully' });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const pendingListings = await Listing.countDocuments({ status: 'pending' });
    const approvedListings = await Listing.countDocuments({ status: 'approved' });

    // Users by role
    const renters = await User.countDocuments({ role: 'renter' });
    const owners = await User.countDocuments({ role: 'owner' });
    const brokers = await User.countDocuments({ role: 'broker' });

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.status(200).json({
        totalUsers,
        totalListings,
        pendingListings,
        approvedListings,
        usersByRole: {
            renters,
            owners,
            brokers
        },
        newUsers
    });
});

module.exports = {
    getUsers,
    getUserDetails,
    updateUserStatus,
    updateUser,
    deleteUser,
    getStats
};
