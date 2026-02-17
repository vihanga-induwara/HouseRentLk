const express = require('express');
const router = express.Router();
const {
    getAdminListings,
    updateListingStatus,
} = require('../controllers/listingController');
const {
    getUsers,
    getUserDetails,
    updateUserStatus,
    getStats
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(authorize('admin'));

// Listing Management
router.get('/listings', getAdminListings);
router.put('/listings/:id/status', updateListingStatus);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);

// Dashboard Stats
router.get('/stats', getStats);

module.exports = router;
