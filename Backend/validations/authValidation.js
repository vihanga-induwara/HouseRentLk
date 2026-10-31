const { z } = require('zod');

const email = z.string().trim().email('Invalid email address').max(254);
const token = z.string().regex(/^[a-f\d]{64}$/i, 'Invalid or malformed link');

const registerSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80),
        email,
        password: z.string().min(8, 'Password must be at least 8 characters').max(128),
        // Admin accounts are only created via scripts/seed/seedAdmin.js, never by public sign-up
        role: z.enum(['renter', 'owner', 'broker']).optional(),
        phone: z.string().max(20).optional(),
        preferences: z.object({
            maxPrice: z.number().optional(),
            preferredTowns: z.array(z.string()).optional(),
        }).passthrough().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email,
        password: z.string().min(1, 'Password is required').max(128),
    }),
});

const updateProfileSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(80).optional(),
        email: email.optional(),
        phone: z.string().max(20).optional(),
        bio: z.string().max(250, 'Bio must be 250 characters or less').optional(),
        avatar: z.string().url().max(500).optional(),
        preferences: z.record(z.string(), z.unknown()).optional(),
        password: z.string().max(128).optional(),
        currentPassword: z.string().max(128).optional(),
    }),
});

const verifyEmailSchema = z.object({ body: z.object({ token }) });

const sendPhoneOtpSchema = z.object({
    body: z.object({ phone: z.string().max(20).optional() }),
});

const verifyPhoneSchema = z.object({
    body: z.object({ otp: z.string().regex(/^\d{6}$/, 'Enter the 6-digit code') }),
});

const forgotPasswordSchema = z.object({ body: z.object({ email }) });

const resetPasswordSchema = z.object({
    body: z.object({
        token,
        password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    updateProfileSchema,
    verifyEmailSchema,
    sendPhoneOtpSchema,
    verifyPhoneSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};
