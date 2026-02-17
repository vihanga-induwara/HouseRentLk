const express = require('express');
const router = express.Router();
const {
    trackSearch,
    trackActivity,
    saveFavorite,
    removeFavorite,
    getFavorites,
    getSearchHistory
} = require('../controllers/trackingController');
const { protect } = require('../middleware/authMiddleware');

// Public tracking (can work without auth)
router.post('/search', trackSearch);
router.post('/activity', trackActivity);

// Protected routes
router.get('/search-history', protect, getSearchHistory);

module.exports = router;
