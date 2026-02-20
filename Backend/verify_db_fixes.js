const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Listing = require('./models/Listing');
const Booking = require('./models/Booking');
const User = require('./models/User');

dotenv.config();

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync('verification_result.txt', msg + '\n');
};

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        log('MongoDB Connected');
    } catch (err) {
        log('Connection Error: ' + err.message);
        process.exit(1);
    }
};

const runVerification = async () => {
    // Clear previous log
    fs.writeFileSync('verification_result.txt', '');

    await connectDB();

    log('\n--- STARTING VERIFICATION ---\n');

    let testUser, testListing;

    try {
        // 1. Setup Data
        log('1. Setting up test data...');
        testUser = await User.create({
            name: 'Test QA User',
            email: `qa_test_${Date.now()}@example.com`,
            password: 'password123',
            role: 'owner'
        });

        testListing = await Listing.create({
            owner: testUser._id,
            title: 'QA Test Listing',
            description: 'Test description',
            type: 'House',
            location: {
                town: 'Test Town',
                street: 'Test St',
                address: '123 Test St',
                coordinates: {
                    type: 'Point',
                    coordinates: [79.8612, 6.9271] // Colombo coordinates
                }
            },
            price: 50000,
            beds: 2,
            baths: 1,
            size: 1000
        });

        log('   -> Created User: ' + testUser.email);
        log('   -> Created Listing: ' + testListing.title);

        // 2. Test Double Booking Constraint
        log('\n2. Testing Double Booking Prevention...');
        const bookingData = {
            listing: testListing._id,
            renter: testUser._id,
            owner: testUser._id,
            date: new Date(),
            timeSlot: '10:00 AM'
        };

        // First Booking - Should Succeed
        await Booking.create(bookingData);
        log('   -> First booking created successfully.');

        // Second Booking - Should Fail
        try {
            await Booking.create(bookingData);
            log('   [FAIL] Duplicate booking was ALLOWED! Index is missing or broken.');
        } catch (error) {
            if (error.code === 11000) {
                log('   [PASS] Duplicate booking was BLOCKED by Unique Index.');
            } else {
                log('   [FAIL] Creating duplicate booking failed but with unexpected error: ' + error.message);
            }
        }

    } catch (error) {
        log('Unexpected Error during test execution: ' + error.message);
    } finally {
        // 3. Cleanup
        log('\n3. Cleaning up...');
        if (testListing) {
            try {
                // Manually delete to clean up test artifacts
                await Booking.deleteMany({ listing: testListing._id });
                await Listing.deleteOne({ _id: testListing._id });
            } catch (e) { log('Error cleaning listing: ' + e.message); }
        }
        if (testUser) {
            try {
                await User.deleteOne({ _id: testUser._id });
            } catch (e) { log('Error cleaning user: ' + e.message); }
        }

        log('   -> Cleanup complete.');
        await mongoose.disconnect();
        log('\n--- VERIFICATION FINISHED ---');
    }
};

runVerification();
