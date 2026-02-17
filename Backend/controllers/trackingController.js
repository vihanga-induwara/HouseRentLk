const asyncHandler = require('express-async-handler');
const SearchHistory = require('../models/SearchHistory');
const UserActivity = require('../models/UserActivity');
const Favorite = require('../models/Favorite');

// @desc    Track search query
// @route   POST /api/tracking/search
// @access  Public (can track both logged in and guest searches)
const trackSearch = asyncHandler(async (req, res) => {
    const { keyword, filters, resultsCount } = req.body;

    const searchRecord = await SearchHistory.create({
        userId: req.user?._id, // Optional, guest users won't have this
        keyword,
        filters,
        resultsCount
    });

    res.status(201).json({ message: 'Search tracked' });
});

// @desc    Track user activity on listing
// @route   POST /api/tracking/activity
// @access  Public
const trackActivity = asyncHandler(async (req, res) => {
    const { listingId, action, duration } = req.body;

    const activity = await UserActivity.create({
        userId: req.user?._id,
        listingId,
        action,
        duration
    });

    res.status(201).json({ message: 'Activity tracked' });
});

// @desc    Save listing to favorites
// @route   POST /api/favorites
// @access  Private
const saveFavorite = asyncHandler(async (req, res) => {
    const { listingId } = req.body;

    // Check if already favorited
    const existing = await Favorite.findOne({
        userId: req.user._id,
        listingId,
        removed: false
    });

    if (existing) {
        res.status(400);
        throw new Error('Already in favorites');
    }

    // Check if previously removed, then reactivate
    const removed = await Favorite.findOne({
        userId: req.user._id,
        listingId,
        removed: true
    });

    if (removed) {
        removed.removed = false;
        removed.removedAt = null;
        removed.savedAt = Date.now();
        await removed.save();
        return res.status(200).json(removed);
    }

    const favorite = await Favorite.create({
        userId: req.user._id,
        listingId
    });

    res.status(201).json(favorite);
});

// @desc    Remove listing from favorites
// @route   DELETE /api/favorites/:listingId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
    const favorite = await Favorite.findOne({
        userId: req.user._id,
        listingId: req.params.listingId,
        removed: false
    });

    if (!favorite) {
        res.status(404);
        throw new Error('Favorite not found');
    }

    favorite.removed = true;
    favorite.removedAt = Date.now();
    await favorite.save();

    res.status(200).json({ message: 'Removed from favorites' });
});

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = asyncHandler(async (req, res) => {
    const favorites = await Favorite.find({
        userId: req.user._id,
        removed: false
    }).populate('listingId').sort({ savedAt: -1 });

    res.status(200).json(favorites);
});

// @desc    Get user's search history
// @route   GET /api/tracking/search-history
// @access  Private
const getSearchHistory = asyncHandler(async (req, res) => {
    const history = await SearchHistory.find({ userId: req.user._id })
        .sort({ searchedAt: -1 })
        .limit(50);

    res.status(200).json(history);
});

module.exports = {
    trackSearch,
    trackActivity,
    saveFavorite,
    removeFavorite,
    getFavorites,
    getSearchHistory
};
