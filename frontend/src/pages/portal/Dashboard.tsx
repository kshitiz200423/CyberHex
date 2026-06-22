import React from 'react';

const stats = [
  { label: 'Active Engagements', value: '4', trend: '+2 this month', icon: '📋', color: 'accent' },
  { label: 'Open Critical Findings', value: '7', trend: '3 unresolved', icon: '🔴', color: 'brand-red' },
  { label: 'Vulnerabilities Fixed', value: '89%', trend: '+12% this quarter', icon: '✅', color: 'brand-green' },
  { label: 'Reports Available', value: '12', trend: '3 new this month', icon: '📄', color: 'brand-purple' },
];

const engagements = [
  { refId: 'AX-2025-001', name: 'Network VAPT', type: 'VAPT', status: 'IN_PROGRESS', progress: 65, due: '15 Jul 2025' },
  { refId: 'AX-2025-002', name: 'ISO 27001 Audit', type: 'AUDIT', status: 'SCHEDULED', progress: 0, due: '01 Sep 2025' },
  { refId: 'AX-2025-003', name: 'Security Training', type: 'TRAINING', status: 'COMPLETE', progress: 100, due: '14 Apr 2025' },
  { refId: 'AX-2025-004', name: 'Web App Security', type: 'APPSEC', status: 'IN_REVIEW', progress: 90, due: '30 Jun 2025' },
  { refId: 'AX-2025-005', name: 'Cloud Security Audit', type: 'APPSEC', status: 'SCHEDULED', progress: 0, due: '15 Aug 2025' },
];

const severities = [
  { label: 'Critical', count: 3, color: 'bg-brand-red', max: 20 },
  { label: 'High', count: 12, color: 'bg-brand-amber', max: 20 },
  { label: 'Medium', count: 8, color: 'bg-brand-amber/60', max: 20 },
  { label: 'Low', count: 15, color: 'bg-brand-green', max: 20 },
  { label: 'Info', count: 5, color: 'bg-accent', max: 20 },
];

const activity = [
  { text: 'Report uploaded: VAPT Technical Report v1.0', time: '2 hours ago', icon: '📄' },
  { text: 'Finding status changed: SQL Injection → IN_PROGRESS', time: '4 hours ago', icon: '🔄' },
  { text: 'New engagement created: Cloud Security Audit', time: '1 day ago', icon: '📋' },
  { text: 'Finding fixed: Missing HSTS Header', time: '2 days ago', icon: '✅' },
  { text: 'Report downloaded: Executive Summary', time: '2 days ago', icon: '⬇️' },
  { text: 'Security Training completed', time: '3 days ago', icon: '🎓' },
  { text: 'New finding: IDOR in Student Profile API', time: '4 days ago', icon: '🔴' },
  { text: 'Engagement progress updated: VAPT → 65%', time: '5 days ago', icon: '📊' },
];

const typeColors: Record<string, string> = { VAPT: 'bg-accent/20 text-accent', AUDIT: 'bg-brand-green/20 text-brand-green', TRAINING: 'bg-brand-amber/20 text-brand-amber', APPSEC: 'bg-brand-purple/20 text-brand-purple', SOC: 'bg-brand-teal/20 text-brand-teal', CONSULTANCY: 'bg-brand-purple/20 text-brand-purple' };
const statusColors: Record<string, string> = { SCHEDULED: 'bg-text-3/20 text-text-3', IN_PROGRESS: 'bg-accent/20 text-accent', IN_REVIEW: 'bg-brand-amber/20 text-brand-amber', COMPLETE: 'bg-brand-green/20 text-brand-green' };

const Dashboard: React.FC = () => (
  <div className="space-y-6 animate-fade-in">
    <div>
      <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
      <p className="text-sm text-text-3 font-mono">Security overview for your organisation</p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <div key={i} className="card card-hover group">
          <div className="flex items-start justify-between mb-3">
            <span className="text-2xl">{s.icon}</span>
            <span className="text-[10px] font-mono text-text-3">{s.trend}</span>
          </div>
          <p className={`font-display text-3xl font-bold text-${s.color}`}>{s.value}</p>
          <p className="mono-label text-[10px] mt-1">{s.label}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Engagements table */}
      <div className="lg:col-span-2 card">
        <h2 className="font-display text-lg font-bold text-text mb-4">Recent Engagements</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-surface rounded-lg">
              <th className="table-header">Ref ID</th><th className="table-header">Name</th><th className="table-header">Type</th><th className="table-header">Status</th><th className="table-header">Progress</th><th className="table-header">Due</th>
            </tr></thead>
            <tbody>
              {engagements.map((e, i) => (
                <tr key={i} className="table-row cursor-pointer hover:bg-surface/80">
                  <td className="table-cell font-mono text-accent text-xs">{e.refId}</td>
                  <td className="table-cell text-text">{e.name}</td>
                  <td className="table-cell"><span className={`pill ${typeColors[e.type]}`}>{e.type}</span></td>
                  <td className="table-cell"><span className={`pill ${statusColors[e.status]}`}>{e.status.replace('_', ' ')}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${e.progress === 100 ? 'bg-brand-green' : 'bg-accent'}`} style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-text-3">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-xs text-text-3">{e.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Severity chart */}
      <div className="card">
        <h2 className="font-display text-lg font-bold text-text mb-4">Finding Severity</h2>
        <div className="space-y-4">
          {severities.map((s, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-text-2">{s.label}</span>
                <span className="text-xs font-mono text-text-3">{s.count}</span>
              </div>
              <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${s.color} transition-all duration-1000`} style={{ width: `${(s.count / s.max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border text-center">
          <p className="font-display text-2xl font-bold text-text">43</p>
          <p className="mono-label text-[10px]">TOTAL FINDINGS</p>
        </div>
      </div>
    </div>

    {/* Activity */}
    <div className="card">
      <h2 className="font-display text-lg font-bold text-text mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activity.map((a, i) => (
          <div key={i} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
            <span className="text-lg mt-0.5">{a.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text truncate">{a.text}</p>
              <p className="text-xs text-text-3 font-mono">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Dashboard;
