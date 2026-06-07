// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Report Validation Schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const REPORT_TYPES = ['TECHNICAL', 'EXECUTIVE', 'GAP_ANALYSIS', 'CERTIFICATE', 'RETEST'];

const uploadReportSchema = z.object({
  name: z
    .string({ required_error: 'Report name is required.' })
    .min(3, 'Name must be at least 3 characters.')
    .max(200, 'Name must not exceed 200 characters.')
    .trim(),
  type: z.enum(REPORT_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${REPORT_TYPES.join(', ')}` }),
  }),
  version: z
    .string()
    .max(20, 'Version must not exceed 20 characters.')
    .trim()
    .optional()
    .default('v1.0'),
  engagementId: z
    .string({ required_error: 'Engagement ID is required.' })
    .uuid('Engagement ID must be a valid UUID.'),
  notifyClient: z
    .union([z.boolean(), z.string().transform((v) => v === 'true')])
    .optional()
    .default(false),
  visibility: z
    .enum(['private', 'client'], {
      errorMap: () => ({ message: 'Visibility must be "private" or "client".' }),
    })
    .optional()
    .default('private'),
  accessExpiry: z
    .string()
    .datetime({ message: 'Access expiry must be a valid ISO 8601 date.' })
    .optional()
    .nullable(),
});

module.exports = {
  uploadReportSchema,
};
