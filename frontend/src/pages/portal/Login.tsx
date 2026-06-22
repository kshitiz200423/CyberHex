/* ═══════════════════════════════════════════════════════════════════════════
 * Auronix Technologies — Portal Login Page
 * Standalone login page (no portal layout wrapper).
 * Email/password + 2FA flow with mock auth.
 * ═══════════════════════════════════════════════════════════════════════════ */

import React, { useState, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Logo from '@/components/ui/Logo';
import { FieldWrap, Input } from '@/components/ui/FormField';
import { useAuthStore } from '@/lib/store';
import type { User } from '@/lib/types';

// ─── Schemas ──────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Mock Data ────────────────────────────────────────────────────────────

const MOCK_USER: User = {
  id: 'usr_01',
  email: 'admin@auronix.io',
  firstName: 'Marcus',
  lastName: 'Chen',
  role: 'admin',
  phone: '+1 555-0142',
  totpEnabled: true,
  twoFactorVerified: true,
  lastLogin: '2026-06-07T06:30:00Z',
  orgId: 'org_01',
  organisation: {
    id: 'org_01',
    name: 'Auronix Technologies',
    domain: 'auronix.io',
    industry: 'Cybersecurity',
    contactEmail: 'contact@auronix.io',
  },
};

const SECURITY_FEATURES = [
  { label: 'End-to-end encrypted communications', icon: '🔒' },
  { label: 'Multi-factor authentication enforced', icon: '🛡️' },
  { label: 'SOC 2 Type II compliant platform', icon: '✓' },
  { label: 'Real-time threat monitoring', icon: '⚡' },
] as const;

// ─── Component ────────────────────────────────────────────────────────────

const Login: React.FC = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [otpValues, setOtpValues] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  // ── Login Handler ────────────────────────────────────────────────────

  const onLogin = useCallback(
    async (data: LoginFormData) => {
      setIsSubmitting(true);
      setLoginError(null);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (data.email === 'admin@auronix.io' && data.password === 'password123') {
        // Mock: account has 2FA enabled
        setStep('2fa');
        setIsSubmitting(false);
        // Focus first OTP input after transition
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else if (data.email && data.password.length >= 8) {
        // No 2FA path — direct login for demo
        setAuth(MOCK_USER, 'mock-jwt-token-' + Date.now());
        navigate('/portal/dashboard', { replace: true });
      } else {
        setLoginError('Invalid email or password. Please try again.');
        setIsSubmitting(false);
      }
    },
    [navigate, setAuth],
  );

  // ── OTP Handlers ─────────────────────────────────────────────────────

  const handleOtpChange = useCallback(
    (index: number, value: string) => {
      if (!/^\d*$/.test(value)) return;

      const newValues = [...otpValues];
      newValues[index] = value.slice(-1);
      setOtpValues(newValues);
      setOtpError(null);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    },
    [otpValues],
  );

  const handleOtpKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
        otpRefs.current[index - 1]?.focus();
      }
    },
    [otpValues],
  );

  const handleOtpPaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 0) return;

    const newValues = [...Array<string>(6)].map((_, i) => pastedData[i] || '');
    setOtpValues(newValues);

    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  }, []);

  const handleVerify2fa = useCallback(async () => {
    const code = otpValues.join('');
    if (code.length !== 6) {
      setOtpError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1200));

    if (code === '123456' || code.length === 6) {
      setAuth(MOCK_USER, 'mock-jwt-token-' + Date.now());
      navigate('/portal/dashboard', { replace: true });
    } else {
      setOtpError('Invalid verification code. Please try again.');
      setIsVerifying(false);
    }
  }, [otpValues, navigate, setAuth]);

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex bg-bg">
      {/* ── Left Panel (Branding) ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-bg-2 flex-col justify-between p-12">
        {/* Background decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-50" />
        <div
          className="absolute -top-32 -right-32 w-96 h-96 hex-clip bg-accent/5"
          style={{ transform: 'rotate(15deg)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-72 h-72 hex-clip bg-accent/3"
          style={{ transform: 'rotate(-10deg)' }}
        />
        <div
          className="absolute top-1/2 right-20 w-48 h-48 hex-clip bg-accent/[0.03]"
          style={{ transform: 'translateY(-50%) rotate(30deg)' }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* Logo + Name */}
          <div className="flex items-center gap-4 mb-16">
            <Logo size={64} />
          </div>

          {/* Tagline */}
          <div className="max-w-md">
            <h2 className="font-display text-4xl font-extrabold text-text leading-tight mb-4">
              Secure Client{' '}
              <span className="text-gradient">Portal</span>
            </h2>
            <p className="text-text-2 text-lg leading-relaxed mb-10">
              Access your security assessments, vulnerability reports, and engagement
              status through our encrypted portal.
            </p>
          </div>

          {/* Security checklist */}
          <div className="space-y-4">
            {SECURITY_FEATURES.map((feature) => (
              <div
                key={feature.label}
                className="flex items-center gap-3 text-text-2"
              >
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-sm flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-sm">{feature.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <div className="divider mb-6" />
          <p className="text-xs text-text-3 font-mono">
            © 2026 Auronix Technologies. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── Right Panel (Login Form) ──────────────────────────── */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Logo size={48} />
          </div>

          {step === 'credentials' ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <h2 className="font-display text-2xl font-extrabold text-text mb-2">
                  Sign In
                </h2>
                <p className="text-text-2 text-sm">
                  Enter your credentials to access the client portal
                </p>
              </div>

              {/* Error alert */}
              {loginError && (
                <div
                  className="mb-6 p-4 rounded-lg bg-brand-red/10 border border-brand-red/20 flex items-center gap-3"
                  role="alert"
                >
                  <svg
                    className="w-5 h-5 text-brand-red flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-brand-red">{loginError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onLogin)} className="space-y-5" noValidate>
                <FieldWrap
                  label="Email Address"
                  htmlFor="email"
                  error={errors.email?.message}
                  required
                >
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    error={!!errors.email}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                        />
                      </svg>
                    }
                    {...register('email')}
                  />
                </FieldWrap>

                <FieldWrap
                  label="Password"
                  htmlFor="password"
                  error={errors.password?.message}
                  required
                >
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••••"
                    autoComplete="current-password"
                    error={!!errors.password}
                    icon={
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                        />
                      </svg>
                    }
                    {...register('password')}
                  />
                </FieldWrap>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox"
                      aria-label="Remember this device"
                    />
                    <span className="text-xs text-text-2">Remember device</span>
                  </label>
                  <button
                    type="button"
                    className="text-xs text-accent hover:text-accent-light transition-colors"
                    onClick={() => alert('Password reset flow not implemented in demo')}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Authenticating…
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
            </>
          ) : (
            /* ── 2FA Step ───────────────────────────────────────── */
            <div>
              <button
                type="button"
                onClick={() => {
                  setStep('credentials');
                  setOtpValues(['', '', '', '', '', '']);
                  setOtpError(null);
                }}
                className="btn-ghost mb-6 -ml-4 text-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
                Back
              </button>

              <div className="mb-8">
                <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                  <svg
                    className="w-7 h-7 text-accent"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                    />
                  </svg>
                </div>
                <h2 className="font-display text-2xl font-extrabold text-text mb-2">
                  Two-Factor Verification
                </h2>
                <p className="text-text-2 text-sm">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              {/* OTP error */}
              {otpError && (
                <div
                  className="mb-6 p-4 rounded-lg bg-brand-red/10 border border-brand-red/20"
                  role="alert"
                >
                  <span className="text-sm text-brand-red">{otpError}</span>
                </div>
              )}

              {/* 6 digit inputs */}
              <div className="flex gap-3 mb-8" onPaste={handleOtpPaste}>
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    aria-label={`Digit ${idx + 1}`}
                    className={`w-12 h-14 text-center text-xl font-mono font-bold rounded-lg transition-all duration-200 ${
                      val
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-bg-2 border-border text-text'
                    } border focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleVerify2fa}
                disabled={isVerifying || otpValues.join('').length < 6}
                className="btn-primary w-full"
              >
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Verifying…
                  </span>
                ) : (
                  'Verify & Continue'
                )}
              </button>

              <p className="text-xs text-text-3 text-center mt-4">
                Didn't receive a code?{' '}
                <button
                  type="button"
                  className="text-accent hover:text-accent-light transition-colors"
                  onClick={() => alert('Resend code not implemented in demo')}
                >
                  Resend
                </button>
              </p>
            </div>
          )}

          {/* Back to website */}
          <div className="mt-8 pt-6 border-t border-border text-center">
            <Link
              to="/"
              className="text-sm text-text-3 hover:text-text-2 transition-colors inline-flex items-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Back to website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
