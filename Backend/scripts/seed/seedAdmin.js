const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../../models/User');

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Usage: SEED_ADMIN_EMAIL=... SEED_ADMIN_PASSWORD=... npm run seed:admin
const seedAdmin = async () => {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;

    if (!email || !password) {
        console.error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set.');
        process.exit(1);
    }

    if (password.length < 12) {
        console.error('SEED_ADMIN_PASSWORD must be at least 12 characters.');
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        const adminExists = await User.findOne({ email });

        if (adminExists) {
            console.log(`User ${email} already exists`);
            process.exit();
        }

        await User.create({
            name: 'Super Admin',
            email,
            password, // Will be hashed by pre-save hook
            role: 'admin',
            bio: 'System Administrator',
            isVerified: true
        });

        console.log(`Admin user ${email} created successfully`);

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAdmin();
