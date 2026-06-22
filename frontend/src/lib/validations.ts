/* ═══════════════════════════════════════════════════════════════════════════
 * Auronix Technologies — Zod Validation Schemas
 * Mirrors backend validation; used with react-hook-form via @hookform/resolvers.
 * ═══════════════════════════════════════════════════════════════════════════ */

import { z } from 'zod';
import {
  ENGAGEMENT_STATUSES,
  ENGAGEMENT_TYPES,
  FINDING_SEVERITIES,
  FINDING_STATUSES,
  REPORT_TYPES,
  REPORT_VISIBILITIES,
  BUDGET_RANGES,
  TIMELINE_OPTIONS,
  ORG_SIZES,
  SERVICE_OPTIONS,
} from './types';

// ─── Shared Field Schemas ──────────────────────────────────────────────────

const emailField = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address');

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters');

const strongPasswordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be at most 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

const nameField = z
  .string()
  .min(1, 'This field is required')
  .max(100, 'Must be 100 characters or less')
  .trim();

const phoneField = z
  .string()
  .regex(/^\+?[1-9]\d{6,14}$/, 'Please enter a valid phone number')
  .or(z.literal(''))
  .optional();

const dateField = z
  .string()
  .min(1, 'Date is required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// ─── Auth Schemas ──────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
});
export type LoginSchema = z.infer<typeof loginSchema>;

export const verify2faSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
  tempToken: z.string().min(1),
});
export type Verify2faSchema = z.infer<typeof verify2faSchema>;

// ─── Contact Form Schemas (Multi-step) ─────────────────────────────────────

// Step 1: Organization Info
export const step1OrgSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  email: emailField,
  phone: z.string().min(1, 'Phone number is required'),
  orgName: z
    .string()
    .min(1, 'Organization name is required')
    .max(200, 'Must be 200 characters or less')
    .trim(),
  orgSize: z.enum(ORG_SIZES, {
    errorMap: () => ({ message: 'Please select your organization size' }),
  }),
});
export type Step1OrgSchema = z.infer<typeof step1OrgSchema>;

// Step 2: Services Selection
export const step2ServicesSchema = z.object({
  services: z
    .array(z.enum(SERVICE_OPTIONS))
    .min(1, 'Please select at least one service'),
  budget: z.enum(BUDGET_RANGES, {
    errorMap: () => ({ message: 'Please select a budget range' }),
  }),
  timeline: z.enum(TIMELINE_OPTIONS, {
    errorMap: () => ({ message: 'Please select a timeline' }),
  }),
});
export type Step2ServicesSchema = z.infer<typeof step2ServicesSchema>;

// Step 3: Scope & Details
export const step3ScopeSchema = z.object({
  scope: z
    .string()
    .min(20, 'Please provide at least 20 characters describing the scope')
    .max(2000, 'Scope must be 2000 characters or less'),
  notes: z.string().max(2000, 'Notes must be 2000 characters or less').optional().default(''),
});
export type Step3ScopeSchema = z.infer<typeof step3ScopeSchema>;

// Full contact schema (combines all steps)
export const fullContactSchema = step1OrgSchema
  .merge(step2ServicesSchema)
  .merge(step3ScopeSchema);
export type FullContactSchema = z.infer<typeof fullContactSchema>;

// ─── Engagement Schemas ────────────────────────────────────────────────────

export const createEngagementSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(200, 'Name must be 200 characters or less')
      .trim(),
    type: z.enum(ENGAGEMENT_TYPES, {
      errorMap: () => ({ message: 'Please select an engagement type' }),
    }),
    scope: z
      .string()
      .min(10, 'Scope must be at least 10 characters')
      .max(5000, 'Scope must be 5000 characters or less'),
    startDate: dateField,
    dueDate: dateField,
    orgId: z.string().uuid('Invalid organization'),
    analystId: z.string().uuid('Invalid analyst'),
  })
  .refine(
    (data) => new Date(data.dueDate) > new Date(data.startDate),
    {
      message: 'Due date must be after start date',
      path: ['dueDate'],
    },
  );
export type CreateEngagementSchema = z.infer<typeof createEngagementSchema>;

export const updateEngagementSchema = z
  .object({
    name: z
      .string()
      .min(3, 'Name must be at least 3 characters')
      .max(200, 'Name must be 200 characters or less')
      .trim()
      .optional(),
    status: z.enum(ENGAGEMENT_STATUSES).optional(),
    progress: z
      .number()
      .min(0, 'Progress must be between 0 and 100')
      .max(100, 'Progress must be between 0 and 100')
      .optional(),
    scope: z
      .string()
      .min(10, 'Scope must be at least 10 characters')
      .max(5000, 'Scope must be 5000 characters or less')
      .optional(),
    dueDate: dateField.optional(),
    analystId: z.string().uuid('Invalid analyst').optional(),
  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: 'At least one field must be provided',
  });
export type UpdateEngagementSchema = z.infer<typeof updateEngagementSchema>;

// ─── Finding Schemas ───────────────────────────────────────────────────────

export const createFindingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title must be 300 characters or less')
    .trim(),
  severity: z.enum(FINDING_SEVERITIES, {
    errorMap: () => ({ message: 'Please select a severity level' }),
  }),
  cvss: z
    .number()
    .min(0, 'CVSS must be between 0.0 and 10.0')
    .max(10, 'CVSS must be between 0.0 and 10.0')
    .nullable()
    .optional()
    .default(null),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be 10000 characters or less'),
  remediation: z
    .string()
    .min(10, 'Remediation must be at least 10 characters')
    .max(5000, 'Remediation must be 5000 characters or less'),
  references: z
    .array(z.string().url('Each reference must be a valid URL'))
    .default([]),
  engagementId: z.string().uuid('Invalid engagement'),
});
export type CreateFindingSchema = z.infer<typeof createFindingSchema>;

export const updateFindingSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(300, 'Title must be 300 characters or less')
    .trim()
    .optional(),
  severity: z.enum(FINDING_SEVERITIES).optional(),
  cvss: z
    .number()
    .min(0, 'CVSS must be between 0.0 and 10.0')
    .max(10, 'CVSS must be between 0.0 and 10.0')
    .nullable()
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(10000, 'Description must be 10000 characters or less')
    .optional(),
  remediation: z
    .string()
    .min(10, 'Remediation must be at least 10 characters')
    .max(5000, 'Remediation must be 5000 characters or less')
    .optional(),
  references: z
    .array(z.string().url('Each reference must be a valid URL'))
    .optional(),
  status: z.enum(FINDING_STATUSES).optional(),
  note: z
    .string()
    .min(1, 'Note is required when changing status')
    .max(2000, 'Note must be 2000 characters or less')
    .optional(),
});
export type UpdateFindingSchema = z.infer<typeof updateFindingSchema>;

// ─── Report Schemas ────────────────────────────────────────────────────────

export const uploadReportSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be 200 characters or less')
    .trim(),
  type: z.enum(REPORT_TYPES, {
    errorMap: () => ({ message: 'Please select a report type' }),
  }),
  version: z
    .string()
    .min(1, 'Version is required')
    .max(20, 'Version must be 20 characters or less')
    .regex(/^v?\d+(\.\d+)*$/, 'Version must be in format like 1.0 or v2.1.3'),
  visibility: z.enum(REPORT_VISIBILITIES, {
    errorMap: () => ({ message: 'Please select report visibility' }),
  }),
  notifyClient: z.boolean().default(false),
  engagementId: z.string().uuid('Invalid engagement'),
  file: z
    .instanceof(File, { message: 'Please select a file to upload' })
    .refine((file) => file.size <= 50 * 1024 * 1024, 'File must be 50MB or less')
    .refine(
      (file) =>
        [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ].includes(file.type),
      'File must be PDF, DOCX, or XLSX',
    ),
});
export type UploadReportSchema = z.infer<typeof uploadReportSchema>;

// ─── Client Schemas ────────────────────────────────────────────────────────

export const createClientSchema = z.object({
  orgName: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(200, 'Must be 200 characters or less')
    .trim(),
  domain: z
    .string()
    .min(3, 'Domain is required')
    .max(255, 'Must be 255 characters or less')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
      'Please enter a valid domain (e.g., example.com)',
    ),
  industry: z
    .string()
    .min(2, 'Industry is required')
    .max(100, 'Must be 100 characters or less')
    .trim(),
  contactEmail: emailField,
  firstName: nameField,
  lastName: nameField,
  email: emailField,
  phone: phoneField,
});
export type CreateClientSchema = z.infer<typeof createClientSchema>;

// ─── Settings Schemas ──────────────────────────────────────────────────────

export const settingsSchema = z.object({
  firstName: nameField,
  lastName: nameField,
  phone: z.string().max(20, 'Phone must be 20 characters or less').default(''),
});
export type SettingsSchema = z.infer<typeof settingsSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: strongPasswordField,
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

// ─── 2FA Verification Schema ──────────────────────────────────────────────

export const totpCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only digits'),
});
export type TotpCodeSchema = z.infer<typeof totpCodeSchema>;
