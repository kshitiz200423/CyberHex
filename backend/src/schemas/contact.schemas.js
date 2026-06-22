// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Contact Submission Validation Schema
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const SERVICES = [
  'VAPT',
  'AUDIT',
  'CONSULTANCY',
  'SOC',
  'TRAINING',
  'APPSEC',
  'RETEST',
];

const contactSubmissionSchema = z.object({
  // Step 1: Personal info
  firstName: z
    .string({ required_error: 'First name is required.' })
    .min(2, 'First name must be at least 2 characters.')
    .max(100, 'First name must not exceed 100 characters.')
    .trim(),
  lastName: z
    .string({ required_error: 'Last name is required.' })
    .min(2, 'Last name must be at least 2 characters.')
    .max(100, 'Last name must not exceed 100 characters.')
    .trim(),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Please provide a valid email address.')
    .max(255, 'Email must not exceed 255 characters.')
    .transform((val) => val.toLowerCase().trim()),
  phone: z
    .string({ required_error: 'Phone number is required.' })
    .min(7, 'Phone number must be at least 7 characters.')
    .max(20, 'Phone number must not exceed 20 characters.')
    .trim(),

  // Step 2: Organisation info
  orgName: z
    .string({ required_error: 'Organisation name is required.' })
    .min(2, 'Organisation name must be at least 2 characters.')
    .max(200, 'Organisation name must not exceed 200 characters.')
    .trim(),
  orgSize: z
    .string({ required_error: 'Organisation size is required.' })
    .min(1, 'Organisation size is required.')
    .max(50, 'Organisation size must not exceed 50 characters.')
    .trim(),

  // Step 3: Service requirements
  services: z
    .array(
      z.enum(SERVICES, {
        errorMap: () => ({ message: `Service must be one of: ${SERVICES.join(', ')}` }),
      })
    )
    .min(1, 'At least one service must be selected.')
    .max(7, 'Maximum 7 services allowed.'),
  budget: z
    .string({ required_error: 'Budget range is required.' })
    .min(1, 'Budget range is required.')
    .max(100, 'Budget must not exceed 100 characters.')
    .trim(),
  timeline: z
    .string({ required_error: 'Timeline is required.' })
    .min(1, 'Timeline is required.')
    .max(100, 'Timeline must not exceed 100 characters.')
    .trim(),

  // Step 4: Project details
  scope: z
    .string({ required_error: 'Scope description is required.' })
    .min(20, 'Scope must be at least 20 characters.')
    .max(10000, 'Scope must not exceed 10000 characters.')
    .trim(),
  notes: z
    .string()
    .max(5000, 'Notes must not exceed 5000 characters.')
    .trim()
    .optional()
    .nullable(),
});

module.exports = {
  contactSubmissionSchema,
};
