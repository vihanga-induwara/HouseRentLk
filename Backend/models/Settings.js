const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    siteName: {
        type: String,
        default: 'HouseRentLk'
    },
    // Contact details and social links are empty until an admin sets real values
    // (the site hides anything that is not configured)
    contactEmail: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    officeHours: { type: String, default: '' },
    socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' }
    },
    scrapingRules: {
        maxExternalPercent: { type: Number, default: 20 },
        boostInternalAlways: { type: Boolean, default: true },
        showDescriptionSnippetOnly: { type: Boolean, default: true },
        showImages: { type: Boolean, default: true },
        forceSourceLink: { type: Boolean, default: true },
        autoExpireDays: { type: Number, default: 30 },
    }
}, {
    timestamps: true
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
