const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email',
            ],
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
            minlength: 6,
        },
        role: {
            type: String,
            enum: ['renter', 'owner', 'broker', 'admin'],
            default: 'renter',
        },
        phone: {
            type: String,
            required: false,
        },
        avatar: {
            type: String,
            default: '', // URL to image
        },
        bio: {
            type: String,
            maxlength: 250,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        preferences: {
            locations: [String],
            minBudget: Number,
            maxBudget: Number,
            propertyTypes: [String],
            bedrooms: Number,
            petFriendly: Boolean,
            furnished: {
                type: String,
                enum: ['any', 'furnished', 'unfurnished'],
                default: 'any'
            }
        },
        verification: {
            status: {
                type: String,
                enum: ['not_submitted', 'pending', 'approved', 'rejected'],
                default: 'not_submitted'
            },
            nicFront: String,
            nicBack: String,
            message: String, // Admin feedback
            verifiedAt: Date
        },
        lastLogin: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active'
        }
    },
    {
        timestamps: true,
    }
);

// Encrypt password using bcrypt
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return; // Skip if password not modified
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
