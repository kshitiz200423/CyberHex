import React, { useState } from 'react';

const findings = [
  { refId: 'F-001-01', title: 'SQL Injection in Student Login', severity: 'CRITICAL', cvss: 9.8, engagement: 'Network VAPT', status: 'OPEN', updated: '10 Jun', desc: 'The student login form is vulnerable to SQL injection via the username parameter.', remediation: 'Use parameterized queries. Implement input validation.' },
  { refId: 'F-001-02', title: 'Cross-Site Scripting in Search', severity: 'HIGH', cvss: 7.5, engagement: 'Network VAPT', status: 'IN_PROGRESS', updated: '12 Jun', desc: 'Stored XSS in course search. User input rendered without sanitization.', remediation: 'Implement output encoding. Use CSP headers.' },
  { refId: 'F-001-03', title: 'Missing HSTS Header', severity: 'MEDIUM', cvss: 5.3, engagement: 'Network VAPT', status: 'FIXED', updated: '20 Jun', desc: 'No HTTP Strict-Transport-Security header configured.', remediation: 'Set HSTS with max-age 31536000 and includeSubDomains.' },
  { refId: 'F-001-04', title: 'Verbose Error Messages', severity: 'LOW', cvss: 3.1, engagement: 'Network VAPT', status: 'OPEN', updated: '10 Jun', desc: 'API errors expose stack traces and internal information.', remediation: 'Return generic error messages in production.' },
  { refId: 'F-001-05', title: 'Outdated TLS Configuration', severity: 'HIGH', cvss: 7.4, engagement: 'Network VAPT', status: 'OPEN', updated: '10 Jun', desc: 'Server supports deprecated TLS 1.0 and 1.1.', remediation: 'Disable TLS 1.0/1.1. Support only TLS 1.2+.' },
  { refId: 'F-004-01', title: 'IDOR in Student Profile API', severity: 'CRITICAL', cvss: 9.1, engagement: 'Web App Security', status: 'OPEN', updated: '25 Jun', desc: 'No authorization check on /api/students/:id endpoint.', remediation: 'Implement authorization middleware for resource access.' },
  { refId: 'F-004-02', title: 'Insecure File Upload', severity: 'HIGH', cvss: 8.2, engagement: 'Web App Security', status: 'IN_PROGRESS', updated: '26 Jun', desc: 'Assignment portal accepts executable files without validation.', remediation: 'Validate MIME type and extension server-side.' },
  { refId: 'F-004-03', title: 'Session Fixation', severity: 'HIGH', cvss: 7.1, engagement: 'Web App Security', status: 'OPEN', updated: '25 Jun', desc: 'Session ID not regenerated after authentication.', remediation: 'Regenerate session ID after successful login.' },
  { refId: 'F-004-04', title: 'Information Disclosure via Headers', severity: 'INFORMATIONAL', cvss: 2.0, engagement: 'Web App Security', status: 'OPEN', updated: '25 Jun', desc: 'Server version exposed in response headers.', remediation: 'Remove X-Powered-By and Server headers.' },
  { refId: 'F-004-05', title: 'Weak Password Policy', severity: 'MEDIUM', cvss: 5.5, engagement: 'Web App Security', status: 'OPEN', updated: '25 Jun', desc: 'No minimum password complexity requirements enforced.', remediation: 'Enforce min 8 chars, uppercase, lowercase, number, special char.' },
  { refId: 'F-004-06', title: 'Missing Rate Limiting', severity: 'MEDIUM', cvss: 4.8, engagement: 'Web App Security', status: 'FIXED', updated: '28 Jun', desc: 'Login endpoint has no rate limiting, enabling brute force.', remediation: 'Implement rate limiting: max 5 attempts per 15 minutes.' },
  { refId: 'F-004-07', title: 'Cookie Missing Secure Flag', severity: 'LOW', cvss: 3.5, engagement: 'Web App Security', status: 'OPEN', updated: '25 Jun', desc: 'Session cookie does not have Secure or HttpOnly flags.', remediation: 'Set Secure, HttpOnly, and SameSite=Strict on all cookies.' },
];

const sevColors: Record<string, string> = { CRITICAL: 'bg-brand-red/20 text-brand-red', HIGH: 'bg-brand-amber/20 text-brand-amber', MEDIUM: 'bg-brand-amber/10 text-brand-amber', LOW: 'bg-brand-green/20 text-brand-green', INFORMATIONAL: 'bg-accent/10 text-accent' };
const sevDots: Record<string, string> = { CRITICAL: 'bg-brand-red', HIGH: 'bg-brand-amber', MEDIUM: 'bg-brand-amber/60', LOW: 'bg-brand-green', INFORMATIONAL: 'bg-accent' };
const statColors: Record<string, string> = { OPEN: 'bg-brand-red/10 text-brand-red', IN_PROGRESS: 'bg-brand-amber/10 text-brand-amber', FIXED: 'bg-brand-green/10 text-brand-green', ACCEPTED: 'bg-brand-purple/10 text-brand-purple', FALSE_POSITIVE: 'bg-text-3/10 text-text-3' };

const Findings: React.FC = () => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = { CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length, HIGH: findings.filter(f => f.severity === 'HIGH').length, MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length, LOW: findings.filter(f => f.severity === 'LOW').length };

  const filtered = findings.filter((f) => {
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.refId.toLowerCase().includes(search.toLowerCase())) return false;
    if (severityFilter !== 'All' && f.severity !== severityFilter) return false;
    if (statusFilter !== 'All' && f.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Findings</h1>
        <div className="flex flex-wrap gap-3 mt-2">
          <span className="pill bg-brand-red/10 text-brand-red">Critical: {counts.CRITICAL}</span>
          <span className="pill bg-brand-amber/10 text-brand-amber">High: {counts.HIGH}</span>
          <span className="pill bg-brand-amber/5 text-brand-amber/80">Medium: {counts.MEDIUM}</span>
          <span className="pill bg-brand-green/10 text-brand-green">Low: {counts.LOW}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search findings..." value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-xs" />
        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input max-w-[160px]">
          <option value="All">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFORMATIONAL">Info</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-[160px]">
          <option value="All">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="FIXED">Fixed</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-surface">
              <th className="table-header">Ref</th><th className="table-header">Title</th><th className="table-header">Severity</th><th className="table-header">CVSS</th><th className="table-header">Engagement</th><th className="table-header">Status</th><th className="table-header">Updated</th>
            </tr></thead>
            <tbody>
              {filtered.map((f) => (
                <React.Fragment key={f.refId}>
                  <tr className="table-row cursor-pointer hover:bg-surface/80" onClick={() => setExpanded(expanded === f.refId ? null : f.refId)}>
                    <td className="table-cell font-mono text-accent text-xs">{f.refId}</td>
                    <td className="table-cell text-text font-medium text-sm">{f.title}</td>
                    <td className="table-cell"><span className={`pill ${sevColors[f.severity]}`}><span className={`w-1.5 h-1.5 rounded-full ${sevDots[f.severity]} inline-block mr-1`} />{f.severity}</span></td>
                    <td className="table-cell font-mono text-sm">{f.cvss.toFixed(1)}</td>
                    <td className="table-cell text-text-3 text-xs">{f.engagement}</td>
                    <td className="table-cell"><span className={`pill ${statColors[f.status]}`}>{f.status.replace(/_/g, ' ')}</span></td>
                    <td className="table-cell text-text-3 text-xs">{f.updated}</td>
                  </tr>
                  {expanded === f.refId && (
                    <tr><td colSpan={7} className="p-4 bg-bg-2 border-b border-border">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="mono-label text-[10px] mb-1">DESCRIPTION</p>
                          <p className="text-sm text-text-2">{f.desc}</p>
                        </div>
                        <div>
                          <p className="mono-label text-[10px] mb-1">REMEDIATION</p>
                          <p className="text-sm text-text-2">{f.remediation}</p>
                        </div>
                      </div>
                      {f.status === 'OPEN' && (
                        <div className="mt-4 flex gap-2">
                          <button className="btn-outline text-xs">Mark In Progress</button>
                          <button className="btn-primary text-xs">Mark Fixed</button>
                        </div>
                      )}
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Findings;
