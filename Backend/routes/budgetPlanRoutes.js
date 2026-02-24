const express = require('express');
const router = express.Router();
const { saveBudgetPlan, getMyBudgetPlans, deleteBudgetPlan } = require('../controllers/budgetPlanController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
    .get(getMyBudgetPlans)
    .post(saveBudgetPlan);

router.delete('/:id', deleteBudgetPlan);

module.exports = router;
