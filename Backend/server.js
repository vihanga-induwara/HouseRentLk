const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const cloudinary = require('cloudinary').v2;
const helmet = require('helmet');
const morgan = require('morgan');

// Load env vars
dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Connect to database
connectDB();

const app = express();

// Security Middlewares
app.use(helmet()); // Secure HTTP headers

// Logging middleware
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

// Body parsing, then sanitization (must run after the body is parsed)
app.use(express.json({ limit: '1mb' }));
const { securityMiddleware } = require('./middleware/securityMiddleware');
app.use(securityMiddleware); // Custom NoSQL and XSS sanitization
app.use((req, res, next) => {
    const { cookie } = req.headers;
    req.cookies = {};
    if (cookie) {
        cookie.split(';').forEach(c => {
            const parts = c.split('=');
            if (parts.length >= 2) {
                req.cookies[parts.shift().trim()] = decodeURIComponent(parts.join('='));
            }
        });
    }
    next();
});
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Rate Limiting
const rateLimit = require('express-rate-limit');

// General limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// Auth limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 login/register requests per hour
    message: 'Too many login attempts from this IP, please try again after an hour'
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/inquiries', authLimiter); // strict on inquiries too

// AI Limiter
const aiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 AI requests per 15 mins
    message: 'Too many AI requests from this IP, please try again after 15 minutes'
});
app.use('/api/ai', aiLimiter);

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

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling Middleware
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
