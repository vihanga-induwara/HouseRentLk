const asyncHandler = require('express-async-handler');
const Listing = require('../models/Listing');

// @desc    Get all listings (Public - Approved Only)
// @route   GET /api/listings
// @access  Public
const getListings = asyncHandler(async (req, res) => {
    const listings = await Listing.find({ status: 'approved' }).populate('owner', 'name email phone avatar');
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

// @desc    Create new listing
// @route   POST /api/listings
// @access  Private (Owner/Broker)
const createListing = asyncHandler(async (req, res) => {
    const listingData = { ...req.body, owner: req.user.id, status: 'pending' };
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

    res.status(200).json(updatedListing);
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
};
