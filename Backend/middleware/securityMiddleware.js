const xss = require('xss');

// Recursively remove keys containing `$` or `.` (NoSQL operator injection), in place
const sanitizeNoSQL = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach((item) => sanitizeNoSQL(item));
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
            if (key.startsWith('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitizeNoSQL(obj[key]);
            }
        });
    }
    return obj;
};

// Secrets must reach the controller byte-for-byte (they are hashed, never rendered)
const RAW_KEYS = new Set(['password', 'currentPassword', 'newPassword', 'token', 'otp']);

// Recursively escape HTML in string values (XSS prevention), in place
const sanitizeXSS = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach((item, i) => {
            if (typeof item === 'string') obj[i] = xss(item);
            else sanitizeXSS(item);
        });
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
            if (RAW_KEYS.has(key)) return;
            if (typeof obj[key] === 'string') obj[key] = xss(obj[key]);
            else sanitizeXSS(obj[key]);
        });
    }
    return obj;
};

const sanitize = (obj) => sanitizeXSS(sanitizeNoSQL(obj));

// Must run AFTER express.json() so req.body is populated.
// Objects are mutated in place because req.query is a read-only getter in Express 5.
const securityMiddleware = (req, res, next) => {
    try {
        if (req.body && typeof req.body === 'object') sanitize(req.body);
        if (req.query && typeof req.query === 'object') sanitize(req.query);
        next();
    } catch (error) {
        console.error('Sanitization Error:', error);
        res.status(400).json({ message: 'Invalid payload detected' });
    }
};

module.exports = { securityMiddleware, sanitizeNoSQL };
