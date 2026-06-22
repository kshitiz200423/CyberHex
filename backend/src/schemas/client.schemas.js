// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Client Validation Schemas
// ═══════════════════════════════════════════════════════════════

const { z } = require('zod');

const createClientSchema = z.object({
  // Organisation details
  orgName: z
    .string({ required_error: 'Organisation name is required.' })
    .min(2, 'Organisation name must be at least 2 characters.')
    .max(200, 'Organisation name must not exceed 200 characters.')
    .trim(),
  domain: z
    .string({ required_error: 'Domain is required.' })
    .min(3, 'Domain must be at least 3 characters.')
    .max(200, 'Domain must not exceed 200 characters.')
    .trim(),
  industry: z
    .string({ required_error: 'Industry is required.' })
    .min(2, 'Industry must be at least 2 characters.')
    .max(100, 'Industry must not exceed 100 characters.')
    .trim(),
  contactEmail: z
    .string({ required_error: 'Contact email is required.' })
    .email('Please provide a valid contact email.')
    .max(255, 'Email must not exceed 255 characters.')
    .transform((val) => val.toLowerCase().trim()),
  contactPhone: z
    .string({ required_error: 'Contact phone is required.' })
    .min(7, 'Phone must be at least 7 characters.')
    .max(20, 'Phone must not exceed 20 characters.')
    .trim(),
  address: z
    .string({ required_error: 'Address is required.' })
    .min(5, 'Address must be at least 5 characters.')
    .max(500, 'Address must not exceed 500 characters.')
    .trim(),

  // Initial client user
  userFirstName: z
    .string({ required_error: 'User first name is required.' })
    .min(2, 'First name must be at least 2 characters.')
    .max(100, 'First name must not exceed 100 characters.')
    .trim(),
  userLastName: z
    .string({ required_error: 'User last name is required.' })
    .min(2, 'Last name must be at least 2 characters.')
    .max(100, 'Last name must not exceed 100 characters.')
    .trim(),
  userEmail: z
    .string({ required_error: 'User email is required.' })
    .email('Please provide a valid user email.')
    .max(255, 'Email must not exceed 255 characters.')
    .transform((val) => val.toLowerCase().trim()),
});

module.exports = {
  createClientSchema,
};
