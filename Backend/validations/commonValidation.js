const { z } = require('zod');

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

const idParams = z.object({ id: objectId });

const createBookingSchema = z.object({
    body: z.object({
        listingId: objectId,
        date: z.coerce.date(),
        timeSlot: z.string().trim().min(1).max(50),
        message: z.string().max(500).optional(),
    }),
});

const updateBookingStatusSchema = z.object({
    params: idParams,
    body: z.object({
        status: z.enum(['confirmed', 'rejected', 'completed', 'cancelled']),
        notes: z.string().max(500).optional(),
    }),
});

const sendInquirySchema = z.object({
    body: z.object({
        listingId: objectId,
        message: z.string().trim().min(1, 'Message is required').max(2000),
    }),
});

const replyInquirySchema = z.object({
    params: idParams,
    body: z.object({
        message: z.string().trim().min(1, 'Message is required').max(2000),
    }),
});

const contactSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2, 'Please enter your name').max(80),
        email: z.string().trim().email('Please enter a valid email').max(254),
        subject: z.string().trim().max(150).optional(),
        message: z.string().trim().min(10, 'Message must be at least 10 characters').max(3000),
    }),
});

const reportListingSchema = z.object({
    body: z.object({
        listingId: objectId,
        reason: z.string().trim().min(1).max(100),
        description: z.string().trim().min(1).max(1000),
        screenshot: z.string().url().max(500).optional().or(z.literal('')),
        contactEmail: z.string().email().max(254).optional().or(z.literal('')),
    }),
});

const adminListingStatusSchema = z.object({
    params: idParams,
    body: z.object({
        status: z.enum(['pending', 'approved', 'rejected', 'changes_requested', 'paused', 'rented', 'expired']),
    }),
});

const adminUserStatusSchema = z.object({
    params: idParams,
    body: z.object({
        status: z.enum(['active', 'inactive', 'suspended', 'blocked']),
    }),
});

const adminReportStatusSchema = z.object({
    params: idParams,
    body: z.object({
        status: z.enum(['pending', 'reviewed', 'dismissed']),
    }),
});

module.exports = {
    objectId,
    createBookingSchema,
    updateBookingStatusSchema,
    sendInquirySchema,
    replyInquirySchema,
    contactSchema,
    reportListingSchema,
    adminListingStatusSchema,
    adminUserStatusSchema,
    adminReportStatusSchema,
};
