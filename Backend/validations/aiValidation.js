const { z } = require('zod');

const budgetPlanSchema = z.object({
    body: z.object({
        action: z.string(),
        income: z.number().positive(),
        expenses: z.number().nonnegative(),
    }),
});

const generateTitleSchema = z.object({
    body: z.object({
        type: z.string(),
        beds: z.number().int().nonnegative(),
        baths: z.number().int().nonnegative(),
        town: z.string(),
        price: z.number().positive(),
        tenantType: z.string().optional(),
        amenities: z.array(z.string()).optional(),
        furnished: z.boolean().optional(),
    }),
});

const autoTagSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string(),
        amenities: z.array(z.string()).optional(),
        furnished: z.boolean().optional(),
    }),
});

const nlpSearchSchema = z.object({
    body: z.object({
        query: z.string().min(1),
    }),
});

const imageQualitySchema = z.object({
    body: z.object({
        images: z.array(z.string().url()),
    }),
});

const checkSpamSchema = z.object({
    body: z.object({
        title: z.string(),
        description: z.string(),
        town: z.string(),
        price: z.number(),
        beds: z.number(),
        baths: z.number(),
        type: z.string(),
    }),
});

const compareListingsSchema = z.object({
    body: z.object({
        listingIds: z.array(z.string()),
    }),
});

module.exports = {
    budgetPlanSchema,
    generateTitleSchema,
    autoTagSchema,
    nlpSearchSchema,
    imageQualitySchema,
    checkSpamSchema,
    compareListingsSchema
};
