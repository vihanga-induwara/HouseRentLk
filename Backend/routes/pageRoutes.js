const express = require('express');
const router = express.Router();
const { getPages, getPageBySlug, upsertPage } = require('../controllers/pageController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getPages);
router.get('/:slug', getPageBySlug);
router.post('/', protect, authorize('admin'), upsertPage);

module.exports = router;
