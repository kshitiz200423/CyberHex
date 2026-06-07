import React, { useState, useEffect, useCallback } from 'react';

const CASE_STUDIES = [
  {
    id: 1, title: 'National University Network Security', sector: 'Education', service: 'VAPT',
    summary: 'Secured 15,000+ student records across 12 campuses.',
    challenge: 'The university operated legacy systems with no formal security policy. Multiple campuses used different network configurations with no centralized security monitoring.',
    findings: [
      { text: '23 critical vulnerabilities in core systems', severity: 'CRITICAL' },
      { text: '45 high-severity issues in web applications', severity: 'HIGH' },
      { text: 'Unpatched servers across 8 campuses', severity: 'HIGH' },
      { text: 'Default credentials on network devices', severity: 'CRITICAL' },
    ],
    metrics: [
      { label: 'Vulns Remediated', value: '98%' },
      { label: 'Campuses Secured', value: '12' },
      { label: 'Records Protected', value: '15K+' },
    ],
    quote: 'HexaShield transformed our security posture. Their team understood the unique challenges of an educational institution and delivered practical, budget-friendly solutions.',
    quoteName: 'Dr. Sharma', quoteTitle: 'IT Director',
  },
  {
    id: 2, title: 'Regional Bank RBI Compliance', sector: 'Banking', service: 'Audit',
    summary: 'Achieved RBI compliance in 8 weeks.',
    challenge: 'The bank had failed an RBI cybersecurity audit and needed urgent remediation before the regulatory deadline. Internal IT lacked expertise in compliance frameworks.',
    findings: [
      { text: 'Missing encryption for data at rest', severity: 'CRITICAL' },
      { text: 'Weak access controls on core banking', severity: 'HIGH' },
      { text: 'No incident response plan documented', severity: 'HIGH' },
      { text: 'Incomplete audit logging', severity: 'MEDIUM' },
    ],
    metrics: [
      { label: 'RBI Compliance', value: '100%' },
      { label: 'Turnaround', value: '8 wks' },
      { label: 'Re-audit Findings', value: '0' },
    ],
    quote: 'Professional, thorough, and efficient. HexaShield helped us achieve full RBI compliance within our tight deadline.',
    quoteName: 'Vikram Mehta', quoteTitle: 'CISO',
  },
  {
    id: 3, title: 'E-commerce Platform Security', sector: 'E-commerce', service: 'AppSec',
    summary: 'Protected 2M+ customer transactions.',
    challenge: 'After a data breach that exposed customer payment data, the platform needed a complete security overhaul to rebuild customer trust.',
    findings: [
      { text: 'API authentication bypass vulnerability', severity: 'CRITICAL' },
      { text: 'Insecure payment processing flow', severity: 'CRITICAL' },
      { text: 'Session hijacking via token leakage', severity: 'HIGH' },
      { text: 'Missing rate limiting on checkout', severity: 'MEDIUM' },
    ],
    metrics: [
      { label: 'Post-Engagement Breaches', value: '0' },
      { label: 'Transactions Secured', value: '2M+' },
      { label: 'PCI DSS', value: 'Achieved' },
    ],
    quote: 'After the breach, HexaShield was our lifeline. They not only fixed everything but helped us achieve PCI DSS compliance.',
    quoteName: 'Priya Kapoor', quoteTitle: 'CTO',
  },
  {
    id: 4, title: 'Hospital Network SOC', sector: 'Healthcare', service: 'SOC',
    summary: '24/7 monitoring for 500-bed hospital.',
    challenge: 'A ransomware attempt shut down critical systems for 6 hours. The hospital had no monitoring capability and no incident response procedures.',
    findings: [
      { text: '15 active malware infections detected', severity: 'CRITICAL' },
      { text: 'Unauthorized access attempts from abroad', severity: 'HIGH' },
      { text: 'HIPAA compliance gaps identified', severity: 'HIGH' },
      { text: 'Outdated antivirus on 60% of systems', severity: 'MEDIUM' },
    ],
    metrics: [
      { label: 'Monitoring', value: '24/7' },
      { label: 'Uptime', value: '99.9%' },
      { label: 'Response Time', value: '3 min' },
    ],
    quote: 'The peace of mind knowing someone is watching our systems 24/7 is invaluable for a hospital.',
    quoteName: 'Dr. Rajiv Patel', quoteTitle: 'Hospital Director',
  },
  {
    id: 5, title: 'Government Portal Audit', sector: 'Government', service: 'Audit',
    summary: 'Secured citizen services portal.',
    challenge: 'A public-facing portal handling sensitive citizen data needed a comprehensive security assessment before CERT-In certification.',
    findings: [
      { text: 'IDOR vulnerabilities in citizen data API', severity: 'CRITICAL' },
      { text: 'Weak authentication mechanism', severity: 'HIGH' },
      { text: 'Missing Content-Security-Policy headers', severity: 'MEDIUM' },
      { text: 'Session fixation vulnerability', severity: 'HIGH' },
    ],
    metrics: [
      { label: 'CERT-In', value: 'Compliant' },
      { label: 'Citizens Protected', value: '500K+' },
      { label: 'SSL Rating', value: 'A+' },
    ],
    quote: 'HexaShield\'s expertise in Indian compliance frameworks made them the ideal partner for our government portal.',
    quoteName: 'Anonymous', quoteTitle: 'IT Secretary',
  },
  {
    id: 6, title: 'EdTech Startup Training', sector: 'Education', service: 'Training',
    summary: 'Built security culture from scratch.',
    challenge: 'A fast-growing edtech startup with 200+ employees had no security awareness program. Phishing test showed 77% click rate.',
    findings: [
      { text: '77% employees clicked phishing links', severity: 'HIGH' },
      { text: 'Weak passwords on 90% of accounts', severity: 'HIGH' },
      { text: 'No data handling procedures', severity: 'MEDIUM' },
      { text: 'USB usage policy violations', severity: 'LOW' },
    ],
    metrics: [
      { label: 'Phishing Pass Rate', value: '95%' },
      { label: 'Employees Trained', value: '200+' },
      { label: 'Champions Certified', value: '3' },
    ],
    quote: 'The phishing simulations were a real wake-up call. Our team now thinks twice before clicking any link.',
    quoteName: 'Ananya Joshi', quoteTitle: 'Head of People',
  },
];

const SECTORS = ['All', 'Education', 'Banking', 'Healthcare', 'E-commerce', 'Government'];
const SERVICES_FILTER = ['All', 'VAPT', 'Audit', 'SOC', 'Training', 'AppSec'];

const severityDots: Record<string, string> = {
  CRITICAL: 'bg-brand-red',
  HIGH: 'bg-brand-amber',
  MEDIUM: 'bg-brand-amber/60',
  LOW: 'bg-brand-green',
};

const CaseStudies: React.FC = () => {
  const [sector, setSector] = useState('All');
  const [service, setService] = useState('All');
  const [selectedStudy, setSelectedStudy] = useState<typeof CASE_STUDIES[0] | null>(null);

  const filtered = CASE_STUDIES.filter((cs) => {
    if (sector !== 'All' && cs.sector !== sector) return false;
    if (service !== 'All' && cs.service !== service) return false;
    return true;
  });

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = selectedStudy ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [selectedStudy]);

  // Escape key closes modal
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedStudy(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="pt-20">
      <section className="section bg-grid-pattern border-b border-border">
        <div className="container-custom">
          <p className="mono-label text-[11px] text-accent mb-3">CASE STUDIES</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
            Real Results,{' '}
            <span className="text-gradient">Real Impact</span>
          </h1>
          <p className="text-lg text-text-2 max-w-2xl">See how we've helped organisations across India strengthen their security posture.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="mono-label text-[10px] self-center mr-2">SECTOR</span>
            {SECTORS.map((s) => (
              <button key={s} onClick={() => setSector(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${sector === s ? 'bg-accent text-white' : 'bg-surface text-text-2 hover:bg-surface-2'}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-8">
            <span className="mono-label text-[10px] self-center mr-2">SERVICE</span>
            {SERVICES_FILTER.map((s) => (
              <button key={s} onClick={() => setService(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono transition-all ${service === s ? 'bg-accent text-white' : 'bg-surface text-text-2 hover:bg-surface-2'}`}>
                {s}
              </button>
            ))}
          </div>

          <p className="text-sm text-text-3 mb-6 font-mono">{filtered.length} case {filtered.length === 1 ? 'study' : 'studies'} found</p>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((cs) => (
              <button key={cs.id} onClick={() => setSelectedStudy(cs)}
                className="card card-hover text-left group">
                <div className="flex items-center gap-2 mb-3">
                  <span className="pill bg-accent/10 text-accent">{cs.service}</span>
                  <span className="pill bg-surface-2 text-text-3">{cs.sector}</span>
                </div>
                <h3 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors">{cs.title}</h3>
                <p className="text-sm text-text-2 mb-4">{cs.summary}</p>
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border">
                  {cs.metrics.map((m, i) => (
                    <div key={i} className="text-center">
                      <p className="font-display text-lg font-bold text-accent">{m.value}</p>
                      <p className="text-[10px] font-mono text-text-3 uppercase">{m.label}</p>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-3 font-mono">No case studies match your filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* Modal */}
      {selectedStudy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={selectedStudy.title}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedStudy(null)} />
          <div className="relative bg-bg-2 border border-border rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-8 animate-fade-up">
            <button onClick={() => setSelectedStudy(null)} className="absolute top-4 right-4 p-2 text-text-3 hover:text-text transition-colors" aria-label="Close">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex items-center gap-2 mb-4">
              <span className="pill bg-accent/10 text-accent">{selectedStudy.service}</span>
              <span className="pill bg-surface-2 text-text-3">{selectedStudy.sector}</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-text mb-3">{selectedStudy.title}</h2>
            <p className="text-text-2 mb-6">{selectedStudy.summary}</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {selectedStudy.metrics.map((m, i) => (
                <div key={i} className="card text-center">
                  <p className="font-display text-2xl font-bold text-accent">{m.value}</p>
                  <p className="mono-label text-[10px]">{m.label}</p>
                </div>
              ))}
            </div>

            <h3 className="font-display text-lg font-bold text-text mb-2">The Challenge</h3>
            <p className="text-text-2 text-sm mb-6">{selectedStudy.challenge}</p>

            <h3 className="font-display text-lg font-bold text-text mb-3">Key Findings</h3>
            <ul className="space-y-2 mb-6">
              {selectedStudy.findings.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-text-2">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${severityDots[f.severity]}`} />
                  {f.text}
                </li>
              ))}
            </ul>

            <div className="bg-surface rounded-xl p-6 border border-border mb-6">
              <p className="text-text italic mb-3">"{selectedStudy.quote}"</p>
              <p className="text-sm text-accent font-mono">— {selectedStudy.quoteName}, {selectedStudy.quoteTitle}</p>
            </div>

            <a href="/contact" className="btn-primary">Discuss Your Project</a>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseStudies;
