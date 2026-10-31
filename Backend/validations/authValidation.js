const { z } = require('zod');

const registerSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters'),
        email: z.string().email('Invalid email address'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        // Admin accounts are only created via scripts/seed/seedAdmin.js, never by public sign-up
        role: z.enum(['renter', 'owner', 'broker']).optional(),
        phone: z.string().optional(),
        preferences: z.object({
            maxPrice: z.number().optional(),
            preferredTowns: z.array(z.string()).optional(),
        }).optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email address'),
        password: z.string(),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
};
