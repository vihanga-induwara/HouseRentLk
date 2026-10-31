const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const Inquiry = require('../models/Inquiry');
const Booking = require('../models/Booking');
const Report = require('../models/Report');
const User = require('../models/User');

const DAY_MS = 24 * 60 * 60 * 1000;
const WINDOW_DAYS = 30;

const percentChange = (current, previous) => {
    if (!previous) return current > 0 ? null : 0; // null = no baseline to compare against
    return Math.round(((current - previous) / previous) * 1000) / 10;
};

// Count documents per listing town for a collection that references a listing
const countByListingTown = (Model, since) => Model.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $lookup: { from: 'listings', localField: 'listing', foreignField: '_id', as: 'l' } },
    { $unwind: '$l' },
    { $group: { _id: '$l.location.town', count: { $sum: 1 } } },
]);

// @desc    Get platform health and demand heatmap (computed from real activity)
// @route   GET /api/admin/health-analytics
// @access  Private (Admin)
const getPlatformHealth = asyncHandler(async (req, res) => {
    const now = Date.now();
    const since = new Date(now - WINDOW_DAYS * DAY_MS);
    const previousSince = new Date(now - 2 * WINDOW_DAYS * DAY_MS);

    const [
        supply, inquiries, bookings,
        newListings, prevListings, newUsers, prevUsers,
        approvedCount, pendingListings, pendingReports, pendingVerifications,
    ] = await Promise.all([
        Listing.aggregate([
            { $match: { status: 'approved' } },
            { $group: { _id: '$location.town', count: { $sum: 1 } } },
        ]),
        countByListingTown(Inquiry, since),
        countByListingTown(Booking, since),
        Listing.countDocuments({ createdAt: { $gte: since } }),
        Listing.countDocuments({ createdAt: { $gte: previousSince, $lt: since } }),
        User.countDocuments({ createdAt: { $gte: since } }),
        User.countDocuments({ createdAt: { $gte: previousSince, $lt: since } }),
        Listing.countDocuments({ status: 'approved' }),
        Listing.countDocuments({ status: 'pending' }),
        Report.countDocuments({ status: 'pending' }),
        User.countDocuments({ verificationStatus: 'pending' }),
    ]);

    // Demand = inquiries + viewing requests in the last 30 days, per town
    const towns = new Map();
    const entry = (town) => {
        if (!towns.has(town)) towns.set(town, { town, demand: 0, supplyCount: 0 });
        return towns.get(town);
    };
    supply.forEach(s => { if (s._id) entry(s._id).supplyCount = s.count; });
    [...inquiries, ...bookings].forEach(d => { if (d._id) entry(d._id).demand += d.count; });

    const maxDemand = Math.max(1, ...[...towns.values()].map(t => t.demand));
    const heatmap = [...towns.values()]
        .map(t => ({
            town: t.town,
            demandCount: t.demand,
            demandScore: Math.round((t.demand / maxDemand) * 100),
            supplyCount: t.supplyCount,
            ratio: Math.round((t.demand / Math.max(t.supplyCount, 1)) * 100) / 100,
        }))
        .sort((a, b) => b.demandCount - a.demandCount || b.supplyCount - a.supplyCount)
        .slice(0, 10);

    const recommendations = [];
    const undersupplied = heatmap.filter(t => t.demandCount >= 3 && t.ratio >= 2).map(t => t.town);
    if (undersupplied.length) recommendations.push(`High demand vs supply in ${undersupplied.slice(0, 3).join(', ')} — encourage owners to list there.`);
    if (pendingListings > 0) recommendations.push(`${pendingListings} listing(s) are waiting for approval.`);
    if (pendingReports > 0) recommendations.push(`${pendingReports} report(s) need review.`);
    if (pendingVerifications > 0) recommendations.push(`${pendingVerifications} identity verification(s) are pending.`);
    if (!recommendations.length) recommendations.push('No action needed right now.');

    res.json({
        windowDays: WINDOW_DAYS,
        platformPulse: {
            totalActivity: [...towns.values()].reduce((sum, t) => sum + t.demand, 0),
            newListings,
            listingGrowthPct: percentChange(newListings, prevListings),
            newUsers,
            userGrowthPct: percentChange(newUsers, prevUsers),
            openReportRate: approvedCount ? Math.round((pendingReports / approvedCount) * 1000) / 10 : 0,
        },
        heatmap,
        recommendations,
    });
});

// @desc    Get activity summary
// @route   GET /api/admin/activity-summary
// @access  Private (Admin)
const getActivitySummary = asyncHandler(async (req, res) => {
    const [totalListings, pendingListings, approvedListings] = await Promise.all([
        Listing.countDocuments(),
        Listing.countDocuments({ status: 'pending' }),
        Listing.countDocuments({ status: 'approved' }),
    ]);

    res.json({
        total: totalListings,
        pending: pendingListings,
        activeRate: totalListings > 0 ? ((approvedListings / totalListings) * 100).toFixed(1) + '%' : '0%'
    });
});

module.exports = {
    getPlatformHealth,
    getActivitySummary
};
