const express = require('express');
const router = express.Router();
const {
    getSuggestedPrice,
    generateTitle,
    getListingInsights,
    autoTagListing,
    getReviewSentiment,
    getPriceFairness,
    // Phase 2
    nlpSearch,
    analyzeImageQuality,
    checkDuplicates,
    checkSpam,
    compareListings,
    getDemandHeatmap,
    getAreaSafety,
    getRentBudgetPlan
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validateMiddleware');
const {
    budgetPlanSchema,
    generateTitleSchema,
    autoTagSchema,
    nlpSearchSchema,
    imageQualitySchema,
    checkSpamSchema,
    duplicateCheckSchema,
    compareListingsSchema
} = require('../validations/aiValidation');

// ---- Phase 1 ----
// Public endpoints
router.get('/price-suggest', getSuggestedPrice);
router.get('/price-fairness/:listingId', getPriceFairness);
router.get('/sentiment/:listingId', getReviewSentiment);

// Private endpoints (require login)
router.post('/generate-title', protect, validate(generateTitleSchema), generateTitle);
router.post('/auto-tag', protect, validate(autoTagSchema), autoTagListing);
router.get('/insights/:listingId', protect, getListingInsights);

// ---- Phase 2 ----
// Public endpoints
router.post('/nlp-search', validate(nlpSearchSchema), nlpSearch);
router.post('/compare', validate(compareListingsSchema), compareListings);
router.get('/demand-heatmap', getDemandHeatmap);
router.get('/safety-score/:listingId', getAreaSafety);
router.post('/budget-plan', validate(budgetPlanSchema), getRentBudgetPlan);

// Private endpoints
router.post('/image-quality', protect, validate(imageQualitySchema), analyzeImageQuality);
router.post('/duplicate-check', protect, validate(duplicateCheckSchema), checkDuplicates);
router.post('/spam-check', protect, validate(checkSpamSchema), checkSpam);

module.exports = router;
