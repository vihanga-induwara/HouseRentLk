const mongoose = require('mongoose');

const budgetPlanSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'My Budget Plan'
    },
    calculationType: {
        type: String,
        required: true,
        enum: ['affordability', 'deposit', 'comparison', 'utilities']
    },
    inputs: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    results: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BudgetPlan', budgetPlanSchema);
