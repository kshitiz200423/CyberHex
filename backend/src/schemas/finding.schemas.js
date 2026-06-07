// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Finding Validation Schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFORMATIONAL'];
const FINDING_STATUSES = ['OPEN', 'IN_PROGRESS', 'FIXED', 'ACCEPTED', 'FALSE_POSITIVE'];

const createFindingSchema = z.object({
  title: z
    .string({ required_error: 'Finding title is required.' })
    .min(5, 'Title must be at least 5 characters.')
    .max(300, 'Title must not exceed 300 characters.')
    .trim(),
  severity: z.enum(SEVERITIES, {
    errorMap: () => ({ message: `Severity must be one of: ${SEVERITIES.join(', ')}` }),
  }),
  cvss: z
    .number({ required_error: 'CVSS score is required.' })
    .min(0, 'CVSS must be at least 0.')
    .max(10, 'CVSS must not exceed 10.'),
  description: z
    .string({ required_error: 'Description is required.' })
    .min(20, 'Description must be at least 20 characters.')
    .max(50000, 'Description must not exceed 50000 characters.')
    .trim(),
  remediation: z
    .string({ required_error: 'Remediation is required.' })
    .min(10, 'Remediation must be at least 10 characters.')
    .max(50000, 'Remediation must not exceed 50000 characters.')
    .trim(),
  references: z
    .array(z.string().url('Each reference must be a valid URL.'))
    .max(20, 'Maximum 20 references allowed.')
    .optional()
    .default([]),
  engagementId: z
    .string({ required_error: 'Engagement ID is required.' })
    .uuid('Engagement ID must be a valid UUID.'),
});

const updateFindingSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters.')
    .max(300, 'Title must not exceed 300 characters.')
    .trim()
    .optional(),
  severity: z.enum(SEVERITIES, {
    errorMap: () => ({ message: `Severity must be one of: ${SEVERITIES.join(', ')}` }),
  }).optional(),
  cvss: z
    .number()
    .min(0, 'CVSS must be at least 0.')
    .max(10, 'CVSS must not exceed 10.')
    .optional(),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters.')
    .max(50000, 'Description must not exceed 50000 characters.')
    .trim()
    .optional(),
  remediation: z
    .string()
    .min(10, 'Remediation must be at least 10 characters.')
    .max(50000, 'Remediation must not exceed 50000 characters.')
    .trim()
    .optional(),
  references: z
    .array(z.string().url('Each reference must be a valid URL.'))
    .max(20, 'Maximum 20 references allowed.')
    .optional(),
  status: z.enum(FINDING_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${FINDING_STATUSES.join(', ')}` }),
  }).optional(),
  note: z
    .string()
    .min(1, 'Note is required when updating status.')
    .max(5000, 'Note must not exceed 5000 characters.')
    .trim()
    .optional(),
});

module.exports = {
  createFindingSchema,
  updateFindingSchema,
};
