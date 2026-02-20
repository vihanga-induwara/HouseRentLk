const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Session = require('../models/Session');
const { parseUserAgent } = require('../utils/userAgent');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role, phone, preferences } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400);
        throw new Error('Invalid email format');
    }

    // Password strength validation (min 6 chars)
    if (password.length < 6) {
        res.status(400);
        throw new Error('Password must be at least 6 characters');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || 'renter',
        phone,
        preferences: preferences || {},
        lastLogin: Date.now()
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            preferences: user.preferences,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        // Update last login
        user.lastLogin = Date.now();
        await user.save();

        // Create session record
        const userAgentString = req.headers['user-agent'] || '';
        const deviceInfo = parseUserAgent(userAgentString);
        const ipAddress = req.ip || req.connection.remoteAddress;

        await Session.create({
            userId: user._id,
            ipAddress,
            ...deviceInfo,
            loginAt: Date.now()
        });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            preferences: user.preferences,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid credentials');
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.phone = req.body.phone || user.phone;
        user.bio = req.body.bio || user.bio;
        user.avatar = req.body.avatar || user.avatar;

        // Update preferences if provided
        if (req.body.preferences) {
            user.preferences = { ...user.preferences, ...req.body.preferences };
        }

        if (req.body.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            phone: updatedUser.phone,
            bio: updatedUser.bio,
            avatar: updatedUser.avatar,
            preferences: updatedUser.preferences,
            token: generateToken(updatedUser._id),
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Send OTP for verification
// @route   POST /api/auth/send-otp
// @access  Private
const sendOtp = asyncHandler(async (req, res) => {
    const { type } = req.body; // 'email' or 'phone'
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'email') {
        const success = await require('../utils/emailService').sendEmailOtp(user.email);
        if (success) {
            res.status(200).json({ message: 'Email OTP sent' });
        } else {
            res.status(500);
            throw new Error('Failed to send OTP via external service');
        }
    } else if (type === 'phone') {
        // SMS still uses local generation for now, or we could migrate it too?
        // User only asked for Email to use the new service. Keeping SMS as is for now.
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.phoneOtp = otp;
        user.phoneOtpExpires = expires;
        await user.save();
        await require('../utils/smsService').sendSmsOtp(user.phone, otp);
        res.status(200).json({ message: 'Phone OTP sent' });
    } else {
        res.status(400);
        throw new Error('Invalid verification type');
    }
});

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Private
const verifyOtp = asyncHandler(async (req, res) => {
    const { type, otp } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (type === 'email') {
        // External verification
        const isValid = await require('../utils/emailService').verifyEmailOtp(user.email, otp);
        if (isValid) {
            user.isEmailVerified = true;
            // Clean up legacy fields if they exist
            user.emailOtp = undefined;
            user.emailOtpExpires = undefined;
            await user.save();
            res.status(200).json({ message: 'Email verified successfully', isEmailVerified: true });
        } else {
            res.status(400);
            throw new Error('Invalid or expired OTP');
        }
    } else if (type === 'phone') {
        if (user.phoneOtp === otp && user.phoneOtpExpires > Date.now()) {
            user.isPhoneVerified = true;
            user.phoneOtp = undefined;
            user.phoneOtpExpires = undefined;
            await user.save();
            res.status(200).json({ message: 'Phone verified successfully', isPhoneVerified: true });
        } else {
            res.status(400);
            throw new Error('Invalid or expired OTP');
        }
    } else {
        res.status(400);
        throw new Error('Invalid verification type');
    }
});

module.exports = {
    registerUser,
    loginUser,
    getMe,
    updateProfile,
    sendOtp,
    verifyOtp
};
