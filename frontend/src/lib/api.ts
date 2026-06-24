/* ═══════════════════════════════════════════════════════════════════════════
 * Auronix Technologies — Axios Instance & API Helpers
 * JWT refresh interceptor with request queueing; typed API methods.
 * ═══════════════════════════════════════════════════════════════════════════ */

import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore } from './store';
import type {
  ApiResponse,
  ContactSubmission,
  CreateClientInput,
  CreateEngagementInput,
  CreateFindingInput,
  DashboardStats,
  Engagement,
  EngagementFilters,
  Finding,
  FindingFilters,
  LoginInput,
  LoginResponse,
  PaginatedResponse,
  Report,
  ReportFilters,
  SettingsInput,
  ChangePasswordInput,
  TokenResponse,
  UpdateEngagementInput,
  UpdateFindingInput,
  User,
  Verify2faInput,
} from './types';

// ─── Axios Instance ────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── CSRF Token Helper ─────────────────────────────────────────────────────

function getCsrfToken(): string | null {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('XSRF-TOKEN='));
  return match ? decodeURIComponent(match.split('=')[1] ?? '') : null;
}

// ─── Request Interceptor ──────────────────────────────────────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { accessToken } = useAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }

  return config;
});

// ─── Response Interceptor — Token Refresh & Request Queue ─────────────────

interface QueuedRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let requestQueue: QueuedRequest[] = [];

function processQueue(error: unknown, token: string | null = null): void {
  requestQueue.forEach((pending) => {
    if (error) {
      pending.reject(error);
    } else if (token) {
      pending.resolve(token);
    }
  });
  requestQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    // Only handle 401 errors for non-auth endpoints
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url === '/auth/login' ||
      originalRequest.url === '/auth/refresh' ||
      originalRequest.url === '/auth/verify-2fa'
    ) {
      return Promise.reject(error);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        requestQueue.push({ resolve, reject });
      }).then((token) => {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<ApiResponse<TokenResponse>>(
        '/api/auth/refresh',
        {},
        { withCredentials: true },
      );

      const newToken = data.data.accessToken;
      const user = data.data.user;

      useAuthStore.getState().setAuth(user, newToken);
      processQueue(null, newToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
      }

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      useAuthStore.getState().clearAuth();

      // Only redirect if we're in a browser context
      if (typeof window !== 'undefined') {
        window.location.href = '/portal/login';
      }

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

// ─── Typed API Helpers ─────────────────────────────────────────────────────

function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// ── Auth API ───────────────────────────────────────────────────────────────

export const authApi = {
  login: (input: LoginInput) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', input).then((r) => r.data.data),

  verify2fa: (input: Verify2faInput) =>
    api.post<ApiResponse<TokenResponse>>('/auth/verify-2fa', input).then((r) => r.data.data),

  refresh: () =>
    api.post<ApiResponse<TokenResponse>>('/auth/refresh').then((r) => r.data.data),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout').then((r) => r.data),

  me: () =>
    api.get<ApiResponse<User>>('/auth/me').then((r) => r.data.data),
};

// ── Engagements API ────────────────────────────────────────────────────────

export const engagementsApi = {
  list: (filters?: EngagementFilters) =>
    api
      .get<PaginatedResponse<Engagement>>(
        `/engagements${buildQueryString((filters ?? {}) as Record<string, unknown>)}`,
      )
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Engagement>>(`/engagements/${id}`).then((r) => r.data.data),

  create: (input: CreateEngagementInput) =>
    api.post<ApiResponse<Engagement>>('/engagements', input).then((r) => r.data.data),

  update: (id: string, input: UpdateEngagementInput) =>
    api.patch<ApiResponse<Engagement>>(`/engagements/${id}`, input).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/engagements/${id}`).then((r) => r.data),
};

// ── Reports API ────────────────────────────────────────────────────────────

export const reportsApi = {
  list: (filters?: ReportFilters) =>
    api
      .get<PaginatedResponse<Report>>(
        `/reports${buildQueryString((filters ?? {}) as Record<string, unknown>)}`,
      )
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Report>>(`/reports/${id}`).then((r) => r.data.data),

  upload: (input: FormData, config?: AxiosRequestConfig) =>
    api
      .post<ApiResponse<Report>>('/reports/upload', input, {
        headers: { 'Content-Type': 'multipart/form-data' },
        ...config,
      })
      .then((r) => r.data.data),

  download: (id: string) =>
    api
      .get<Blob>(`/reports/${id}/download`, { responseType: 'blob' })
      .then((r) => r.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/reports/${id}`).then((r) => r.data),
};

// ── Findings API ───────────────────────────────────────────────────────────

export const findingsApi = {
  list: (filters?: FindingFilters) =>
    api
      .get<PaginatedResponse<Finding>>(
        `/findings${buildQueryString((filters ?? {}) as Record<string, unknown>)}`,
      )
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<Finding>>(`/findings/${id}`).then((r) => r.data.data),

  create: (input: CreateFindingInput) =>
    api.post<ApiResponse<Finding>>('/findings', input).then((r) => r.data.data),

  update: (id: string, input: UpdateFindingInput) =>
    api.patch<ApiResponse<Finding>>(`/findings/${id}`, input).then((r) => r.data.data),

  delete: (id: string) =>
    api.delete<ApiResponse<null>>(`/findings/${id}`).then((r) => r.data),
};

// ── Contact API ────────────────────────────────────────────────────────────

export const contactApi = {
  submit: (input: ContactSubmission) =>
    api.post<ApiResponse<{ id: string }>>('/contact', input).then((r) => r.data.data),
};

// ── Clients API (Admin) ────────────────────────────────────────────────────

export const clientsApi = {
  list: (params?: { page?: number; limit?: number }) =>
    api
      .get<PaginatedResponse<User>>(
        `/clients${buildQueryString((params ?? {}) as Record<string, unknown>)}`,
      )
      .then((r) => r.data),

  getById: (id: string) =>
    api.get<ApiResponse<User>>(`/clients/${id}`).then((r) => r.data.data),

  create: (input: CreateClientInput) =>
    api.post<ApiResponse<User>>('/clients', input).then((r) => r.data.data),
};

// ── Dashboard API ──────────────────────────────────────────────────────────

export const dashboardApi = {
  getStats: () =>
    api.get<ApiResponse<DashboardStats>>('/dashboard/stats').then((r) => r.data.data),
};

// ── Settings API ───────────────────────────────────────────────────────────

export const settingsApi = {
  updateProfile: (input: SettingsInput) =>
    api.patch<ApiResponse<User>>('/settings/profile', input).then((r) => r.data.data),

  changePassword: (input: ChangePasswordInput) =>
    api.post<ApiResponse<null>>('/settings/password', input).then((r) => r.data),

  enable2fa: () =>
    api
      .post<ApiResponse<{ qrCode: string; secret: string }>>('/settings/2fa/enable')
      .then((r) => r.data.data),

  verify2fa: (code: string) =>
    api.post<ApiResponse<null>>('/settings/2fa/verify', { code }).then((r) => r.data),

  disable2fa: (code: string) =>
    api.post<ApiResponse<null>>('/settings/2fa/disable', { code }).then((r) => r.data),
};

export default api;
