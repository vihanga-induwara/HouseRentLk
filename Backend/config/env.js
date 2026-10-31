// Validates environment variables once at startup so misconfiguration fails fast
// with a clear message instead of surfacing later as runtime errors.
const isProduction = () => process.env.NODE_ENV === 'production';

const REQUIRED = ['MONGO_URI', 'JWT_SECRET'];
const REQUIRED_IN_PRODUCTION = ['FRONTEND_URL', 'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'];
// Missing in production means the feature is disabled; warn so it is noticed
const RECOMMENDED_IN_PRODUCTION = {
    SMTP_HOST: 'email verification and password reset emails will fail',
    TWILIO_ACCOUNT_SID: 'SMS phone verification will fail',
    SENTRY_DSN: 'errors will only be logged to stdout',
};

const validateEnv = () => {
    const missing = REQUIRED.filter(key => !process.env[key]);
    if (isProduction()) missing.push(...REQUIRED_IN_PRODUCTION.filter(key => !process.env[key]));

    if (missing.length) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    if (isProduction() && process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters in production');
    }

    if (process.env.COOKIE_SAMESITE && !['lax', 'strict', 'none'].includes(process.env.COOKIE_SAMESITE)) {
        throw new Error('COOKIE_SAMESITE must be one of: lax, strict, none');
    }

    if (isProduction()) {
        Object.entries(RECOMMENDED_IN_PRODUCTION).forEach(([key, effect]) => {
            if (!process.env[key]) console.warn(`[env] ${key} is not set: ${effect}`);
        });
    }
};

// Allowed browser origins (comma-separated FRONTEND_URL)
const allowedOrigins = () => (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(origin => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

module.exports = { validateEnv, allowedOrigins, isProduction };
