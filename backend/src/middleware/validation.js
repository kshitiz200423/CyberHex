// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Validation Middleware (Zod)
// ═══════════════════════════════════════════════════════════════

const { ZodError } = require('zod');

/**
 * Validation middleware factory
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      // Replace body with parsed/stripped data (removes unknown fields)
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));

        return res.status(400).json({
          status: 'error',
          message: 'Validation failed.',
          errors,
        });
      }
      next(err);
    }
  };
}

module.exports = { validate };
