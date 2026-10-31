const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    checkEmail,
    logoutUser,
    sendEmailVerification,
    verifyEmail,
    sendPhoneOtp,
    verifyPhoneOtp,
    forgotPassword,
    resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    verifyEmailSchema,
    sendPhoneOtpSchema,
    verifyPhoneSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} = require('../validations/authValidation');

// Strict limiter for credential and verification endpoints (per IP)
const sensitiveLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts. Please try again in 15 minutes.' },
});

router.post('/register', sensitiveLimiter, validate(registerSchema), registerUser);
router.post('/login', sensitiveLimiter, validate(loginSchema), loginUser);
router.post('/logout', logoutUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.get('/check-email', sensitiveLimiter, checkEmail);

router.post('/verify-email/send', protect, sensitiveLimiter, sendEmailVerification);
router.post('/verify-email', sensitiveLimiter, validate(verifyEmailSchema), verifyEmail);
router.post('/verify-phone/send', protect, sensitiveLimiter, validate(sendPhoneOtpSchema), sendPhoneOtp);
router.post('/verify-phone', protect, sensitiveLimiter, validate(verifyPhoneSchema), verifyPhoneOtp);

router.post('/forgot-password', sensitiveLimiter, validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', sensitiveLimiter, validate(resetPasswordSchema), resetPassword);

module.exports = router;
