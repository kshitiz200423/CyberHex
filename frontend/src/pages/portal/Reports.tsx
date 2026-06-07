import React, { useState } from 'react';

const reports = [
  { id: 1, name: 'VAPT Technical Report - Phase 1', type: 'TECHNICAL', version: 'v1.0', engagement: 'Network VAPT', size: '2.3 MB', date: '10 Jun 2025', locked: false },
  { id: 2, name: 'Security Training Certificate', type: 'CERTIFICATE', version: 'v1.0', engagement: 'Security Training', size: '512 KB', date: '14 Apr 2025', locked: false },
  { id: 3, name: 'Web App Executive Summary', type: 'EXECUTIVE', version: 'v1.0', engagement: 'Web App Security', size: '1.8 MB', date: '25 Jun 2025', locked: false },
  { id: 4, name: 'ISO 27001 Gap Analysis', type: 'GAP_ANALYSIS', version: 'v1.0', engagement: 'ISO 27001 Audit', size: '3.1 MB', date: '(Pending)', locked: true },
  { id: 5, name: 'VAPT Retest Report', type: 'RETEST', version: 'v1.0', engagement: 'Network VAPT', size: '1.5 MB', date: '(Pending)', locked: true },
  { id: 6, name: 'VAPT Executive Summary', type: 'EXECUTIVE', version: 'v1.0', engagement: 'Network VAPT', size: '980 KB', date: '12 Jun 2025', locked: false },
];

const typeColors: Record<string, string> = { TECHNICAL: 'bg-accent/20 text-accent', EXECUTIVE: 'bg-brand-purple/20 text-brand-purple', CERTIFICATE: 'bg-brand-green/20 text-brand-green', GAP_ANALYSIS: 'bg-brand-amber/20 text-brand-amber', RETEST: 'bg-brand-teal/20 text-brand-teal' };

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<number | null>(null);

  const filtered = reports.filter((r) => !search || r.name.toLowerCase().includes(search.toLowerCase()));

  const handleDownload = (id: number) => {
    setDownloading(id);
    setTimeout(() => setDownloading(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Reports</h1>
        <p className="text-sm text-text-3 font-mono">{reports.filter(r => !r.locked).length} available, {reports.filter(r => r.locked).length} pending</p>
      </div>

      <input type="text" placeholder="Search reports..." value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-xs" />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((r) => (
          <div key={r.id} className={`card card-hover relative ${r.locked ? 'opacity-60' : ''}`}>
            {r.locked && (
              <div className="absolute top-3 right-3">
                <svg className="w-5 h-5 text-text-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
            )}
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                <span className="text-brand-red font-mono text-xs font-bold">PDF</span>
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-medium text-text truncate">{r.name}</h3>
                <p className="text-xs text-text-3">{r.engagement}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className={`pill ${typeColors[r.type]}`}>{r.type.replace('_', ' ')}</span>
              <span className="text-xs font-mono text-text-3">{r.version}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-text-3 mb-4">
              <span>{r.size}</span>
              <span>{r.date}</span>
            </div>
            {r.locked ? (
              <p className="text-xs text-text-3 font-mono">Report pending upload</p>
            ) : (
              <button onClick={() => handleDownload(r.id)} disabled={downloading === r.id}
                className={`btn-primary w-full text-xs ${downloading === r.id ? 'opacity-70' : ''}`}>
                {downloading === r.id ? 'Generating secure link...' : 'Download Report'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reports;
