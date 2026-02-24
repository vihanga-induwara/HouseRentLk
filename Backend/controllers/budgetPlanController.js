const asyncHandler = require('express-async-handler');
const BudgetPlan = require('../models/BudgetPlan');

// @desc    Save a budget plan
// @route   POST /api/budget-plans
// @access  Private
const saveBudgetPlan = asyncHandler(async (req, res) => {
    const { title, calculationType, inputs, results } = req.body;

    const plan = await BudgetPlan.create({
        user: req.user.id,
        title,
        calculationType,
        inputs,
        results
    });

    res.status(201).json(plan);
});

// @desc    Get user budget plans
// @route   GET /api/budget-plans
// @access  Private
const getMyBudgetPlans = asyncHandler(async (req, res) => {
    const plans = await BudgetPlan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(plans);
});

// @desc    Delete a budget plan
// @route   DELETE /api/budget-plans/:id
// @access  Private
const deleteBudgetPlan = asyncHandler(async (req, res) => {
    const plan = await BudgetPlan.findById(req.params.id);

    if (!plan) {
        res.status(404);
        throw new Error('Plan not found');
    }

    if (plan.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('Not authorized');
    }

    await plan.deleteOne();
    res.json({ message: 'Plan removed' });
});

module.exports = {
    saveBudgetPlan,
    getMyBudgetPlans,
    deleteBudgetPlan
};
