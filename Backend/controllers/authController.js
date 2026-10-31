const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Session = require('../models/Session');
const { parseUserAgent } = require('../utils/userAgent');
const { createToken, hashToken, createOtp, safeEqual } = require('../utils/tokens');
const { sendEmail, actionEmail } = require('../services/emailService');
const { sendSms, normalizePhone } = require('../services/smsService');
const { BLOCKED_STATUSES } = require('../middleware/authMiddleware');

const SESSION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const EMAIL_TOKEN_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_TOKEN_MS = 60 * 60 * 1000; // 1 hour
const OTP_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between sends
const MAX_OTP_ATTEMPTS = 5;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Min 8 chars with upper, lower and a digit
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const PASSWORD_RULE = 'Password must be at least 8 characters and include uppercase, lowercase, and numbers.';

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').split(',')[0].trim();

// Cookie options shared by login, register, profile update and logout.
// COOKIE_SAMESITE=none is needed when the frontend and API are on different sites.
const cookieOptions = () => {
    const sameSite = process.env.COOKIE_SAMESITE || 'lax';
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || sameSite === 'none',
        sameSite,
        path: '/',
        ...(process.env.COOKIE_DOMAIN ? { domain: process.env.COOKIE_DOMAIN } : {}),
    };
};

// Generate JWT
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('FATAL: JWT_SECRET environment variable is missing.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const setAuthCookie = (res, userId) => {
    res.cookie('jwt', generateToken(userId), { ...cookieOptions(), maxAge: SESSION_MS });
};

// Case-insensitive email lookup (older accounts may have been stored with capitals)
const EMAIL_COLLATION = { locale: 'en', strength: 2 };
const findByEmail = (email) => User.findOne({ email: String(email).trim() }).collation(EMAIL_COLLATION);
const emailTaken = (email) => User.exists({ email: String(email).trim() }).collation(EMAIL_COLLATION);

const cooldownRemaining = (sentAt) => {
    if (!sentAt) return 0;
    return Math.max(0, RESEND_COOLDOWN_MS - (Date.now() - new Date(sentAt).getTime()));
};

// Store a fresh email-verification token on the user and email the link
const issueEmailVerification = async (user) => {
    const { token, hash } = createToken();
    user.emailVerificationToken = hash;
    user.emailVerificationExpires = new Date(Date.now() + EMAIL_TOKEN_MS);
    user.emailVerificationSentAt = new Date();
    await user.save();

    await sendEmail({
        to: user.email,
        subject: 'Verify your HouseRentLk email',
        ...actionEmail({
            heading: `Hi ${user.name}, confirm your email`,
            message: 'Please confirm your email address to start posting ads on HouseRentLk. This link expires in 24 hours.',
            actionText: 'Verify email',
            actionUrl: `${frontendUrl()}/verify-email/${token}`,
        }),
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, preferences } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    if (!EMAIL_REGEX.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    if (!PASSWORD_REGEX.test(password)) {
        res.status(400);
        throw new Error(PASSWORD_RULE);
    }

    if (role && !['renter', 'owner', 'broker'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    if (await emailTaken(normalizedEmail)) {
        res.status(400);
        throw new Error('User already exists');
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password, // Hashed by the User model pre('save') hook
        role: role || 'renter',
        phone,
        preferences: preferences || {},
        lastLogin: Date.now()
    });

    // Best effort: registration must not fail because email delivery failed
    try {
        await issueEmailVerification(user);
    } catch (error) {
        console.error('Failed to send verification email:', error.message);
    }

    setAuthCookie(res, user._id);
    res.status(201).json(user.toJSON());
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401);
        throw new Error('Invalid credentials');
    }

    if (BLOCKED_STATUSES.includes(user.status)) {
        res.status(403);
        throw new Error(`Your account is ${user.status}. Please contact support.`);
    }

    user.lastLogin = Date.now();
    await user.save();

    // Create session record
    const deviceInfo = parseUserAgent(req.headers['user-agent'] || '');
    await Session.create({
        userId: user._id,
        ipAddress: req.ip,
        ...deviceInfo,
        loginAt: Date.now()
    });

    setAuthCookie(res, user._id);
    res.json(user.toJSON());
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user.toJSON());
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const { name, email, phone, bio, avatar, preferences, password, currentPassword } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar) user.avatar = avatar;

    if (email && email.toLowerCase().trim() !== user.email) {
        const normalizedEmail = email.toLowerCase().trim();
        if (!EMAIL_REGEX.test(normalizedEmail)) {
            res.status(400);
            throw new Error('Invalid email format');
        }
        if (await emailTaken(normalizedEmail)) {
            res.status(400);
            throw new Error('That email is already in use');
        }
        user.email = normalizedEmail;
        user.isEmailVerified = false; // must re-verify the new address
    }

    if (phone !== undefined && phone !== user.phone) {
        user.phone = phone;
        user.isPhoneVerified = false; // must re-verify the new number
    }

    // Update preferences if provided
    if (preferences) {
        user.preferences = { ...user.preferences, ...preferences };
    }

    if (password) {
        if (!currentPassword || !(await bcrypt.compare(currentPassword, user.password))) {
            res.status(400);
            throw new Error('Current password is incorrect');
        }
        if (!PASSWORD_REGEX.test(password)) {
            res.status(400);
            throw new Error(PASSWORD_RULE);
        }
        user.password = password; // Hashed by the pre('save') hook
    }

    const updatedUser = await user.save();

    setAuthCookie(res, updatedUser._id);
    res.json(updatedUser.toJSON());
});

// @desc    Check if email exists
// @route   GET /api/auth/check-email
// @access  Public
const checkEmail = asyncHandler(async (req, res) => {
    const { email } = req.query;

    if (!email || typeof email !== 'string') {
        res.status(400);
        throw new Error('Please provide an email');
    }

    if (!EMAIL_REGEX.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    const userExists = await emailTaken(email);

    res.status(200).json({ exists: !!userExists });
});

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
    res.clearCookie('jwt', cookieOptions());
    res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Send (or resend) the email verification link
// @route   POST /api/auth/verify-email/send
// @access  Private
const sendEmailVerification = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
        return res.status(200).json({ message: 'Email is already verified' });
    }

    const wait = cooldownRemaining(user.emailVerificationSentAt);
    if (wait > 0) {
        res.status(429);
        throw new Error(`Please wait ${Math.ceil(wait / 1000)} seconds before requesting another email`);
    }

    await issueEmailVerification(user);
    res.status(200).json({ message: `Verification email sent to ${user.email}` });
});

// @desc    Confirm an email verification token
// @route   POST /api/auth/verify-email
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.body;

    const user = await User.findOne({
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
        res.status(400);
        throw new Error('This verification link is invalid or has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
});

// @desc    Send a one-time code to the user's phone
// @route   POST /api/auth/verify-phone/send
// @access  Private
const sendPhoneOtp = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const phone = normalizePhone(req.body.phone || user.phone);

    if (!phone) {
        res.status(400);
        throw new Error('Please enter a valid Sri Lankan mobile number');
    }

    const wait = cooldownRemaining(user.phoneOtpSentAt);
    if (wait > 0) {
        res.status(429);
        throw new Error(`Please wait ${Math.ceil(wait / 1000)} seconds before requesting another code`);
    }

    const otp = createOtp();
    if (user.phone !== phone) {
        user.phone = phone;
        user.isPhoneVerified = false;
    }
    user.phoneOtpHash = hashToken(`${user._id}:${otp}`);
    user.phoneOtpExpires = new Date(Date.now() + OTP_MS);
    user.phoneOtpAttempts = 0;
    user.phoneOtpSentAt = new Date();
    await user.save();

    await sendSms(phone, `Your HouseRentLk verification code is ${otp}. It expires in 10 minutes.`);
    res.status(200).json({ message: `Verification code sent to ${phone}` });
});

// @desc    Confirm the phone one-time code
// @route   POST /api/auth/verify-phone
// @access  Private
const verifyPhoneOtp = asyncHandler(async (req, res) => {
    const { otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user.phoneOtpHash || !user.phoneOtpExpires || user.phoneOtpExpires < new Date()) {
        res.status(400);
        throw new Error('The code has expired. Please request a new one');
    }

    if (user.phoneOtpAttempts >= MAX_OTP_ATTEMPTS) {
        res.status(429);
        throw new Error('Too many attempts. Please request a new code');
    }

    if (!safeEqual(hashToken(`${user._id}:${otp}`), user.phoneOtpHash)) {
        user.phoneOtpAttempts += 1;
        await user.save();
        res.status(400);
        throw new Error('Incorrect code');
    }

    user.isPhoneVerified = true;
    user.phoneOtpHash = undefined;
    user.phoneOtpExpires = undefined;
    user.phoneOtpAttempts = 0;
    await user.save();

    res.status(200).json({ message: 'Phone number verified successfully' });
});

// @desc    Email a password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const genericMessage = 'If an account exists for that email, a reset link has been sent.';
    const user = await findByEmail(req.body.email);

    // Same response whether or not the account exists (prevents account enumeration)
    if (!user || BLOCKED_STATUSES.includes(user.status)) {
        return res.status(200).json({ message: genericMessage });
    }

    const { token, hash } = createToken();
    user.passwordResetToken = hash;
    user.passwordResetExpires = new Date(Date.now() + RESET_TOKEN_MS);
    await user.save();

    try {
        await sendEmail({
            to: user.email,
            subject: 'Reset your HouseRentLk password',
            ...actionEmail({
                heading: 'Reset your password',
                message: 'We received a request to reset your password. This link expires in 1 hour.',
                actionText: 'Reset password',
                actionUrl: `${frontendUrl()}/reset-password/${token}`,
            }),
        });
    } catch (error) {
        console.error('Failed to send password reset email:', error.message);
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        res.status(503);
        throw new Error('Could not send the reset email right now. Please try again later.');
    }

    res.status(200).json({ message: genericMessage });
});

// @desc    Set a new password using a reset token
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (!PASSWORD_REGEX.test(password || '')) {
        res.status(400);
        throw new Error(PASSWORD_RULE);
    }

    const user = await User.findOne({
        passwordResetToken: hashToken(token),
        passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
        res.status(400);
        throw new Error('This reset link is invalid or has expired');
    }

    user.password = password; // Hashed by the pre('save') hook; also invalidates old sessions
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Receiving the reset email proves ownership of the address
    user.isEmailVerified = true;
    await user.save();

    res.status(200).json({ message: 'Password updated. You can now log in.' });
});

module.exports = {
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
};
