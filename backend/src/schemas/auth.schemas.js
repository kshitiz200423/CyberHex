// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Auth Validation Schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .max(255, 'Email must not exceed 255 characters.')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
    .max(128, 'Password must not exceed 128 characters.'),
});

const verify2faSchema = z.object({
  code: z
    .string({ required_error: 'Verification code is required.' })
    .length(6, 'Verification code must be exactly 6 digits.')
    .regex(/^\d{6}$/, 'Verification code must contain only digits.'),
  partialToken: z
    .string({ required_error: 'Partial token is required.' })
    .min(1, 'Partial token is required.'),
});

const refreshSchema = z.object({}).passthrough();

module.exports = {
  loginSchema,
  verify2faSchema,
  refreshSchema,
};
