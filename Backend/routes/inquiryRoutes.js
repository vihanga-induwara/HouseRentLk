const express = require('express');
const router = express.Router();
const {
    sendInquiry,
    getReceivedInquiries,
    getSentInquiries,
    getInquiry,
    replyToInquiry,
    closeInquiry,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const { sendInquirySchema, replyInquirySchema } = require('../validations/commonValidation');

router.use(protect);

router.post('/', validate(sendInquirySchema), sendInquiry);
router.get('/received', getReceivedInquiries);
router.get('/sent', getSentInquiries);
router.get('/:id', getInquiry);
router.post('/:id/reply', validate(replyInquirySchema), replyToInquiry);
router.put('/:id/close', closeInquiry);

module.exports = router;
