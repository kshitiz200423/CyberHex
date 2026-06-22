import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Kshitiz Agrawal', title: 'Founder & CEO', desc: 'Cybersecurity veteran with 10+ years of experience in offensive security and compliance. OSCP, CEH certified.', initials: 'KA' },
  { name: 'Arjun Singh', title: 'Head of Offensive Security', desc: 'OSCP, CRTP certified. Expert in network and web application penetration testing with 8+ years of experience.', initials: 'AS' },
  { name: 'Priya Sharma', title: 'Lead Security Analyst', desc: 'CISSP certified. Specialises in ISO 27001, RBI compliance, and security programme development.', initials: 'PS' },
  { name: 'Rohit Kumar', title: 'SOC Manager', desc: '24/7 operations lead. Expert in SIEM technologies, threat hunting, and incident response.', initials: 'RK' },
];

const VALUES = [
  { icon: '🛡️', title: 'Integrity', desc: 'We operate with complete transparency. Every finding is accurate, every recommendation is honest.' },
  { icon: '⚡', title: 'Excellence', desc: 'We hold ourselves to the highest technical standards. No shortcuts in security.' },
  { icon: '🤝', title: 'Accessibility', desc: 'Enterprise-grade security should be accessible to every organisation, regardless of size.' },
];

const DIFFERENTIATORS = [
  { title: 'India-Focused Compliance', desc: 'Deep expertise in CERT-In, RBI, SEBI, DPDP Act 2023, and IT Act 2000.' },
  { title: 'Affordable for SMEs', desc: 'Flexible pricing designed for small and medium businesses and educational institutions.' },
  { title: 'CERT-In Standards', desc: 'All assessments follow CERT-In vulnerability disclosure guidelines.' },
  { title: '24/7 Support', desc: 'Round-the-clock SOC monitoring and incident response for critical situations.' },
  { title: 'NDA Protected', desc: 'Every engagement is covered by strict NDA. Your data stays confidential.' },
  { title: 'Fixed-Price Engagements', desc: 'No surprise bills. Clear scope, fixed price, defined deliverables.' },
];

const CERTS = ['ISO 27001', 'CERT-In', 'OWASP', 'CEH', 'OSCP', 'CISSP'];

const About: React.FC = () => (
  <div className="pt-20">
    {/* Hero */}
    <section className="section bg-grid-pattern border-b border-border">
      <div className="container-custom max-w-4xl">
        <p className="mono-label text-[11px] text-accent mb-3">ABOUT US</p>
        <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-6">
          Securing India's{' '}
          <span className="text-gradient">Digital Future</span>
        </h1>
        <p className="text-lg text-text-2 leading-relaxed">
          Auronix Technologies was founded by cybersecurity professionals who saw a gap in the Indian market: SMEs and educational institutions
          needed access to the same calibre of security services that large enterprises receive — but at a price point that makes sense.
          Based in Bareilly, Uttar Pradesh, we serve organisations across India with professional, thorough, and affordable cybersecurity solutions.
        </p>
      </div>
    </section>

    {/* Mission / Vision / Values */}
    <section className="section">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div key={i} className="card card-hover text-center">
              <span className="text-4xl mb-4 block">{v.icon}</span>
              <h3 className="font-display text-xl font-bold text-text mb-2">{v.title}</h3>
              <p className="text-sm text-text-2">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Team */}
    <section className="section bg-bg-2 border-y border-border">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="mono-label text-[11px] text-accent mb-3">OUR TEAM</p>
          <h2 className="font-display text-3xl font-bold text-text">The Experts Behind Auronix</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TEAM.map((member, i) => (
            <div key={i} className="card card-hover text-center group">
              <div className="w-20 h-20 mx-auto mb-4 hex-clip bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                <span className="font-display text-xl font-bold text-accent">{member.initials}</span>
              </div>
              <h3 className="font-display text-base font-bold text-text">{member.name}</h3>
              <p className="font-mono text-xs text-accent uppercase tracking-wider mb-3">{member.title}</p>
              <p className="text-xs text-text-2">{member.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Why Auronix */}
    <section className="section">
      <div className="container-custom">
        <div className="text-center mb-12">
          <p className="mono-label text-[11px] text-accent mb-3">WHY CHOOSE US</p>
          <h2 className="font-display text-3xl font-bold text-text">What Makes Us Different</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DIFFERENTIATORS.map((d, i) => (
            <div key={i} className="card card-hover">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display text-base font-bold text-text mb-1">{d.title}</h3>
              <p className="text-sm text-text-2">{d.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Certifications */}
    <section className="py-16 border-y border-border bg-bg-2">
      <div className="container-custom">
        <p className="mono-label text-[11px] text-accent text-center mb-8">CERTIFICATIONS & STANDARDS</p>
        <div className="flex flex-wrap justify-center gap-4">
          {CERTS.map((cert, i) => (
            <div key={i} className="px-6 py-3 bg-surface border border-border rounded-xl font-mono text-sm text-text-2 hover:border-accent/30 hover:text-accent transition-all">
              {cert}
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section">
      <div className="container-custom text-center max-w-2xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-text mb-4">Ready to Work with Us?</h2>
        <p className="text-text-2 mb-8">Let's discuss how we can help secure your organisation. No obligations, no pressure — just honest advice.</p>
        <Link to="/contact" className="btn-primary">Get in Touch</Link>
      </div>
    </section>
  </div>
);

export default About;
