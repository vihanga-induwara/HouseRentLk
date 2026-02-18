const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');
const Favorite = require('../models/Favorite');
const Inquiry = require('../models/Inquiry');
const { createNotification } = require('./notificationController');

// @desc    Get all listings (Public - Approved Only)
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
    // Only show approved listings that haven't expired
    const listings = await Listing.find({
        status: 'approved',
        $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } },
            { expiresAt: null }
        ]
    }).populate('owner', 'name email phone avatar');
    res.status(200).json(listings);
});

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email phone avatar');

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    // Increment views
    listing.views = (listing.views || 0) + 1;
    await listing.save({ validateBeforeSave: false });

    res.status(200).json(listing);
});

// @desc    Get my listings
// @route   GET /api/listings/my-listings
// @access  Private
const getMyListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find({ owner: req.user.id });
    res.status(200).json(listings);
});

const { spawn } = require('child_process');
const path = require('path');

// Helper to generate AI content
const generateAIContent = (listingData) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, '../ai_service.py');
        const pythonProcess = spawn('python', [scriptPath]);

        let dataString = '';

        pythonProcess.stdin.write(JSON.stringify(listingData));
        pythonProcess.stdin.end();

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`AI Service Error: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`AI Service exited with code ${code}`);
                resolve(null); // Return null on error so we don't block creation
                return;
            }
            try {
                const result = JSON.parse(dataString);
                resolve(result);
            } catch (error) {
                console.error('Failed to parse AI output', error);
                resolve(null);
            }
        });
    });
};

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Owner/Broker)
const createListing = asyncHandler(async (req, res) => {
    const listingData = { ...req.body, owner: req.user.id, status: 'pending' };

    // Auto-set expiry to 30 days from now
    listingData.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Generate AI Description
    try {
        const aiContent = await generateAIContent(listingData);
        if (aiContent) {
            listingData.aiDescription = {
                description: aiContent.description,
                townVibe: aiContent.townVibe,
                generatedAt: new Date()
            };
        }
    } catch (error) {
        console.error("AI Generation failed", error);
        // Continue creating listing without AI content
    }

    const listing = await Listing.create(listingData);
    res.status(201).json(listing);
});

// @desc    Update listing
// @route   PUT /api/listings/:id
// @access  Private (Owner/Admin)
const updateListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    // If owner updates, reset status to pending (unless admin)
    let updateData = req.body;
    if (req.user.role !== 'admin') {
        updateData.status = 'pending';
    }

    // Refresh AI Content if critical fields change
    if (updateData.description || updateData.location || updateData.amenities) {
        // Merge current listing data with update data for context
        const contextData = { ...listing.toObject(), ...updateData };
        try {
            const aiContent = await generateAIContent(contextData);
            if (aiContent) {
                updateData.aiDescription = {
                    description: aiContent.description,
                    townVibe: aiContent.townVibe,
                    generatedAt: new Date()
                };
            }
        } catch (error) {
            console.error("AI Update failed", error);
        }
    }

    const updatedListing = await Listing.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.status(200).json(updatedListing);
});

// @desc    Delete listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner/Admin)
const deleteListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    await listing.deleteOne();
    res.status(200).json({ id: req.params.id });
});

// @desc    Get all listings (Admin)
// @route   GET /api/admin/listings
// @access  Private (Admin)
const getAdminListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find().populate('owner', 'name email');
    res.status(200).json(listings);
});

// @desc    Update listing status (Admin)
// @route   PUT /api/admin/listings/:id/status
// @access  Private (Admin)
const updateListingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    listing.status = status;
    const updatedListing = await listing.save();

    // Notify the listing owner
    if (status === 'approved' || status === 'rejected') {
        await createNotification({
            userId: listing.owner,
            type: status === 'approved' ? 'listing_approved' : 'listing_rejected',
            title: status === 'approved' ? 'Listing Approved! 🎉' : 'Listing Rejected',
            message: status === 'approved'
                ? `Your listing "${listing.title}" has been approved and is now live!`
                : `Your listing "${listing.title}" was rejected. Please review and resubmit.`,
            link: '/my-listings',
        });
    }

    res.status(200).json(updatedListing);
});

// @desc    Toggle listing status (Owner: pause, rented, relist)
// @route   PUT /api/listings/:id/status
// @access  Private (Owner)
const toggleListingStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const allowedStatuses = ['paused', 'rented', 'pending']; // pending = relist

    if (!allowedStatuses.includes(status)) {
        res.status(400);
        throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(', ')}`);
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    listing.status = status;
    const updatedListing = await listing.save();
    res.status(200).json(updatedListing);
});

// @desc    Renew listing (reset expiry to 30 days)
// @route   PUT /api/listings/:id/renew
// @access  Private (Owner)
const renewListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    listing.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    listing.renewedAt = new Date();

    // If it was expired, set back to pending for re-approval
    if (listing.status === 'expired') {
        listing.status = 'pending';
    }

    const updatedListing = await listing.save();
    res.status(200).json(updatedListing);
});

// @desc    Get listing analytics
// @route   GET /api/listings/:id/analytics
// @access  Private (Owner/Admin)
const getListingAnalytics = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        res.status(401);
        throw new Error('Not authorized');
    }

    const favoriteCount = await Favorite.countDocuments({ listingId: listing._id, removed: false });
    const inquiryCount = await Inquiry.countDocuments({ listing: listing._id });

    res.status(200).json({
        views: listing.views || 0,
        favorites: favoriteCount,
        inquiries: inquiryCount,
        shares: listing.shares || 0,
        createdAt: listing.createdAt,
    });
});

// @desc    Get market insights (price comparison)
// @route   GET /api/listings/:id/market-insights
// @access  Private (Owner/Admin)
const getMarketInsights = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    // Get average price for similar properties in the same town
    const similarProperties = await Listing.aggregate([
        {
            $match: {
                status: 'approved',
                type: listing.type,
                'location.town': listing.location.town,
                _id: { $ne: listing._id }
            }
        },
        {
            $group: {
                _id: null,
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
                count: { $sum: 1 }
            }
        }
    ]);

    const insight = similarProperties[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0, count: 0 };

    res.status(200).json({
        yourPrice: listing.price,
        areaAverage: Math.round(insight.avgPrice),
        minPrice: insight.minPrice,
        maxPrice: insight.maxPrice,
        propertyCount: insight.count,
        difference: insight.avgPrice ? Math.round(((listing.price - insight.avgPrice) / insight.avgPrice) * 100) : 0
    });
});

// @desc    Duplicate listing
// @route   POST /api/listings/:id/duplicate
// @access  Private (Owner)
const duplicateListing = asyncHandler(async (req, res) => {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
        res.status(404);
        throw new Error('Listing not found');
    }

    if (listing.owner.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    const listingObj = listing.toObject();

    // Remove system fields
    delete listingObj._id;
    delete listingObj.id;
    delete listingObj.createdAt;
    delete listingObj.updatedAt;
    delete listingObj.views;
    delete listingObj.renewedAt;
    delete listingObj.aiDescription;

    // Reset status and set new expiry
    listingObj.status = 'pending';
    listingObj.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    listingObj.title = `${listingObj.title} (Copy)`;

    const duplicated = await Listing.create(listingObj);
    res.status(201).json(duplicated);
});

module.exports = {
    getListings,
    getListing,
    getMyListings,
    createListing,
    updateListing,
    deleteListing,
    getAdminListings,
    updateListingStatus,
    toggleListingStatus,
    renewListing,
    getListingAnalytics,
    duplicateListing,
    getMarketInsights,
};
