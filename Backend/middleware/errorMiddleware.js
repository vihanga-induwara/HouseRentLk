const { isProduction } = require('../config/env');

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

// Map well-known library errors to a client-safe status and message
const normalizeError = (err, currentStatus) => {
    if (err.name === 'CastError') return { status: 404, message: 'Resource not found' };
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {}).map(e => e.message).join(', ') || 'Invalid data';
        return { status: 400, message };
    }
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0];
        return { status: 409, message: field ? `That ${field} is already in use` : 'Duplicate value' };
    }
    if (err.name === 'MulterError') return { status: 400, message: err.message };
    if (err.type === 'entity.too.large') return { status: 413, message: 'Request body is too large' };
    if (err.type === 'entity.parse.failed') return { status: 400, message: 'Malformed JSON body' };
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return { status: 401, message: 'Not authorized' };
    }

    const status = currentStatus && currentStatus !== 200 ? currentStatus : (err.status || err.statusCode || 500);
    // Never leak internal error details for unexpected server errors in production
    const message = status >= 500 && isProduction() ? 'Something went wrong. Please try again later.' : err.message;
    return { status, message };
};

// eslint-disable-next-line no-unused-vars -- Express needs the 4-argument signature
const errorHandler = (err, req, res, next) => {
    const { status, message } = normalizeError(err, res.statusCode);

    if (status >= 500) {
        console.error(JSON.stringify({
            level: 'error',
            requestId: req.id,
            method: req.method,
            path: req.originalUrl,
            message: err.message,
            stack: err.stack,
        }));
    }

    res.status(status).json({
        message,
        requestId: req.id,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

module.exports = { notFound, errorHandler, normalizeError };
