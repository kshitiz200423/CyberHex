import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Marquee from '@/components/ui/Marquee';
import ServiceCard from '@/components/ui/ServiceCard';
import AnimatedTerminal from '@/components/ui/AnimatedTerminal';

/* ─── Icon Components ─────────────────────────────────────── */
const ShieldIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ClipboardIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const LightbulbIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
  </svg>
);

const EyeIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const UsersIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);

const CloudIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ─── Static Data ─────────────────────────────────────────── */
const marqueeItems = [
  'VULNERABILITY ASSESSMENT',
  'PENETRATION TESTING',
  'ISO 27001 AUDIT',
  'SOC MONITORING',
  'SECURITY TRAINING',
  'CLOUD SECURITY',
  'OWASP TOP 10',
  'CERT-IN COMPLIANCE',
  'INCIDENT RESPONSE',
  'THREAT INTELLIGENCE',
] as const;

const services = [
  {
    title: 'VAPT',
    description: 'Comprehensive vulnerability assessment and penetration testing to identify and remediate security weaknesses before attackers exploit them.',
    icon: <ShieldIcon />,
    accentColor: 'accent',
    features: ['Network & Web App Testing', 'API Security Assessment', 'Mobile App Security', 'Detailed Remediation Report'],
    href: '/services#vapt',
  },
  {
    title: 'Security Audits',
    description: 'Thorough compliance audits against ISO 27001, RBI, SEBI, and CERT-In frameworks with actionable gap analysis reports.',
    icon: <ClipboardIcon />,
    accentColor: 'brand-green',
    features: ['ISO 27001 Compliance', 'RBI/SEBI Frameworks', 'CERT-In Guidelines', 'Gap Analysis Report'],
    href: '/services#audit',
  },
  {
    title: 'Consultancy',
    description: 'Strategic security advisory and virtual CISO services to build a robust security programme tailored to your organisation.',
    icon: <LightbulbIcon />,
    accentColor: 'brand-purple',
    features: ['CISO-as-a-Service', 'Security Roadmap', 'Risk Assessment', 'Policy Development'],
    href: '/services#consultancy',
  },
  {
    title: 'Managed SOC',
    description: 'Round-the-clock security operations centre monitoring with real-time threat detection and rapid incident response.',
    icon: <EyeIcon />,
    accentColor: 'brand-amber',
    features: ['24/7 Monitoring', 'Threat Detection', 'Incident Response', 'Monthly Reports'],
    href: '/services#soc',
  },
  {
    title: 'Security Training',
    description: 'Comprehensive security awareness programmes, phishing simulations, and staff workshops to build a security-first culture.',
    icon: <UsersIcon />,
    accentColor: 'brand-teal',
    features: ['Phishing Simulations', 'Staff Workshops', 'Awareness Programs', 'Custom Curricula'],
    href: '/services#training',
  },
  {
    title: 'Cloud & App Security',
    description: 'Secure your cloud infrastructure and applications with OWASP-aligned assessments and DevSecOps integration.',
    icon: <CloudIcon />,
    accentColor: 'brand-red',
    features: ['AWS/Azure/GCP', 'OWASP Assessment', 'API Security', 'DevSecOps Integration'],
    href: '/services#appsec',
  },
] as const;

const terminalLines = [
  { text: 'auronix-scan --target client.com --type full', type: 'command' as const },
  { text: '[INFO] Initializing Auronix VAPT Engine v3.2...', type: 'info' as const },
  { text: '[SCAN] Running port enumeration...', type: 'output' as const },
  { text: '[SCAN] Testing OWASP Top 10 vulnerabilities...', type: 'output' as const },
  { text: '[CRITICAL] SQL Injection found: /api/users?id=1', type: 'error' as const },
  { text: '[HIGH] XSS vulnerability in search parameter', type: 'warning' as const },
  { text: '[MEDIUM] Missing security headers (CSP, HSTS)', type: 'warning' as const },
  { text: '[INFO] 47 endpoints tested, 3 vulnerabilities found', type: 'info' as const },
  { text: '[SUCCESS] Report generated: VAPT-2025-071.pdf', type: 'success' as const },
  { text: 'auronix-report --send client@company.com', type: 'command' as const },
  { text: '[SUCCESS] Encrypted report delivered via secure portal', type: 'success' as const },
] as const;

const trustItems = [
  'CERT-In empanelled security firm',
  '24/7 SOC monitoring & incident response',
  'India-compliant frameworks (RBI, SEBI, DPDP)',
  'Budget-friendly packages for SMEs',
  'NDA-protected engagements with zero data leaks',
] as const;

const processSteps = [
  {
    step: '01',
    title: 'Discovery & Scoping',
    description: 'We understand your environment, assets, and threat landscape to define the perfect engagement scope.',
  },
  {
    step: '02',
    title: 'Assessment & Testing',
    description: 'Comprehensive security testing using industry-standard tools and manual techniques by certified experts.',
  },
  {
    step: '03',
    title: 'Analysis & Reporting',
    description: 'Detailed findings with severity ratings, CVSS scores, proof-of-concept exploits, and clear remediation guidance.',
  },
  {
    step: '04',
    title: 'Remediation Support',
    description: 'We help your team fix vulnerabilities with hands-on guidance and provide free retesting to verify fixes.',
  },
] as const;

const metrics = [
  { value: '50+', label: 'Clients Protected' },
  { value: '99.9%', label: 'Threat Detection' },
  { value: '24/7', label: 'SOC Monitoring' },
] as const;

const trustBadges = ['ISO 27001', 'CERT-In', 'OWASP', 'NIST'] as const;

/* ─── Fade-in-on-scroll Hook ──────────────────────────────── */
function useFadeIn(): React.RefCallback<HTMLElement> {
  const elRef = useRef<HTMLElement | null>(null);

  const setRef = (el: HTMLElement | null) => {
    elRef.current = el;
  };

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);

    return () => observer.disconnect();
  });

  return setRef;
}

/* ─── Floating Hex Decoration ─────────────────────────────── */
const FloatingHex: React.FC<{ size: number; top: string; left: string; delay: number; opacity?: number }> = ({
  size,
  top,
  left,
  delay,
  opacity = 0.06,
}) => (
  <div
    className="absolute animate-float pointer-events-none"
    style={{
      top,
      left,
      animationDelay: `${delay}s`,
      width: size,
      height: size,
      opacity,
    }}
  >
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon
        points="50,2 95,27 95,73 50,98 5,73 5,27"
        stroke="currentColor"
        strokeWidth="1"
        className="text-accent"
      />
    </svg>
  </div>
);

/* ─── Animated Counter ────────────────────────────────────── */
const AnimatedMetric: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.5 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`text-center transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      <p className="font-display text-3xl sm:text-4xl font-extrabold text-gradient">{value}</p>
      <p className="mono-label text-[10px] mt-1">{label}</p>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════ */
/*  HOME PAGE                                                  */
/* ═══════════════════════════════════════════════════════════ */
const Home: React.FC = () => {
  const servicesRef = useFadeIn();
  const trustRef = useFadeIn();
  const processRef = useFadeIn();
  const ctaRef = useFadeIn();

  return (
    <main className="min-h-screen bg-bg overflow-x-hidden">
      {/* ── Section 2: Hero ───────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center bg-grid-pattern">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-purple/5 rounded-full blur-3xl" />

          {/* Floating hex decorations */}
          <FloatingHex size={120} top="10%" left="5%" delay={0} />
          <FloatingHex size={80} top="20%" left="85%" delay={1.5} opacity={0.04} />
          <FloatingHex size={60} top="65%" left="8%" delay={3} opacity={0.05} />
          <FloatingHex size={100} top="70%" left="80%" delay={2} />
          <FloatingHex size={45} top="40%" left="92%" delay={4} opacity={0.03} />
          <FloatingHex size={70} top="85%" left="50%" delay={1} opacity={0.04} />
        </div>

        <div className="container-custom relative z-10 text-center py-24">
          {/* Mono label */}
          <p className="mono-label text-[11px] text-accent mb-6 animate-fade-in">
            ⬡ CYBERSECURITY EXCELLENCE
          </p>

          {/* Headline */}
          <h1 className="section-title max-w-4xl mx-auto mb-6 animate-fade-up">
            We Protect Your{' '}
            <span className="text-gradient">Digital Assets</span>
          </h1>

          {/* Subheadline */}
          <p className="text-text-2 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '150ms' }}>
            Enterprise-grade cybersecurity for SMEs and educational institutions across India.
            From VAPT to managed SOC — we make world-class security accessible.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <Link to="/contact" className="btn-primary">
              <ShieldIcon className="w-4 h-4" />
              Request Assessment
            </Link>
            <Link to="/portal/login" className="btn-outline">
              Client Portal
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-12 sm:gap-20">
            {metrics.map((m) => (
              <AnimatedMetric key={m.label} value={m.value} label={m.label} />
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg to-transparent pointer-events-none" />
      </section>

      {/* ── Section 3: Marquee ────────────────────────────────── */}
      <Marquee items={[...marqueeItems]} speed={32} separator="⬡" />

      {/* ── Section 4: Services Grid ──────────────────────────── */}
      <section ref={servicesRef} className="section" id="services">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="mono-label text-[11px] text-accent mb-4">⬡ OUR SERVICES</p>
            <h2 className="section-title mb-4">
              Comprehensive Security{' '}
              <span className="text-gradient">Solutions</span>
            </h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              Six specialised service lines designed to protect every aspect of your digital infrastructure, from network perimeter to cloud workloads.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <ServiceCard
                key={service.title}
                title={service.title}
                description={service.description}
                icon={service.icon}
                accentColor={service.accentColor}
                features={[...service.features]}
                href={service.href}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 5: Trust ──────────────────────────────────── */}
      <section ref={trustRef} className="section bg-bg-2/50 border-y border-border">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - checklist */}
            <div>
              <p className="mono-label text-[11px] text-accent mb-4">⬡ WHY AURONIX</p>
              <h2 className="section-title mb-8">
                Why Choose{' '}
                <span className="text-gradient">Auronix</span>
              </h2>

              <ul className="space-y-4">
                {trustItems.map((item) => (
                  <li key={item} className="flex items-start gap-3 group">
                    <CheckCircleIcon className="w-5 h-5 text-brand-green mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform" />
                    <span className="text-text-2 group-hover:text-text transition-colors">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Link to="/about" className="btn-outline text-sm">
                  Learn more about us
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right column - terminal */}
            <div>
              <AnimatedTerminal
                lines={[...terminalLines]}
                title="auronix@soc:~"
                typingSpeed={25}
                className="shadow-glow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Process ────────────────────────────────── */}
      <section ref={processRef} className="section">
        <div className="container-custom">
          <div className="text-center mb-16">
            <p className="mono-label text-[11px] text-accent mb-4">⬡ OUR PROCESS</p>
            <h2 className="section-title mb-4">
              How We{' '}
              <span className="text-gradient">Work</span>
            </h2>
            <p className="text-text-2 max-w-2xl mx-auto">
              A battle-tested methodology refined across 50+ engagements, delivering consistent, high-quality results.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line (hidden on mobile) */}
            <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border-2 to-transparent" aria-hidden="true" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {processSteps.map((step, i) => (
                <div
                  key={step.step}
                  className="relative group text-center"
                  style={{ animationDelay: `${i * 150}ms` }}
                >
                  {/* Step number circle */}
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full border border-border-2 bg-surface flex items-center justify-center relative group-hover:border-accent group-hover:shadow-glow-sm transition-all duration-500">
                    <span className="font-mono text-2xl font-bold text-accent">{step.step}</span>
                    {/* Animated ring */}
                    <div className="absolute inset-0 rounded-full border border-accent/0 group-hover:border-accent/30 group-hover:scale-110 transition-all duration-500" />
                  </div>

                  <h3 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-text-2 text-sm leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 7: CTA Strip ──────────────────────────────── */}
      <section ref={ctaRef} className="relative py-20 overflow-hidden border-t border-border">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-bg-3 via-surface/40 to-bg-3 pointer-events-none" />
        <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />

        <div className="container-custom relative z-10 text-center">
          <p className="mono-label text-[11px] text-accent mb-4">⬡ GET STARTED</p>
          <h2 className="section-title mb-4 max-w-3xl mx-auto">
            Ready to Secure Your{' '}
            <span className="text-gradient">Organisation?</span>
          </h2>
          <p className="text-text-2 text-lg max-w-xl mx-auto mb-8">
            Get a free security consultation and discover how Auronix can protect your digital assets. No obligations, just expert advice.
          </p>
          <Link to="/contact" className="btn-primary text-base px-8 py-4">
            <ShieldIcon className="w-5 h-5" />
            Schedule Free Consultation
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 mt-12">
            {trustBadges.map((badge) => (
              <div
                key={badge}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface/30 hover:border-accent/30 transition-colors"
              >
                <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
                <span className="mono-label text-[10px] text-text">{badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
