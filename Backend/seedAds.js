const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs = require('fs');
const Listing = require('./models/Listing');
const User = require('./models/User');

dotenv.config();

// Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const towns = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Matara', 'Batticaloa', 'Trincomalee', 'Kurunegala', 'Ratnapura', 'Panadura', 'Kalutara', 'Gampaha', 'Wattala', 'Kiribathgoda', 'Kadawatha', 'Mount Lavinia', 'Dehiwala', 'Nugegoda', 'Kotte', 'Malabe', 'Thalawathugoda', 'Battaramulla', 'Rajagiriya', 'Pita Kotte', 'Ethul Kotte', 'Madiwela'];
const types = ['House', 'Boarding Room', 'Annex', 'Apartment'];
const descriptions = [
    'A beautiful place with a great view and a quiet environment.',
    'Modern living in the heart of the city, close to all amenities.',
    'Spacious rooms with natural light, perfect for a small family.',
    'Cozy and affordable space for students or professionals.',
    'Luxury residence with high-end finishes and premium security.',
    'Charming traditional style house with a large garden area.',
    'Updated apartment with new appliances and sleek design.',
    'Peaceful neighborhood with easy access to public transport.',
    'Ideal for those seeking privacy and comfort in a prime location.',
    'Well-maintained property with all necessary facilities included.'
];

const seedAds = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Find or create a user to be the owner
        let user = await User.findOne({ email: 'admin@houserentlk.com' });
        if (!user) {
            console.log('No admin user found. Creating a temporary owner...');
            user = await User.create({
                name: 'System Owner',
                email: 'owner@houserentlk.com',
                password: 'password123',
                role: 'owner',
                phone: '+94 77 111 2222',
                isVerified: true
            });
        }

        // Clear existing listings to start fresh
        await Listing.deleteMany();
        console.log('Previous listings cleared.');

        const ads = [];
        const imgFolderPath = path.join(__dirname, '../img'); // Correct relative path from Backend/ to img/ at root

        // Get all unique images from the img folder
        const localImages = [
            'IMG-20240309-WA0002.jpg', 'IMG-20240309-WA0003.jpg', 'IMG-20240309-WA0004.jpg',
            'IMG-20240309-WA0005.jpg', 'IMG-20240309-WA0006.jpg', 'IMG-20240309-WA0007.jpg',
            'IMG-20240309-WA0008.jpg', 'IMG-20240309-WA0009.jpg', 'IMG-20240309-WA0010.jpg',
            'IMG-20240309-WA0011.jpg', 'IMG-20240309-WA0012.jpg', 'IMG-20240309-WA0013.jpg',
            'IMG-20240309-WA0014.jpg', 'IMG-20240309-WA0015.jpg', 'IMG-20240309-WA0016.jpg',
            'IMG-20240309-WA0017.jpg', 'IMG-20240309-WA0018.jpg', 'IMG-20240309-WA0019.jpg',
            'IMG-20240309-WA0020.jpg', 'IMG-20240309-WA0021.jpg', 'IMG-20240309-WA0022.jpg',
            'IMG-20240309-WA0023.jpg', 'IMG-20240309-WA0024.jpg', 'IMG-20240309-WA0025.jpg',
            'IMG-20240309-WA0026.jpg', 'IMG-20240309-WA0027.jpg', 'IMG-20240309-WA0028.jpg'
        ];

        console.log(`Starting upload of 27 images to Cloudinary...`);

        for (let i = 0; i < 27; i++) {
            const imageName = localImages[i];
            const imagePath = path.join(imgFolderPath, imageName);

            console.log(`Uploading [${i + 1}/27]: ${imageName}...`);

            // Upload to Cloudinary
            const uploadResult = await cloudinary.uploader.upload(imagePath, {
                folder: 'house_rent_lk_seeds',
            });

            const town = towns[i % towns.length];
            const type = types[i % types.length];
            const price = 25000 + (Math.floor(Math.random() * 20) * 5000);
            const beds = 1 + (i % 4);
            const baths = 1 + (i % 3);
            const size = 500 + (beds * 300) + (Math.floor(Math.random() * 500));

            // Randomly set some dates in the past
            const createdAt = new Date();
            createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 15));
            createdAt.setHours(createdAt.getHours() - Math.floor(Math.random() * 24));

            ads.push({
                owner: user._id,
                title: `${type} in ${town} - ${beds} Bedroom`,
                description: descriptions[i % descriptions.length],
                type: type,
                location: {
                    town: town,
                    street: `${i + 1}th Main Street`,
                    address: `${(i + 1) * 10}, ${town} Road, ${town}`,
                    coordinates: {
                        type: 'Point',
                        coordinates: [79.8612 + (Math.random() * 0.1), 6.9271 + (Math.random() * 0.1)]
                    }
                },
                price: price,
                beds: beds,
                baths: baths,
                size: size,
                furnished: i % 2 === 0 ? 'Furnished' : 'Unfurnished',
                amenities: {
                    ac: i % 3 === 0,
                    parking: i % 2 === 0,
                    wifi: i % 2 === 0,
                    attachedBath: true,
                    petsAllowed: i % 4 === 0,
                    security: i % 5 === 0
                },
                images: [uploadResult.secure_url],
                status: 'approved',
                createdAt: createdAt
            });
        }

        await Listing.insertMany(ads);
        console.log('Successfully uploaded 27 images and seeded 27 house ads.');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

seedAds();
