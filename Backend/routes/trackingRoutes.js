const express = require('express');
const router = express.Router();
const {
    trackSearch,
    trackActivity,
    saveFavorite,
    removeFavorite,
    getFavorites,
    getSearchHistory,
    trackShare
} = require('../controllers/trackingController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Public tracking (works for guests; attributes events to the user when logged in)
router.post('/search', optionalAuth, trackSearch);
router.post('/activity', optionalAuth, trackActivity);
router.post('/share/:listingId', optionalAuth, trackShare);

// Protected routes
router.get('/search-history', protect, getSearchHistory);

module.exports = router;
