const express = require('express');
const router = express.Router();
const { addReview, getListingReviews, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { addReviewSchema } = require('../validations/reviewValidation');

router.route('/')
    .post(protect, validate(addReviewSchema), addReview);

router.get('/:listingId', getListingReviews);

router.delete('/:id', protect, deleteReview);

module.exports = router;
