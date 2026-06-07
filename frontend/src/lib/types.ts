/* ═══════════════════════════════════════════════════════════════════════════
 * HexaShield Security — Core Type Definitions
 * All interfaces, enums, and API response types for the frontend application.
 * ═══════════════════════════════════════════════════════════════════════════ */

// ─── Enum Constants ────────────────────────────────────────────────────────

export const USER_ROLES = ['admin', 'analyst', 'client'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ENGAGEMENT_TYPES = [
  'pentest_web',
  'pentest_mobile',
  'pentest_network',
  'pentest_api',
  'red_team',
  'vuln_assessment',
  'code_review',
  'cloud_audit',
] as const;
export type EngagementType = (typeof ENGAGEMENT_TYPES)[number];

export const ENGAGEMENT_STATUSES = [
  'draft',
  'scoping',
  'active',
  'review',
  'completed',
  'cancelled',
] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];

export const FINDING_SEVERITIES = [
  'critical',
  'high',
  'medium',
  'low',
  'informational',
] as const;
export type FindingSeverity = (typeof FINDING_SEVERITIES)[number];

export const FINDING_STATUSES = [
  'open',
  'in_progress',
  'remediated',
  'accepted',
  'false_positive',
] as const;
export type FindingStatus = (typeof FINDING_STATUSES)[number];

export const REPORT_TYPES = [
  'final',
  'draft',
  'executive_summary',
  'retest',
] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_VISIBILITIES = ['client', 'internal'] as const;
export type ReportVisibility = (typeof REPORT_VISIBILITIES)[number];

export const BUDGET_RANGES = [
  'under_10k',
  '10k_25k',
  '25k_50k',
  '50k_100k',
  'above_100k',
] as const;
export type BudgetRange = (typeof BUDGET_RANGES)[number];

export const TIMELINE_OPTIONS = [
  'asap',
  '1_2_weeks',
  '1_month',
  '2_3_months',
  'flexible',
] as const;
export type Timeline = (typeof TIMELINE_OPTIONS)[number];

export const ORG_SIZES = [
  '1_10',
  '11_50',
  '51_200',
  '201_1000',
  '1000_plus',
] as const;
export type OrgSize = (typeof ORG_SIZES)[number];

export const SERVICE_OPTIONS = [
  'pentest_web',
  'pentest_mobile',
  'pentest_network',
  'pentest_api',
  'red_team',
  'vuln_assessment',
  'code_review',
  'cloud_audit',
  'compliance',
  'incident_response',
] as const;
export type ServiceOption = (typeof SERVICE_OPTIONS)[number];

// ─── Core Models ───────────────────────────────────────────────────────────

export interface Organisation {
  id: string;
  name: string;
  domain: string;
  industry: string;
  contactEmail: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone: string | null;
  totpEnabled: boolean;
  twoFactorVerified: boolean;
  lastLogin: string | null;
  orgId: string | null;
  organisation: Organisation | null;
}

export interface Engagement {
  id: string;
  refId: string;
  name: string;
  type: EngagementType;
  status: EngagementStatus;
  progress: number;
  scope: string;
  startDate: string;
  dueDate: string;
  completedAt: string | null;
  orgId: string;
  analystId: string;
  organisation?: Organisation;
  analyst?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
  findings?: Finding[];
  reports?: Report[];
}

export interface Finding {
  id: string;
  refId: string;
  title: string;
  severity: FindingSeverity;
  cvss: number | null;
  description: string;
  remediation: string;
  references: string[];
  status: FindingStatus;
  fixedAt: string | null;
  engagementId: string;
  engagement?: Pick<Engagement, 'id' | 'refId' | 'name'>;
  updates?: FindingUpdate[];
}

export interface FindingUpdate {
  id: string;
  note: string;
  previousStatus: FindingStatus;
  newStatus: FindingStatus;
  userId: string;
  findingId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface Report {
  id: string;
  name: string;
  type: ReportType;
  version: string;
  storageKey: string;
  sizeBytes: number;
  notifyClient: boolean;
  visibility: ReportVisibility;
  engagementId: string;
  uploadedById: string;
  createdAt: string;
  engagement?: Pick<Engagement, 'id' | 'refId' | 'name'>;
  uploadedBy?: Pick<User, 'id' | 'firstName' | 'lastName'>;
}

export interface DownloadLog {
  id: string;
  reportId: string;
  userId: string;
  ip: string;
  userAgent: string;
  downloadedAt: string;
  user?: Pick<User, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface ContactSubmission {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  orgName: string;
  orgSize: OrgSize;
  services: ServiceOption[];
  budget: BudgetRange;
  timeline: Timeline;
  scope: string;
  notes: string;
}

// ─── API Response Types ────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ─── Auth Types ────────────────────────────────────────────────────────────

export interface LoginResponse {
  requiresTwoFactor: boolean;
  tempToken?: string;
  user?: User;
  accessToken?: string;
}

export interface TokenResponse {
  accessToken: string;
  user: User;
}

// ─── Dashboard Types ──────────────────────────────────────────────────────

export interface DashboardStats {
  activeEngagements: number;
  totalFindings: number;
  criticalFindings: number;
  reportsAvailable: number;
  findingsBySeverity: Record<FindingSeverity, number>;
  findingsByStatus: Record<FindingStatus, number>;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'finding_update' | 'report_uploaded' | 'engagement_status' | 'comment';
  title: string;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// ─── Form Input Types ─────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface Verify2faInput {
  code: string;
  tempToken: string;
}

export interface CreateEngagementInput {
  name: string;
  type: EngagementType;
  scope: string;
  startDate: string;
  dueDate: string;
  orgId: string;
  analystId: string;
}

export interface UpdateEngagementInput {
  name?: string;
  status?: EngagementStatus;
  progress?: number;
  scope?: string;
  dueDate?: string;
  analystId?: string;
}

export interface CreateFindingInput {
  title: string;
  severity: FindingSeverity;
  cvss: number | null;
  description: string;
  remediation: string;
  references: string[];
  engagementId: string;
}

export interface UpdateFindingInput {
  title?: string;
  severity?: FindingSeverity;
  cvss?: number | null;
  description?: string;
  remediation?: string;
  references?: string[];
  status?: FindingStatus;
  note?: string;
}

export interface UploadReportInput {
  name: string;
  type: ReportType;
  version: string;
  visibility: ReportVisibility;
  notifyClient: boolean;
  engagementId: string;
  file: File;
}

export interface CreateClientInput {
  orgName: string;
  domain: string;
  industry: string;
  contactEmail: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
}

export interface SettingsInput {
  firstName: string;
  lastName: string;
  phone: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// ─── Query Filter Types ──────────────────────────────────────────────────

export interface EngagementFilters {
  status?: EngagementStatus;
  type?: EngagementType;
  orgId?: string;
  page?: number;
  limit?: number;
}

export interface FindingFilters {
  severity?: FindingSeverity;
  status?: FindingStatus;
  engagementId?: string;
  page?: number;
  limit?: number;
}

export interface ReportFilters {
  type?: ReportType;
  engagementId?: string;
  page?: number;
  limit?: number;
}
