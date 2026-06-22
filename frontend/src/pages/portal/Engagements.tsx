import React, { useState } from 'react';

const data = [
  { refId: 'AX-2025-001', name: 'Network VAPT', type: 'VAPT', status: 'IN_PROGRESS', progress: 65, analyst: 'Arjun Singh', due: '15 Jul 2025', org: 'Demo University' },
  { refId: 'AX-2025-002', name: 'ISO 27001 Audit', type: 'AUDIT', status: 'SCHEDULED', progress: 0, analyst: 'Priya Sharma', due: '01 Sep 2025', org: 'Demo University' },
  { refId: 'AX-2025-003', name: 'Security Training', type: 'TRAINING', status: 'COMPLETE', progress: 100, analyst: 'Arjun Singh', due: '14 Apr 2025', org: 'Demo University' },
  { refId: 'AX-2025-004', name: 'Web App Security', type: 'APPSEC', status: 'IN_REVIEW', progress: 90, analyst: 'Rohit Kumar', due: '30 Jun 2025', org: 'Demo University' },
  { refId: 'AX-2025-005', name: 'Cloud Security', type: 'APPSEC', status: 'SCHEDULED', progress: 0, analyst: 'Rohit Kumar', due: '15 Aug 2025', org: 'ABC Bank' },
  { refId: 'AX-2025-006', name: 'RBI Compliance Audit', type: 'AUDIT', status: 'IN_PROGRESS', progress: 40, analyst: 'Priya Sharma', due: '20 Jul 2025', org: 'ABC Bank' },
  { refId: 'AX-2025-007', name: 'SOC Monitoring Setup', type: 'SOC', status: 'IN_PROGRESS', progress: 75, analyst: 'Rohit Kumar', due: '10 Jul 2025', org: 'MedCare Hospital' },
  { refId: 'AX-2025-008', name: 'Staff Awareness Training', type: 'TRAINING', status: 'COMPLETE', progress: 100, analyst: 'Arjun Singh', due: '01 May 2025', org: 'EduTech Startup' },
];

const typeColors: Record<string, string> = { VAPT: 'bg-accent/20 text-accent', AUDIT: 'bg-brand-green/20 text-brand-green', TRAINING: 'bg-brand-amber/20 text-brand-amber', APPSEC: 'bg-brand-purple/20 text-brand-purple', SOC: 'bg-brand-teal/20 text-brand-teal' };
const statusColors: Record<string, string> = { SCHEDULED: 'bg-text-3/20 text-text-3', IN_PROGRESS: 'bg-accent/20 text-accent', IN_REVIEW: 'bg-brand-amber/20 text-brand-amber', COMPLETE: 'bg-brand-green/20 text-brand-green' };

const Engagements: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = data.filter((e) => {
    if (search && !e.name.toLowerCase().includes(search.toLowerCase()) && !e.refId.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'All' && e.status !== statusFilter) return false;
    if (typeFilter !== 'All' && e.type !== typeFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Engagements</h1>
          <p className="text-sm text-text-3 font-mono">{filtered.length} engagements</p>
        </div>
        <button className="btn-primary text-xs">+ New Engagement</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input type="text" placeholder="Search engagements..." value={search} onChange={(e) => setSearch(e.target.value)} className="input max-w-xs" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input max-w-[160px]">
          <option value="All">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETE">Complete</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input max-w-[160px]">
          <option value="All">All Types</option>
          <option value="VAPT">VAPT</option>
          <option value="AUDIT">Audit</option>
          <option value="APPSEC">AppSec</option>
          <option value="SOC">SOC</option>
          <option value="TRAINING">Training</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="bg-surface">
              <th className="table-header">Ref ID</th><th className="table-header">Name</th><th className="table-header">Type</th><th className="table-header">Status</th><th className="table-header">Progress</th><th className="table-header">Analyst</th><th className="table-header">Due Date</th>
            </tr></thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i} className="table-row cursor-pointer hover:bg-surface/80">
                  <td className="table-cell font-mono text-accent text-xs">{e.refId}</td>
                  <td className="table-cell text-text font-medium">{e.name}</td>
                  <td className="table-cell"><span className={`pill ${typeColors[e.type]}`}>{e.type}</span></td>
                  <td className="table-cell"><span className={`pill ${statusColors[e.status]}`}>{e.status.replace(/_/g, ' ')}</span></td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${e.progress === 100 ? 'bg-brand-green' : 'bg-accent'}`} style={{ width: `${e.progress}%` }} />
                      </div>
                      <span className="text-xs font-mono text-text-3 w-8">{e.progress}%</span>
                    </div>
                  </td>
                  <td className="table-cell text-text-2 text-xs">{e.analyst}</td>
                  <td className="table-cell text-text-3 text-xs">{e.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-text-3 font-mono text-sm">No engagements match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Engagements;
