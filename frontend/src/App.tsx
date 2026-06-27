import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoadingScreen from '@/components/ui/LoadingScreen';
import PublicLayout from '@/components/layout/PublicLayout';
import PortalLayout from '@/components/layout/PortalLayout';
import { useAuthStore } from '@/lib/store';

// ═══════════════════════════════════════════════════════════
// Lazy-loaded pages — route-level code splitting
// ═══════════════════════════════════════════════════════════

// Public pages
const Home = lazy(() => import('@/pages/Home'));
const Services = lazy(() => import('@/pages/Services'));
const CaseStudies = lazy(() => import('@/pages/CaseStudies'));
const Contact = lazy(() => import('@/pages/Contact'));
const About = lazy(() => import('@/pages/About'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Resources = lazy(() => import('@/pages/Resources'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Terms = lazy(() => import('@/pages/Terms'));

// Portal pages
const Login = lazy(() => import('@/pages/portal/Login'));
const Dashboard = lazy(() => import('@/pages/portal/Dashboard'));
const Engagements = lazy(() => import('@/pages/portal/Engagements'));
const Reports = lazy(() => import('@/pages/portal/Reports'));
const Findings = lazy(() => import('@/pages/portal/Findings'));
const Clients = lazy(() => import('@/pages/portal/Clients'));
const UploadReport = lazy(() => import('@/pages/portal/UploadReport'));
const Team = lazy(() => import('@/pages/portal/Team'));
const Settings = lazy(() => import('@/pages/portal/Settings'));

// ═══════════════════════════════════════════════════════════
// Route guards
// ═══════════════════════════════════════════════════════════

const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated());
  if (!isAuthenticated) {
    return <Navigate to="/portal/login" replace />;
  }
  return <>{children}</>;
};

const RequireAdmin: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles = ['ADMIN'],
}) => {
  const userRole = useAuthStore((s) => s.user?.role);
  if (!userRole || !roles.includes(userRole)) {
    return <Navigate to="/portal/dashboard" replace />;
  }
  return <>{children}</>;
};

// ═══════════════════════════════════════════════════════════
// App Router
// ═══════════════════════════════════════════════════════════

const App: React.FC = () => {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* ── Public Routes ─────────────────────────────── */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* ── Portal Login (no layout) ──────────────────── */}
        <Route path="/portal/login" element={<Login />} />

        {/* ── Protected Portal Routes ───────────────────── */}
        <Route
          element={
            <RequireAuth>
              <PortalLayout />
            </RequireAuth>
          }
        >
          <Route path="/portal/dashboard" element={<Dashboard />} />
          <Route path="/portal/engagements" element={<Engagements />} />
          <Route path="/portal/reports" element={<Reports />} />
          <Route path="/portal/findings" element={<Findings />} />
          <Route path="/portal/settings" element={<Settings />} />

          {/* Admin/Analyst only */}
          <Route
            path="/portal/clients"
            element={
              <RequireAdmin roles={['ADMIN', 'ANALYST']}>
                <Clients />
              </RequireAdmin>
            }
          />
          <Route
            path="/portal/upload"
            element={
              <RequireAdmin roles={['ADMIN', 'ANALYST']}>
                <UploadReport />
              </RequireAdmin>
            }
          />
          <Route
            path="/portal/team"
            element={
              <RequireAdmin roles={['ADMIN']}>
                <Team />
              </RequireAdmin>
            }
          />
        </Route>

        {/* ── Portal redirect ───────────────────────────── */}
        <Route path="/portal" element={<Navigate to="/portal/dashboard" replace />} />

        {/* ── Catch-all ─────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default App;
