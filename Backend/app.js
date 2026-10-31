// Express application. Has no side effects (no DB connection, no listen) so it can
// be imported by tests; server.js wires up the environment and starts it.
const crypto = require('crypto');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Sentry = require('@sentry/node');
const { allowedOrigins, isProduction } = require('./config/env');
const { securityMiddleware } = require('./middleware/securityMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Behind Railway/Cloudflare the client IP comes from X-Forwarded-For (rate limiting, sessions)
app.set('trust proxy', Number(process.env.TRUST_PROXY ?? (isProduction() ? 1 : 0)));
app.disable('x-powered-by');

// Request id for log correlation (echoed to the client)
app.use((req, res, next) => {
    req.id = req.get('x-request-id') || crypto.randomUUID();
    res.set('x-request-id', req.id);
    next();
});

app.use(helmet()); // Secure HTTP headers

// Logging: JSON lines in production, compact in development, silent in tests
if (process.env.NODE_ENV !== 'test') {
    morgan.token('id', (req) => req.id);
    morgan.token('user', (req) => req.user?.id || '-');
    app.use(isProduction()
        ? morgan((tokens, req, res) => JSON.stringify({
            level: 'info',
            requestId: tokens.id(req, res),
            method: tokens.method(req, res),
            path: tokens.url(req, res),
            status: Number(tokens.status(req, res)),
            durationMs: Number(tokens['response-time'](req, res)),
            ip: req.ip,
        }), { skip: (req) => req.path === '/health' })
        : morgan('dev'));
}

const origins = allowedOrigins();
app.use(cors({
    origin: (origin, callback) => {
        // Non-browser requests (no Origin header) are allowed; browsers must match the allow-list
        if (!origin || origins.includes(origin)) return callback(null, true);
        return callback(null, false);
    },
    credentials: true,
}));

// Body parsing, then sanitization (must run after the body is parsed)
app.use(express.json({ limit: '1mb' }));
app.use(securityMiddleware); // Custom NoSQL and XSS sanitization

// Minimal cookie parser (only the auth cookie is used)
app.use((req, res, next) => {
    req.cookies = {};
    (req.headers.cookie || '').split(';').forEach((pair) => {
        const index = pair.indexOf('=');
        if (index < 1) return;
        const key = pair.slice(0, index).trim();
        try {
            req.cookies[key] = decodeURIComponent(pair.slice(index + 1).trim());
        } catch {
            // Ignore malformed cookie values instead of failing the request
        }
    });
    next();
});

// CSRF guard: cookie-authenticated state-changing requests must come from an allowed
// origin or carry the X-Requested-With header (which cross-site forms cannot send).
app.use((req, res, next) => {
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method) || !req.cookies.jwt) return next();
    const origin = req.get('origin');
    if ((origin && origins.includes(origin)) || req.get('x-requested-with') === 'XMLHttpRequest') return next();
    return res.status(403).json({ message: 'Cross-site request blocked' });
});

// Health checks (before rate limiting so platform probes are never throttled)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
});
app.get('/ready', (req, res) => {
    const dbReady = mongoose.connection.readyState === 1;
    res.status(dbReady ? 200 : 503).json({ status: dbReady ? 'ready' : 'unavailable', database: dbReady ? 'connected' : 'disconnected' });
});

// Rate limiting (per client IP; requires trust proxy behind a load balancer)
const limiter = (windowMinutes, max, message) => rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
});

app.use('/api', limiter(15, Number(process.env.RATE_LIMIT_MAX || 1000), 'Too many requests, please try again in a few minutes'));
app.use('/api/ai', limiter(15, 60, 'Too many AI requests, please try again in 15 minutes'));
app.post('/api/inquiries', limiter(60, 30, 'Too many messages sent, please try again later'));
app.post('/api/inquiries/:id/reply', limiter(60, 60, 'Too many messages sent, please try again later'));
app.post('/api/bookings', limiter(60, 20, 'Too many viewing requests, please try again later'));
app.post('/api/listings/report', limiter(60, 10, 'Too many reports, please try again later'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/listings', require('./routes/listingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/tracking', require('./routes/trackingRoutes'));
app.use('/api/favorites', require('./routes/favoriteRoutes'));
app.use('/api/inquiries', require('./routes/inquiryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/verification', require('./routes/verificationRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/saved-searches', require('./routes/savedSearchRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/scraping', require('./routes/scrapingRoutes'));
app.use('/api/pages', require('./routes/pageRoutes'));
app.use('/api/budget-plans', require('./routes/budgetPlanRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Legacy local uploads (demo data only; production uploads live in Cloudinary)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), { fallthrough: true, maxAge: '7d' }));

app.get('/', (req, res) => {
    res.json({ name: 'HouseRentLk API', status: 'ok' });
});

// Error Handling Middleware
app.use(notFound);
if (process.env.SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app, {
        shouldHandleError: (error) => !error.status || error.status >= 500,
    });
}
app.use(errorHandler);

module.exports = app;
