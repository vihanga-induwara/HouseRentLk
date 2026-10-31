const dotenv = require('dotenv');

// Load env vars before anything reads them
dotenv.config();

const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV || 'development',
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0),
    });
}

const cloudinary = require('cloudinary').v2;
const { validateEnv } = require('./config/env');
const connectDB = require('./config/db');
const { disconnectDB } = require('./config/db');

const start = async () => {
    validateEnv();

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // Only accept traffic once the database is reachable
    await connectDB();

    const app = require('./app');
    const PORT = process.env.PORT || 5000;
    const server = app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });

    const { startScheduler, stopScheduler } = require('./jobs/scheduler');
    startScheduler();

    // Graceful shutdown: stop accepting connections, finish in-flight requests, close DB
    let shuttingDown = false;
    const shutdown = (signal) => {
        if (shuttingDown) return;
        shuttingDown = true;
        console.log(`${signal} received, shutting down`);
        stopScheduler();
        server.close(async () => {
            await disconnectDB().catch(() => { });
            await Sentry.close(2000).catch(() => { });
            process.exit(0);
        });
        // Force exit if connections do not drain in time
        setTimeout(() => process.exit(1), 10000).unref();
    };
    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled promise rejection:', reason);
    Sentry.captureException(reason);
});

start().catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
});
