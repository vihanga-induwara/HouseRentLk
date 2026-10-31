const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const BLOCKED_STATUSES = ['suspended', 'blocked'];

const getToken = (req) => {
    // Check cookie first, or fallback to Bearer token
    if (req.cookies && req.cookies.jwt) return req.cookies.jwt;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) return header.split(' ')[1];
    return null;
};

// Resolve the user for a token, or null when the token/user is not acceptable
const resolveUser = async (token) => {
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return { error: 'Not authorized, invalid or expired token' };
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return { error: 'User no longer exists' };
    if (user.changedPasswordAfter(decoded.iat)) return { error: 'Password was changed, please log in again' };
    if (BLOCKED_STATUSES.includes(user.status)) return { error: `Account ${user.status}`, status: 403 };
    return { user };
};

const protect = asyncHandler(async (req, res, next) => {
    const token = getToken(req);

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }

    const { user, error, status } = await resolveUser(token);
    if (error) {
        res.status(status || 401);
        throw new Error(error);
    }

    req.user = user;
    next();
});

// Attach req.user when a valid session exists, but never reject the request
const optionalAuth = asyncHandler(async (req, res, next) => {
    const token = getToken(req);
    if (token) {
        const { user } = await resolveUser(token);
        if (user) req.user = user;
    }
    next();
});

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            res.status(403);
            throw new Error(
                `User role ${req.user.role} is not authorized to access this route`
            );
        }
        next();
    };
};

module.exports = { protect, optionalAuth, authorize, BLOCKED_STATUSES };
