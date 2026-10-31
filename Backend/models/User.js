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
            default: 'default-avatar.png',
        },
        // Verification Info
        verificationStatus: {
            type: String,
            enum: ['none', 'pending', 'verified', 'rejected'],
            default: 'none',
        },
        verificationDocs: [
            {
                type: { type: String, enum: ['NIC', 'Utility Bill', 'Deed', 'Business Reg'] },
                url: String,
                status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
                comment: String,
            }
        ],
        verifiedAt: Date,
        verificationMessage: String,
        // Renter Profile (Matching)
        renterProfile: {
            isActive: { type: Boolean, default: false },
            preferredTowns: [String],
            budgetMin: Number,
            budgetMax: Number,
            preferredType: [String],
            bedsMin: Number,
            bio: String,
        },

        bio: {
            type: String,
            maxlength: 250,
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        // Contact verification (required before posting ads)
        isEmailVerified: { type: Boolean, default: false },
        isPhoneVerified: { type: Boolean, default: false },
        emailVerificationToken: String, // sha256 hash
        emailVerificationExpires: Date,
        emailVerificationSentAt: Date,
        phoneOtpHash: String, // sha256 hash
        phoneOtpExpires: Date,
        phoneOtpAttempts: { type: Number, default: 0 },
        phoneOtpSentAt: Date,
        // Password reset
        passwordResetToken: String, // sha256 hash
        passwordResetExpires: Date,
        passwordChangedAt: Date,
        lastLogin: {
            type: Date,
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended', 'blocked'],
            default: 'active'
        },
        following: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true,
    }
);

// Never serialise secrets, whatever the query selected
const SECRET_FIELDS = [
    'password', 'emailVerificationToken', 'emailVerificationExpires', 'phoneOtpHash',
    'phoneOtpExpires', 'phoneOtpAttempts', 'passwordResetToken', 'passwordResetExpires',
];
userSchema.set('toJSON', {
    transform: (doc, ret) => {
        SECRET_FIELDS.forEach((field) => delete ret[field]);
        return ret;
    },
});

// Encrypt password using bcrypt (assign the plain password; never pre-hash it)
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return; // Skip if password not modified
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    if (!this.isNew) {
        // Back-date by 1s so a token issued right after the change stays valid
        this.passwordChangedAt = new Date(Date.now() - 1000);
    }
});

// True if the password changed after the given JWT "issued at" (seconds)
userSchema.methods.changedPasswordAfter = function (jwtIat) {
    if (!this.passwordChangedAt) return false;
    return Math.floor(this.passwordChangedAt.getTime() / 1000) > jwtIat;
};

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
