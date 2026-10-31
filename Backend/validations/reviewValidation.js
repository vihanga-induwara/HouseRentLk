const { z } = require('zod');

const addReviewSchema = z.object({
    body: z.object({
        listingId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid listing ID format'),
        rating: z.coerce.number().int().min(1).max(5),
        comment: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment is too long'),
    }),
});

module.exports = { addReviewSchema };
