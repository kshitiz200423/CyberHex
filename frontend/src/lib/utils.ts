/* ═══════════════════════════════════════════════════════════════════════════
 * Auronix Technologies — Utility Functions & Config Maps
 * Pure utility functions and static configuration data.
 * ═══════════════════════════════════════════════════════════════════════════ */

import type {
  EngagementStatus,
  EngagementType,
  FindingSeverity,
  FindingStatus,
  UserRole,
} from './types';

// ─── Class Name Merger ─────────────────────────────────────────────────────

/**
 * Merges class name strings, filtering out falsy values.
 * Lightweight alternative to clsx + tailwind-merge.
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Date Formatting ───────────────────────────────────────────────────────

type DateFormat = 'short' | 'long' | 'relative' | 'datetime' | 'iso';

/**
 * Formats a date string or Date object into a human-readable format.
 */
export function formatDate(
  date: string | Date | null | undefined,
  format: DateFormat = 'short',
): string {
  if (!date) return '—';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '—';

  switch (format) {
    case 'short':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

    case 'long':
      return d.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

    case 'datetime':
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

    case 'relative':
      return getRelativeTime(d);

    case 'iso':
      return d.toISOString().split('T')[0] ?? '—';

    default:
      return d.toLocaleDateString('en-US');
  }
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;

  return formatDate(date, 'short');
}

// ─── File Size Formatting ──────────────────────────────────────────────────

/**
 * Converts bytes to a human-readable file size string.
 */
export function formatBytes(bytes: number | null | undefined): string {
  if (bytes == null || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(1));

  return `${size} ${units[i] ?? 'B'}`;
}

// ─── Number Formatting ────────────────────────────────────────────────────

/**
 * Formats large numbers with K/M suffixes.
 */
export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

// ─── Reference ID Formatting ──────────────────────────────────────────────

/**
 * Generates a display-friendly reference ID.
 * e.g. generateRefId('ENG', 42) → 'ENG-0042'
 */
export function generateRefId(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, '0')}`;
}

// ─── CVSS Score Formatting ────────────────────────────────────────────────

export function formatCvss(score: number | null | undefined): string {
  if (score == null) return '—';
  return score.toFixed(1);
}

// ─── Severity Configuration ───────────────────────────────────────────────

interface SeverityConfig {
  label: string;
  color: string;
  bg: string;
  text: string;
  dot: string;
  border: string;
}

export const severityConfig: Record<FindingSeverity, SeverityConfig> = {
  CRITICAL: {
    label: 'Critical',
    color: '#EF4444',
    bg: 'bg-brand-red/10',
    text: 'text-brand-red',
    dot: 'bg-brand-red',
    border: 'border-brand-red/20',
  },
  HIGH: {
    label: 'High',
    color: '#F59E0B',
    bg: 'bg-brand-amber/10',
    text: 'text-brand-amber',
    dot: 'bg-brand-amber',
    border: 'border-brand-amber/20',
  },
  MEDIUM: {
    label: 'Medium',
    color: '#8B5CF6',
    bg: 'bg-brand-purple/10',
    text: 'text-brand-purple',
    dot: 'bg-brand-purple',
    border: 'border-brand-purple/20',
  },
  LOW: {
    label: 'Low',
    color: '#3B82F6',
    bg: 'bg-accent/10',
    text: 'text-accent',
    dot: 'bg-accent',
    border: 'border-accent/20',
  },
  INFORMATIONAL: {
    label: 'Info',
    color: '#8B9DC8',
    bg: 'bg-text-2/10',
    text: 'text-text-2',
    dot: 'bg-text-2',
    border: 'border-text-2/20',
  },
} as const;

// ─── Finding Status Configuration ─────────────────────────────────────────

interface StatusStyleConfig {
  label: string;
  color: string;
  bg: string;
  text: string;
  dot: string;
}

export const findingStatusConfig: Record<FindingStatus, StatusStyleConfig> = {
  OPEN: {
    label: 'Open',
    color: '#EF4444',
    bg: 'bg-brand-red/10',
    text: 'text-brand-red',
    dot: 'bg-brand-red',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#F59E0B',
    bg: 'bg-brand-amber/10',
    text: 'text-brand-amber',
    dot: 'bg-brand-amber',
  },
  FIXED: {
    label: 'Fixed',
    color: '#10B981',
    bg: 'bg-brand-green/10',
    text: 'text-brand-green',
    dot: 'bg-brand-green',
  },
  ACCEPTED: {
    label: 'Accepted',
    color: '#3B82F6',
    bg: 'bg-accent/10',
    text: 'text-accent',
    dot: 'bg-accent',
  },
  FALSE_POSITIVE: {
    label: 'False Positive',
    color: '#8B9DC8',
    bg: 'bg-text-2/10',
    text: 'text-text-2',
    dot: 'bg-text-2',
  },
} as const;

// ─── Engagement Status Configuration ──────────────────────────────────────

export const engagementStatusConfig: Record<EngagementStatus, StatusStyleConfig> = {
  SCHEDULED: {
    label: 'Scheduled',
    color: '#8B9DC8',
    bg: 'bg-text-2/10',
    text: 'text-text-2',
    dot: 'bg-text-2',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: '#10B981',
    bg: 'bg-brand-green/10',
    text: 'text-brand-green',
    dot: 'bg-brand-green',
  },
  IN_REVIEW: {
    label: 'In Review',
    color: '#F59E0B',
    bg: 'bg-brand-amber/10',
    text: 'text-brand-amber',
    dot: 'bg-brand-amber',
  },
  COMPLETE: {
    label: 'Complete',
    color: '#3B82F6',
    bg: 'bg-accent/10',
    text: 'text-accent',
    dot: 'bg-accent',
  },
} as const;

// ─── Role Configuration ───────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  color: string;
  bg: string;
  text: string;
}

export const roleConfig: Record<UserRole, RoleConfig> = {
  ADMIN: {
    label: 'Administrator',
    color: '#EF4444',
    bg: 'bg-brand-red/10',
    text: 'text-brand-red',
  },
  ANALYST: {
    label: 'Security Analyst',
    color: '#8B5CF6',
    bg: 'bg-brand-purple/10',
    text: 'text-brand-purple',
  },
  CLIENT: {
    label: 'Client',
    color: '#3B82F6',
    bg: 'bg-accent/10',
    text: 'text-accent',
  },
} as const;

// ─── Engagement Type Configuration ────────────────────────────────────────

interface EngagementTypeConfig {
  label: string;
  shortLabel: string;
  color: string;
  bg: string;
  text: string;
  description: string;
}

export const engagementTypeConfig: Record<EngagementType, EngagementTypeConfig> = {
  VAPT: {
    label: 'Web Application Pentest',
    shortLabel: 'Web Pentest',
    color: '#3B82F6',
    bg: 'bg-accent/10',
    text: 'text-accent',
    description: 'Comprehensive security assessment of web applications',
  },
  AUDIT: {
    label: 'Security Audit',
    shortLabel: 'Audit',
    color: '#8B5CF6',
    bg: 'bg-brand-purple/10',
    text: 'text-brand-purple',
    description: 'Compliance audits (ISO 27001, CERT-In, etc.)',
  },
  CONSULTANCY: {
    label: 'Consultancy',
    shortLabel: 'Consultancy',
    color: '#10B981',
    bg: 'bg-brand-green/10',
    text: 'text-brand-green',
    description: 'Security advisory and vCISO services',
  },
  SOC: {
    label: 'Managed SOC',
    shortLabel: 'SOC',
    color: '#14B8A6',
    bg: 'bg-brand-teal/10',
    text: 'text-brand-teal',
    description: '24/7 security monitoring and response',
  },
  TRAINING: {
    label: 'Security Training',
    shortLabel: 'Training',
    color: '#EF4444',
    bg: 'bg-brand-red/10',
    text: 'text-brand-red',
    description: 'Security awareness and hands-on workshops',
  },
  APPSEC: {
    label: 'Application Security',
    shortLabel: 'AppSec',
    color: '#F59E0B',
    bg: 'bg-brand-amber/10',
    text: 'text-brand-amber',
    description: 'DevSecOps integration and secure code review',
  },
  RETEST: {
    label: 'Retest',
    shortLabel: 'Retest',
    color: '#60A5FA',
    bg: 'bg-accent-light/10',
    text: 'text-accent-light',
    description: 'Retesting of previously identified vulnerabilities',
  },
} as const;

// ─── Progress Helpers ─────────────────────────────────────────────────────

/**
 * Returns a Tailwind color class based on progress percentage.
 */
export function getProgressColor(progress: number): string {
  if (progress >= 100) return 'bg-brand-green';
  if (progress >= 75) return 'bg-accent';
  if (progress >= 50) return 'bg-brand-amber';
  if (progress >= 25) return 'bg-brand-purple';
  return 'bg-text-3';
}

// ─── Text Truncation ──────────────────────────────────────────────────────

/**
 * Truncates text to a maximum length with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}…`;
}

// ─── User Display Name ───────────────────────────────────────────────────

/**
 * Returns a display-friendly name from user fields.
 */
export function getUserDisplayName(
  user: { firstName: string; lastName: string } | null | undefined,
): string {
  if (!user) return 'Unknown';
  return `${user.firstName} ${user.lastName}`.trim();
}

/**
 * Returns user initials for avatar display.
 */
export function getUserInitials(
  user: { firstName: string; lastName: string } | null | undefined,
): string {
  if (!user) return '??';
  const first = user.firstName.charAt(0).toUpperCase();
  const last = user.lastName.charAt(0).toUpperCase();
  return `${first}${last}`;
}

// ─── Slug Helpers ─────────────────────────────────────────────────────────

/**
 * Converts a string to a URL-friendly slug.
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ─── Download Helper ──────────────────────────────────────────────────────

/**
 * Triggers a browser download for a Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
