const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        const parsed = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        // Use the parsed body so coerced/defaulted values reach the controller.
        // (req.query is read-only in Express 5, so it is validated but not replaced.)
        if (parsed.body !== undefined) req.body = parsed.body;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                message: error.issues[0]?.message || 'Invalid request data',
                errors: error.issues.map((err) => ({
                    path: err.path.join('.'),
                    message: err.message,
                })),
            });
        }
        next(error);
    }
};

module.exports = { validate };
