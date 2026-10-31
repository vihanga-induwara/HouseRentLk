const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { sendContactMessage, getContactMessages, updateContactMessageStatus } = require('../controllers/contactController');
const { protect, optionalAuth, authorize } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { contactSchema } = require('../validations/commonValidation');

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many messages. Please try again later.' },
    skip: () => process.env.NODE_ENV === 'test',
});

router.post('/', contactLimiter, optionalAuth, validate(contactSchema), sendContactMessage);
router.get('/', protect, authorize('admin'), getContactMessages);
router.put('/:id/status', protect, authorize('admin'), updateContactMessageStatus);

module.exports = router;
