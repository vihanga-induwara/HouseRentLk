const asyncHandler = require('express-async-handler');
const Page = require('../models/Page');

// @desc    Get all pages
// @route   GET /api/pages
// @access  Public
const getPages = asyncHandler(async (req, res) => {
    const pages = await Page.find({ isActive: true }).select('title slug');
    res.json(pages);
});

// @desc    Get single page by slug
// @route   GET /api/pages/:slug
// @access  Public
const getPageBySlug = asyncHandler(async (req, res) => {
    const page = await Page.findOne({ slug: req.params.slug, isActive: true });
    if (!page) {
        res.status(404);
        throw new Error('Page not found');
    }
    res.json(page);
});

// @desc    Create/Update page
// @route   POST /api/pages
// @access  Private/Admin
const upsertPage = asyncHandler(async (req, res) => {
    const { slug, title, content, isActive } = req.body;

    let page = await Page.findOne({ slug });

    if (page) {
        page.title = title || page.title;
        page.content = content || page.content;
        page.isActive = isActive !== undefined ? isActive : page.isActive;
        page.lastUpdatedBy = req.user.id;
        await page.save();
        res.json(page);
    } else {
        page = await Page.create({
            slug, title, content, isActive,
            lastUpdatedBy: req.user.id
        });
        res.status(201).json(page);
    }
});

module.exports = {
    getPages,
    getPageBySlug,
    upsertPage
};
