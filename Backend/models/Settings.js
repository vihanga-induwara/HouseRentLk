const mongoose = require('mongoose');

const settingsSchema = mongoose.Schema({
    siteName: {
        type: String,
        default: 'HouseRentLk'
    },
    contactEmail: {
        type: String,
        default: 'info@houserent.lk'
    },
    contactPhone: {
        type: String,
        default: '+94 77 123 4567'
    },
    contactAddress: {
        type: String,
        default: '123 Galle Road, Colombo 03, Sri Lanka'
    },
    officeHours: {
        type: String,
        default: 'Mon - Fri: 9:00 AM - 6:00 PM'
    },
    socialLinks: {
        facebook: { type: String, default: 'https://facebook.com/houserentlk' },
        twitter: { type: String, default: 'https://twitter.com/houserentlk' },
        instagram: { type: String, default: 'https://instagram.com/houserentlk' },
        linkedin: { type: String, default: 'https://linkedin.com/company/houserentlk' }
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
