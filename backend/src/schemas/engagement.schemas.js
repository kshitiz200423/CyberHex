// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Engagement Validation Schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const ENGAGEMENT_TYPES = ['VAPT', 'AUDIT', 'CONSULTANCY', 'SOC', 'TRAINING', 'APPSEC', 'RETEST'];
const ENGAGEMENT_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'IN_REVIEW', 'COMPLETE'];

const createEngagementSchema = z.object({
  name: z
    .string({ required_error: 'Engagement name is required.' })
    .min(3, 'Name must be at least 3 characters.')
    .max(200, 'Name must not exceed 200 characters.')
    .trim(),
  type: z.enum(ENGAGEMENT_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${ENGAGEMENT_TYPES.join(', ')}` }),
  }),
  scope: z
    .string({ required_error: 'Scope is required.' })
    .min(10, 'Scope must be at least 10 characters.')
    .max(10000, 'Scope must not exceed 10000 characters.')
    .trim(),
  startDate: z
    .string({ required_error: 'Start date is required.' })
    .datetime({ message: 'Start date must be a valid ISO 8601 date.' }),
  dueDate: z
    .string({ required_error: 'Due date is required.' })
    .datetime({ message: 'Due date must be a valid ISO 8601 date.' }),
  orgId: z
    .string({ required_error: 'Organisation ID is required.' })
    .uuid('Organisation ID must be a valid UUID.'),
  analystId: z
    .string()
    .uuid('Analyst ID must be a valid UUID.')
    .optional()
    .nullable(),
}).refine(
  (data) => new Date(data.dueDate) > new Date(data.startDate),
  { message: 'Due date must be after start date.', path: ['dueDate'] }
);

const updateEngagementSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters.')
    .max(200, 'Name must not exceed 200 characters.')
    .trim()
    .optional(),
  type: z.enum(ENGAGEMENT_TYPES, {
    errorMap: () => ({ message: `Type must be one of: ${ENGAGEMENT_TYPES.join(', ')}` }),
  }).optional(),
  status: z.enum(ENGAGEMENT_STATUSES, {
    errorMap: () => ({ message: `Status must be one of: ${ENGAGEMENT_STATUSES.join(', ')}` }),
  }).optional(),
  progress: z
    .number()
    .int('Progress must be an integer.')
    .min(0, 'Progress must be at least 0.')
    .max(100, 'Progress must not exceed 100.')
    .optional(),
  scope: z
    .string()
    .min(10, 'Scope must be at least 10 characters.')
    .max(10000, 'Scope must not exceed 10000 characters.')
    .trim()
    .optional(),
  startDate: z
    .string()
    .datetime({ message: 'Start date must be a valid ISO 8601 date.' })
    .optional(),
  dueDate: z
    .string()
    .datetime({ message: 'Due date must be a valid ISO 8601 date.' })
    .optional(),
  analystId: z
    .string()
    .uuid('Analyst ID must be a valid UUID.')
    .optional()
    .nullable(),
});

module.exports = {
  createEngagementSchema,
  updateEngagementSchema,
};
