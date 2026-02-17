const express = require('express');
const router = express.Router();
const {
    getListings,
    getListing,
    createListing,
    updateListing,
    deleteListing,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
    .get(getListings)
    .post(protect, createListing); // Allow all authenticated users to post

router.route('/:id')
    .get(getListing)
    .put(protect, updateListing) // Allow owner to update their own listing (checked in controller)
    .delete(protect, deleteListing); // Allow owner to delete their own listing (checked in controller)

module.exports = router;
