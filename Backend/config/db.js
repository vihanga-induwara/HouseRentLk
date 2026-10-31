const mongoose = require('mongoose');

const MAX_ATTEMPTS = 5;
const RETRY_DELAY_MS = 5000;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Connect with a few retries so a brief database outage during deploy does not
// crash the container. Throws after the last attempt.
const connectDB = async () => {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const conn = await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 10000,
            });
            console.log(`MongoDB Connected: ${conn.connection.host}`);
            return conn;
        } catch (error) {
            console.error(`MongoDB connection attempt ${attempt}/${MAX_ATTEMPTS} failed: ${error.message}`);
            if (attempt === MAX_ATTEMPTS) throw error;
            await wait(RETRY_DELAY_MS);
        }
    }
};

const disconnectDB = () => mongoose.connection.close(false);

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
