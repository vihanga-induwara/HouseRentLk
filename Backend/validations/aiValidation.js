const { z } = require('zod');

// Schemas mirror what the frontend actually sends. Numbers arrive as strings from
// form inputs, so numeric fields are coerced. Size limits keep payloads passed to
// the Python scripts small.
const shortText = z.string().trim().max(200);
const longText = z.string().max(5000);
const amenities = z.record(z.string(), z.union([z.boolean(), z.string(), z.number()])).optional();
const money = z.coerce.number().nonnegative().max(1e9);

const budgetPlanSchema = z.object({
    body: z.discriminatedUnion('action', [
        z.object({
            action: z.literal('affordability'),
            income: z.coerce.number().positive().max(1e9),
            expenses: money.default(0),
            town: shortText.optional(),
        }),
        z.object({
            action: z.literal('rent_vs_buy'),
            rent: z.coerce.number().positive().max(1e9),
            value: z.coerce.number().positive().max(1e11),
        }),
        z.object({
            action: z.literal('deposit'),
            rent: z.coerce.number().positive().max(1e9),
            months: z.coerce.number().int().min(1).max(24).default(4),
        }),
        z.object({
            action: z.literal('utilities'),
            town: shortText.optional(),
            type: shortText.optional(),
        }),
    ]),
});

const generateTitleSchema = z.object({
    body: z.object({
        type: shortText.min(1),
        beds: z.coerce.number().int().min(0).max(50),
        baths: z.coerce.number().int().min(0).max(50).optional(),
        town: shortText.min(1),
        price: money.optional(),
        tenantType: shortText.optional(),
        amenities,
        furnished: shortText.optional(),
    }),
});

const autoTagSchema = z.object({
    body: z.object({
        title: shortText.optional(),
        description: longText.optional(),
        amenities,
        furnished: shortText.optional(),
    }),
});

const nlpSearchSchema = z.object({
    body: z.object({
        query: z.string().trim().min(3).max(300),
    }),
});

const imageQualitySchema = z.object({
    body: z.object({
        images: z.array(z.object({
            width: z.coerce.number().nonnegative(),
            height: z.coerce.number().nonnegative(),
            sizeKb: z.coerce.number().nonnegative(),
        })).max(20),
    }),
});

const checkSpamSchema = z.object({
    body: z.object({
        title: shortText.optional(),
        description: longText.optional(),
        town: shortText.optional(),
        price: money.optional(),
    }),
});

const duplicateCheckSchema = z.object({
    body: z.object({
        title: shortText.min(1),
        description: longText.optional(),
        town: shortText.min(1),
        price: money,
        beds: z.coerce.number().int().min(0).max(50).optional(),
        baths: z.coerce.number().int().min(0).max(50).optional(),
        type: shortText.optional(),
    }),
});

const compareListingsSchema = z.object({
    body: z.object({
        listingIds: z.array(z.string().regex(/^[a-f\d]{24}$/i, 'Invalid listing id')).min(2).max(6),
    }),
});

module.exports = {
    budgetPlanSchema,
    generateTitleSchema,
    autoTagSchema,
    nlpSearchSchema,
    imageQualitySchema,
    checkSpamSchema,
    duplicateCheckSchema,
    compareListingsSchema
};
