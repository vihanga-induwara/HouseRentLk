const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { createBookingSchema, updateBookingStatusSchema } = require('../validations/commonValidation');
const {
    createBooking,
    getMyBookings,
    updateBookingStatus
} = require('../controllers/bookingController');

router.route('/')
    .post(protect, validate(createBookingSchema), createBooking)
    .get(protect, getMyBookings);

router.route('/:id/status')
    .put(protect, validate(updateBookingStatusSchema), updateBookingStatus);

module.exports = router;
