const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Inquiry = require('../models/Inquiry');
const Favorite = require('../models/Favorite');
const Report = require('../models/Report');
const Notification = require('../models/Notification');
const SavedSearch = require('../models/SavedSearch');
const Session = require('../models/Session');
const BudgetPlan = require('../models/BudgetPlan');
const { adminPage } = require('../utils/pagination');

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
        // Escape regex special characters to prevent ReDoS
        const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        query.$or = [
            { name: { $regex: safeSearch, $options: 'i' } },
            { email: { $regex: safeSearch, $options: 'i' } }
        ];
    }

    const { limit, skip } = adminPage(req.query);
    const [users, total] = await Promise.all([
        User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
        User.countDocuments(query),
    ]);
    res.set('X-Total-Count', String(total));
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

    if (req.user.id === req.params.id) {
        res.status(400);
        throw new Error('You cannot change your own account status');
    }

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

    if (req.user.id === req.params.id && ((role !== undefined && role !== 'admin') || (status !== undefined && status !== 'active'))) {
        res.status(400);
        throw new Error('You cannot remove your own admin access');
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = String(email).toLowerCase().trim();
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
    if (req.user.id === req.params.id) {
        res.status(400);
        throw new Error('You cannot delete your own account');
    }

    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // 1. Get all listings owned by user
    const userListings = await Listing.find({ owner: req.params.id });
    const listingIds = userListings.map(l => l._id);

    // 2. Delete all data related to those listings (Cascading delete for listings)
    if (listingIds.length > 0) {
        await Promise.all([
            Booking.deleteMany({ listing: { $in: listingIds } }),
            Review.deleteMany({ listing: { $in: listingIds } }),
            Inquiry.deleteMany({ listing: { $in: listingIds } }),
            Favorite.deleteMany({ listingId: { $in: listingIds } }),
            Report.deleteMany({ listing: { $in: listingIds } }),
            Listing.deleteMany({ owner: req.params.id })
        ]);
    }

    // 3. Delete user's own activity (Bookings made, Reviews given, etc.)
    await Promise.all([
        Booking.deleteMany({ renter: req.params.id }),
        Review.deleteMany({ reviewer: req.params.id }),
        Inquiry.deleteMany({ sender: req.params.id }),
        Favorite.deleteMany({ userId: req.params.id }),
        Report.deleteMany({ reporter: req.params.id }),
        Notification.deleteMany({ user: req.params.id }),
        SavedSearch.deleteMany({ user: req.params.id }),
        Session.deleteMany({ userId: req.params.id }),
        BudgetPlan.deleteMany({ user: req.params.id }),
    ]);

    await user.deleteOne();

    res.status(200).json({ message: 'User and all associated data deleted successfully' });
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getStats = asyncHandler(async (req, res) => {
    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
        totalUsers, totalListings, pendingListings, approvedListings,
        renters, owners, brokers, newUsers,
    ] = await Promise.all([
        User.countDocuments(),
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'pending' }),
        Listing.countDocuments({ status: 'approved' }),
        User.countDocuments({ role: 'renter' }),
        User.countDocuments({ role: 'owner' }),
        User.countDocuments({ role: 'broker' }),
        User.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
    ]);

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

// @desc    Get all reports
// @route   GET /api/admin/reports
// @access  Private (Admin)
const getReports = asyncHandler(async (req, res) => {
    const { limit, skip } = adminPage(req.query);
    const [reports, total] = await Promise.all([
        Report.find()
            .populate('reporter', 'name email')
            .populate('listing', 'title images price status')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Report.countDocuments(),
    ]);
    res.set('X-Total-Count', String(total));
    res.status(200).json(reports);
});

// @desc    Update report status
// @route   PUT /api/admin/reports/:id/status
// @access  Private (Admin)
const updateReportStatus = asyncHandler(async (req, res) => {
    const { status } = req.body; // 'reviewed', 'dismissed'

    const report = await Report.findById(req.params.id);

    if (!report) {
        res.status(404);
        throw new Error('Report not found');
    }

    report.status = status;
    await report.save();

    res.status(200).json({ message: `Report status updated to ${status} successfully`, report });
});


module.exports = {
    getUsers,
    getUserDetails,
    updateUserStatus,
    updateUser,
    deleteUser,
    getStats,
    getReports,
    updateReportStatus
};
