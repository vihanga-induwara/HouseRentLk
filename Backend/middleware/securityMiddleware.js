const xss = require('xss');

// Recursive function to sanitize object keys (NoSQL prevention)
const sanitizeNoSQL = (obj) => {
    if (Array.isArray(obj)) {
        obj.forEach((item) => sanitizeNoSQL(item));
    } else if (typeof obj === 'object' && obj !== null) {
        Object.keys(obj).forEach((key) => {
            // Remove keys containing `$` or `.`
            if (key.includes('$') || key.includes('.')) {
                delete obj[key];
            } else {
                sanitizeNoSQL(obj[key]);
            }
        });
    }
    return obj;
};

// Recursive function to sanitize strings (XSS prevention)
const sanitizeXSS = (obj) => {
    if (typeof obj === 'string') {
        return xss(obj); // Sanitize string
    } else if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeXSS(item));
    } else if (typeof obj === 'object' && obj !== null) {
        const sanitizedObj = {};
        for (const [key, value] of Object.entries(obj)) {
            sanitizedObj[key] = sanitizeXSS(value);
        }
        return sanitizedObj;
    }
    return obj;
};

const securityMiddleware = (req, res, next) => {
    try {
        if (req.body) {
            req.body = sanitizeNoSQL(req.body);
            req.body = sanitizeXSS(req.body);
        }
        if (req.query) {
            req.query = sanitizeNoSQL(req.query);
            req.query = sanitizeXSS(req.query);
        }
        if (req.params) {
            req.params = sanitizeNoSQL(req.params);
            req.params = sanitizeXSS(req.params);
        }
        next();
    } catch (error) {
        console.error('Sanitization Error:', error);
        res.status(400).json({ message: 'Invalid payload detected' });
    }
};

module.exports = { securityMiddleware };
