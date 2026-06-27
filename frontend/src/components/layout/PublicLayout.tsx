import React, { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '@/components/ui/Logo';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/about', label: 'About' },
  { to: '/blog', label: 'Blog' },
  { to: '/resources', label: 'Resources' },
  { to: '/contact', label: 'Contact' },
] as const;

const PublicLayout: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen bg-bg overflow-x-hidden">
      {/* ─── Navigation ─────────────────────────────────── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-bg/90 backdrop-blur-xl border-b border-border shadow-lg shadow-black/20'
            : 'bg-transparent'
        }`}
      >
        <div className="container-custom">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center group">
              <Logo size={44} />
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-accent bg-accent/10'
                        : 'text-text-2 hover:text-text hover:bg-surface/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>

            {/* CTA + Mobile toggle */}
            <div className="flex items-center gap-3">
              <Link
                to="/portal/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 font-mono text-xs uppercase tracking-wider text-accent border border-accent/30 rounded-lg hover:bg-accent/10 transition-all duration-200"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Client Portal
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-text-2 hover:text-text transition-colors"
                aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMobileMenuOpen}
              >
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Mobile Menu Overlay ─────────────────────────── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={toggleMobileMenu}
          />
          <div className="absolute top-16 left-0 right-0 bg-bg-2 border-b border-border p-6 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-3 font-mono text-sm uppercase tracking-wider rounded-lg transition-all ${
                      isActive
                        ? 'text-accent bg-accent/10'
                        : 'text-text-2 hover:text-text hover:bg-surface'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <div className="border-t border-border my-2" />
              <Link
                to="/portal/login"
                className="btn-primary text-center"
              >
                Client Portal
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ─── Page Content ────────────────────────────────── */}
      <main>
        <Outlet />
      </main>

      {/* ─── Footer ──────────────────────────────────────── */}
      <footer className="border-t border-border bg-bg-2">
        <div className="container-custom py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="flex items-center mb-4">
                <Logo size={48} />
              </Link>
              <p className="text-sm text-text-2 leading-relaxed mb-4">
                Enterprise-grade cybersecurity solutions for Indian SMEs and educational institutions.
              </p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-green animate-pulse" />
                <span className="font-mono text-xs text-brand-green">SOC ACTIVE 24/7</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="mono-label text-[11px] mb-4">Services</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'VAPT', hash: '#vapt' },
                  { label: 'Security Audits', hash: '#audit' },
                  { label: 'Consultancy', hash: '#consultancy' },
                  { label: 'Managed SOC', hash: '#soc' },
                  { label: 'Security Training', hash: '#training' },
                  { label: 'Cloud & App Security', hash: '#appsec' },
                ].map((s) => (
                  <li key={s.hash}>
                    <Link
                      to={`/services${s.hash}`}
                      className="text-sm text-text-2 hover:text-accent transition-colors"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="mono-label text-[11px] mb-4">Company</h4>
              <ul className="space-y-2.5">
                {[
                  { label: 'About Us', to: '/about' },
                  { label: 'Case Studies', to: '/case-studies' },
                  { label: 'Blog', to: '/blog' },
                  { label: 'Resources', to: '/resources' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-text-2 hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="mono-label text-[11px] mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <a href="mailto:contact@auronixtechnologies.com" className="text-sm text-text-2 hover:text-accent transition-colors">
                    contact@auronixtechnologies.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                  </svg>
                  <span className="text-sm text-text-2">+91 9953933965</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                  <span className="text-sm text-text-2">
                    Gurugram, Haryana, India
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-3 font-mono">
              © {new Date().getFullYear()} Auronix Technologies. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-4">
              <span className="mono-label text-[9px] text-text-3">CERT-IN EMPANELLED</span>
              <span className="text-text-3">·</span>
              <span className="mono-label text-[9px] text-text-3">ISO 27001</span>
              <span className="text-text-3">·</span>
              <span className="mono-label text-[9px] text-text-3">OWASP</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
