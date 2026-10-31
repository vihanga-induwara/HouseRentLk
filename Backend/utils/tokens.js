const crypto = require('crypto');

// Random URL-safe token; only its hash is stored in the database
const createToken = () => {
    const token = crypto.randomBytes(32).toString('hex');
    return { token, hash: hashToken(token) };
};

const hashToken = (token) => crypto.createHash('sha256').update(String(token)).digest('hex');

// 6-digit numeric one-time code
const createOtp = () => String(crypto.randomInt(0, 1000000)).padStart(6, '0');

// Constant-time comparison of two hex hashes
const safeEqual = (a, b) => {
    if (!a || !b || a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

module.exports = { createToken, hashToken, createOtp, safeEqual };
