const express = require('express');
const os = require('os');
const multer = require('multer');
// CSV bulk upload: temp file, deleted by the controller after parsing
const upload = multer({
    dest: os.tmpdir(),
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const isCsv = file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.toLowerCase().endsWith('.csv');
        cb(isCsv ? null : new Error('Only CSV files are allowed'), isCsv);
    },
});
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
    bulkUploadListings,
    getSimilarListings,
    reportListing,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Static routes (must be before /:id to avoid conflict)
router.get('/my-listings', protect, getMyListings);
router.post('/bulk-upload', protect, upload.single('file'), bulkUploadListings);
router.post('/report', protect, reportListing);

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
router.get('/:id/market-insights', getMarketInsights);
router.post('/:id/duplicate', protect, duplicateListing);
router.get('/:id/similar', getSimilarListings);

module.exports = router;
