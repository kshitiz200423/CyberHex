import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';

const SERVICE_TABS = [
  { id: 'vapt', label: 'VAPT', color: 'accent' },
  { id: 'audit', label: 'Security Audits', color: 'brand-green' },
  { id: 'consultancy', label: 'Consultancy', color: 'brand-purple' },
  { id: 'soc', label: 'Managed SOC', color: 'brand-teal' },
  { id: 'training', label: 'Training', color: 'brand-amber' },
  { id: 'appsec', label: 'Cloud & App Security', color: 'accent-light' },
] as const;

const SERVICES_DATA: Record<string, {
  title: string; tagline: string; description: string;
  methodology: string[]; deliverables: string[]; includes: string[];
  timeline: string; pricing: string; findings?: Array<{ name: string; severity: string; cvss: number; status: string }>;
}> = {
  vapt: {
    title: 'Vulnerability Assessment & Penetration Testing',
    tagline: 'Find vulnerabilities before attackers do',
    description: 'Our VAPT service combines automated scanning with expert manual testing to uncover security weaknesses across your network, web applications, APIs, and mobile apps. Every engagement is scoped to your environment and conducted by OSCP-certified professionals.',
    methodology: ['Reconnaissance & Information Gathering', 'Vulnerability Scanning & Enumeration', 'Manual Exploitation & Testing', 'Post-Exploitation Analysis', 'Detailed Reporting & Remediation', 'Free Retest Within 30 Days'],
    deliverables: ['Technical Findings Report', 'Executive Summary', 'Remediation Roadmap (Prioritised)', 'Free Retest Verification'],
    includes: ['Network Penetration Testing', 'Web Application Testing', 'API Security Assessment', 'Mobile App Security (Android/iOS)', 'Social Engineering (Optional)', 'Wireless Security Assessment'],
    timeline: '2-4 weeks',
    pricing: 'Starting at ₹1,50,000',
    findings: [
      { name: 'SQL Injection in Login API', severity: 'CRITICAL', cvss: 9.8, status: 'OPEN' },
      { name: 'Stored XSS in Search', severity: 'HIGH', cvss: 7.5, status: 'IN_PROGRESS' },
      { name: 'Missing HSTS Header', severity: 'MEDIUM', cvss: 5.3, status: 'FIXED' },
      { name: 'Verbose Error Messages', severity: 'LOW', cvss: 3.1, status: 'OPEN' },
    ],
  },
  audit: {
    title: 'Security Audits & Compliance',
    tagline: 'Achieve and maintain compliance with confidence',
    description: 'We help organisations navigate complex compliance frameworks including ISO 27001, RBI guidelines, NIST CSF, and CERT-In standards. Our auditors identify gaps, assess risks, and provide a clear roadmap to compliance.',
    methodology: ['Document Review & Policy Assessment', 'Gap Analysis Against Framework', 'Control Testing & Evaluation', 'Risk Assessment & Scoring', 'Report & Recommendations'],
    deliverables: ['Compliance Assessment Report', 'Gap Analysis Matrix', 'Risk Register', 'Remediation Plan with Priorities', 'Certification Readiness Checklist'],
    includes: ['ISO 27001:2022', 'RBI Cybersecurity Framework', 'SEBI CSCRF', 'NIST CSF', 'CERT-In Guidelines', 'DPDP Act 2023 Readiness'],
    timeline: '3-6 weeks',
    pricing: 'Starting at ₹2,00,000',
  },
  consultancy: {
    title: 'Security Consultancy & Advisory',
    tagline: 'Expert guidance without the full-time cost',
    description: 'Our CISO-as-a-Service and advisory offerings give you access to senior security leadership on a flexible basis. We help define strategy, develop policies, assess risks, and build security programmes tailored to your organisation.',
    methodology: ['Current State Assessment', 'Risk Identification & Analysis', 'Strategy & Roadmap Development', 'Policy Framework Creation', 'Ongoing Advisory & Reviews'],
    deliverables: ['Security Strategy Document', 'Policy Framework (15+ Policies)', 'Risk Assessment Report', 'Implementation Roadmap', 'Monthly Advisory Reports'],
    includes: ['CISO-as-a-Service', 'Security Programme Development', 'Vendor Risk Management', 'Board-Level Reporting', 'Incident Response Planning', 'Security Architecture Review'],
    timeline: 'Ongoing retainer',
    pricing: 'Starting at ₹75,000/month',
  },
  soc: {
    title: 'Managed Security Operations Centre',
    tagline: '24/7 monitoring so you can sleep peacefully',
    description: 'Our SOC analysts monitor your infrastructure around the clock, detecting threats in real-time and responding to incidents before they escalate. Get enterprise-grade security monitoring at a fraction of building your own SOC.',
    methodology: ['Environment Onboarding', 'SIEM Configuration & Tuning', 'Continuous Monitoring (24/7)', 'Threat Detection & Analysis', 'Incident Response & Escalation', 'Monthly Reporting & Review'],
    deliverables: ['Real-time Monitoring Dashboard', 'Monthly Security Reports', 'Incident Reports & Analysis', 'Threat Intelligence Briefs', 'Quarterly Business Reviews'],
    includes: ['SIEM Deployment & Management', 'Endpoint Detection & Response', 'Network Traffic Analysis', 'Threat Hunting', 'Incident Response', 'Compliance Monitoring'],
    timeline: 'Annual contract',
    pricing: 'Starting at ₹1,25,000/month',
  },
  training: {
    title: 'Security Awareness Training',
    tagline: 'Your people are your first line of defence',
    description: 'Transform your employees from security liabilities into security assets. Our training programs include realistic phishing simulations, interactive workshops, and measurable outcomes that demonstrably reduce human-factor risks.',
    methodology: ['Baseline Assessment (Phishing Test)', 'Custom Training Programme Design', 'Interactive Workshop Delivery', 'Phishing Simulation Campaigns', 'Assessment & Certification'],
    deliverables: ['Training Materials & Resources', 'Phishing Campaign Reports', 'Staff Assessment Results', 'Completion Certificates', 'Improvement Metrics Dashboard'],
    includes: ['Phishing Simulations', 'Social Engineering Awareness', 'Password Hygiene', 'Data Handling Best Practices', 'Incident Reporting Procedures', 'Role-Based Training'],
    timeline: '1-2 weeks',
    pricing: 'Starting at ₹50,000',
  },
  appsec: {
    title: 'Cloud & Web Application Security',
    tagline: 'Secure your cloud and applications from the inside out',
    description: 'We assess the security of your cloud infrastructure (AWS, Azure, GCP) and web applications against OWASP standards, identify misconfigurations, and integrate security into your development lifecycle through DevSecOps practices.',
    methodology: ['Architecture Review', 'Cloud Configuration Audit', 'OWASP Top 10 Testing', 'API Security Assessment', 'DevSecOps Integration Planning', 'Remediation & Hardening'],
    deliverables: ['Security Assessment Report', 'Configuration Hardening Guide', 'API Security Report', 'DevSecOps Roadmap', 'Cloud Security Baseline'],
    includes: ['AWS / Azure / GCP', 'OWASP Top 10 Assessment', 'API Security (REST/GraphQL)', 'Container Security (Docker/K8s)', 'CI/CD Pipeline Security', 'Infrastructure as Code Review'],
    timeline: '2-3 weeks',
    pricing: 'Starting at ₹1,75,000',
    findings: [
      { name: 'S3 Bucket Public Access', severity: 'CRITICAL', cvss: 9.1, status: 'OPEN' },
      { name: 'IAM Overprivileged Roles', severity: 'HIGH', cvss: 8.0, status: 'OPEN' },
      { name: 'API Auth Bypass via JWT', severity: 'CRITICAL', cvss: 9.5, status: 'IN_PROGRESS' },
      { name: 'Missing WAF Rules', severity: 'MEDIUM', cvss: 5.8, status: 'FIXED' },
    ],
  },
};

const severityColors: Record<string, string> = {
  CRITICAL: 'bg-brand-red/20 text-brand-red',
  HIGH: 'bg-brand-amber/20 text-brand-amber',
  MEDIUM: 'bg-brand-amber/10 text-brand-amber',
  LOW: 'bg-brand-green/20 text-brand-green',
};
const statusColors: Record<string, string> = {
  OPEN: 'bg-brand-red/10 text-brand-red',
  IN_PROGRESS: 'bg-brand-amber/10 text-brand-amber',
  FIXED: 'bg-brand-green/10 text-brand-green',
};

const Services: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('vapt');

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash && SERVICES_DATA[hash]) setActiveTab(hash);
  }, [location.hash]);

  const handleTabChange = useCallback((id: string) => {
    setActiveTab(id);
    window.history.replaceState(null, '', `/services#${id}`);
  }, []);

  const service = SERVICES_DATA[activeTab];
  const tab = SERVICE_TABS.find((t) => t.id === activeTab);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="section bg-grid-pattern border-b border-border">
        <div className="container-custom">
          <p className="mono-label text-[11px] text-accent mb-3">OUR SERVICES</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">
            {service.title}
          </h1>
          <p className="text-lg text-text-2 max-w-2xl">{service.tagline}</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="sticky top-16 lg:top-20 z-20 bg-bg-2/90 backdrop-blur-xl border-b border-border">
        <div className="container-custom">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {SERVICE_TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === t.id
                    ? 'bg-accent/10 text-accent'
                    : 'text-text-3 hover:text-text hover:bg-surface/50'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-10">
              {/* Description */}
              <div>
                <p className="text-text-2 leading-relaxed text-base">{service.description}</p>
              </div>

              {/* Methodology */}
              <div>
                <h2 className="font-display text-2xl font-bold text-text mb-6">Methodology</h2>
                <div className="relative pl-8 space-y-6">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-border" />
                  {service.methodology.map((step, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-bg border-2 border-accent flex items-center justify-center">
                        <span className="text-[8px] font-mono text-accent">{i + 1}</span>
                      </div>
                      <p className="text-text-2 text-sm">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h2 className="font-display text-2xl font-bold text-text mb-4">Deliverables</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {service.deliverables.map((d, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-surface rounded-lg border border-border">
                      <svg className="w-5 h-5 text-brand-green flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-text">{d}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Findings (VAPT & AppSec only) */}
              {service.findings && (
                <div>
                  <h2 className="font-display text-2xl font-bold text-text mb-4">Sample Findings</h2>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-surface">
                          <th className="table-header">Finding</th>
                          <th className="table-header">Severity</th>
                          <th className="table-header">CVSS</th>
                          <th className="table-header">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {service.findings.map((f, i) => (
                          <tr key={i} className="table-row">
                            <td className="table-cell text-text">{f.name}</td>
                            <td className="table-cell">
                              <span className={`pill ${severityColors[f.severity]}`}>{f.severity}</span>
                            </td>
                            <td className="table-cell font-mono">{f.cvss.toFixed(1)}</td>
                            <td className="table-cell">
                              <span className={`pill ${statusColors[f.status]}`}>{f.status.replace('_', ' ')}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pricing Card */}
              <div className="card glow-blue sticky top-36">
                <p className="mono-label text-[11px] text-accent mb-2">PRICING</p>
                <p className="font-display text-2xl font-bold text-text mb-1">{service.pricing}</p>
                <p className="text-xs text-text-3 mb-6">Scope-dependent final pricing</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-text-2">{service.timeline}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
                    <span className="text-sm text-text-2">NDA Protected</span>
                  </div>
                </div>

                <Link to="/contact" className="btn-primary w-full text-center">
                  Request Assessment
                </Link>

                {/* Includes */}
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="mono-label text-[10px] mb-3">WHAT'S INCLUDED</p>
                  <ul className="space-y-2">
                    {service.includes.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-text-2">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cross-sell */}
      <section className="py-16 border-t border-border bg-bg-2">
        <div className="container-custom">
          <h3 className="font-display text-xl font-bold text-text mb-6 text-center">Explore Other Services</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {SERVICE_TABS.filter((t) => t.id !== activeTab).map((t) => (
              <button
                key={t.id}
                onClick={() => handleTabChange(t.id)}
                className="btn-outline text-xs"
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
