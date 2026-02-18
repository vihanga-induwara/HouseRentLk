const express = require('express');
const router = express.Router();
const {
    getListings,
    getListing,
    getMyListings,
    createListing,
    updateListing,
    deleteListing,
    toggleListingStatus,
    renewListing,
    getListingAnalytics,
    duplicateListing,
    getMarketInsights,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// My Listings (must be before /:id to avoid conflict)
router.get('/my-listings', protect, getMyListings);

router.route('/')
    .get(getListings)
    .post(protect, createListing);

router.route('/:id')
    .get(getListing)
    .put(protect, updateListing)
    .delete(protect, deleteListing);

// Owner actions
router.put('/:id/status', protect, toggleListingStatus);
router.put('/:id/renew', protect, renewListing);
router.get('/:id/analytics', protect, getListingAnalytics);
router.get('/:id/market-insights', protect, getMarketInsights);
router.post('/:id/duplicate', protect, duplicateListing);

module.exports = router;
