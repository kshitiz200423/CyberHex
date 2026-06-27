import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { findingsApi } from '../../lib/api';
import type { FindingSeverity, FindingStatus } from '../../lib/types';
import { format } from 'date-fns';

const sevColors: Record<string, string> = {
  CRITICAL: 'bg-brand-red/20 text-brand-red',
  HIGH: 'bg-brand-amber/20 text-brand-amber',
  MEDIUM: 'bg-brand-amber/10 text-brand-amber',
  LOW: 'bg-brand-green/20 text-brand-green',
  INFORMATIONAL: 'bg-accent/10 text-accent'
};
const sevDots: Record<string, string> = {
  CRITICAL: 'bg-brand-red',
  HIGH: 'bg-brand-amber',
  MEDIUM: 'bg-brand-amber/60',
  LOW: 'bg-brand-green',
  INFORMATIONAL: 'bg-accent'
};
const statColors: Record<string, string> = {
  OPEN: 'bg-brand-red/10 text-brand-red',
  IN_PROGRESS: 'bg-brand-amber/10 text-brand-amber',
  FIXED: 'bg-brand-green/10 text-brand-green',
  ACCEPTED: 'bg-brand-purple/10 text-brand-purple',
  FALSE_POSITIVE: 'bg-text-3/10 text-text-3'
};

const Findings: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<FindingSeverity | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<FindingStatus | 'All'>('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: findingsData, isLoading, error } = useQuery({
    queryKey: ['findings', severityFilter, statusFilter],
    queryFn: () => findingsApi.list({
      ...(severityFilter !== 'All' ? { severity: severityFilter } : {}),
      ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
      limit: 100, // fetch up to 100 for now
    }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: FindingStatus }) => 
      findingsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['findings'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
  });

  const findings = findingsData?.data || [];

  // Filter client-side by search
  const filtered = findings.filter((f) => {
    if (search && !f.title.toLowerCase().includes(search.toLowerCase()) && !f.refId.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    CRITICAL: findings.filter(f => f.severity === 'CRITICAL').length,
    HIGH: findings.filter(f => f.severity === 'HIGH').length,
    MEDIUM: findings.filter(f => f.severity === 'MEDIUM').length,
    LOW: findings.filter(f => f.severity === 'LOW').length,
  };

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
        <input 
          type="text" 
          placeholder="Search findings..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          className="input max-w-xs" 
        />
        <select 
          value={severityFilter} 
          onChange={(e) => setSeverityFilter(e.target.value as FindingSeverity | 'All')} 
          className="input max-w-[160px]"
        >
          <option value="All">All Severity</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFORMATIONAL">Info</option>
        </select>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as FindingStatus | 'All')} 
          className="input max-w-[160px]"
        >
          <option value="All">All Status</option>
          <option value="OPEN">Open</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="FIXED">Fixed</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="FALSE_POSITIVE">False Positive</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="table-header">Ref</th>
                <th className="table-header">Title</th>
                <th className="table-header">Severity</th>
                <th className="table-header">CVSS</th>
                <th className="table-header">Engagement</th>
                <th className="table-header">Status</th>
                <th className="table-header">Updated</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-3 font-mono">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-red font-mono">Error loading findings.</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-3 font-mono">No findings match your filters.</td>
                </tr>
              ) : (
                filtered.map((f) => (
                  <React.Fragment key={f.id}>
                    <tr 
                      className="table-row cursor-pointer hover:bg-surface/80" 
                      onClick={() => setExpanded(expanded === f.id ? null : f.id)}
                    >
                      <td className="table-cell font-mono text-accent text-xs">{f.refId}</td>
                      <td className="table-cell text-text font-medium text-sm">{f.title}</td>
                      <td className="table-cell">
                        <span className={`pill ${sevColors[f.severity] || 'bg-surface-2'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sevDots[f.severity] || 'bg-surface-2'} inline-block mr-1`} />
                          {f.severity}
                        </span>
                      </td>
                      <td className="table-cell font-mono text-sm">{f.cvss?.toFixed(1) || '-'}</td>
                      <td className="table-cell text-text-3 text-xs">{f.engagement?.name || '-'}</td>
                      <td className="table-cell">
                        <span className={`pill ${statColors[f.status] || 'bg-surface-2'}`}>
                          {f.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="table-cell text-text-3 text-xs">
                        {f.fixedAt ? format(new Date(f.fixedAt), 'dd MMM') : format(new Date(f.updatedAt || new Date()), 'dd MMM')}
                      </td>
                    </tr>
                    {expanded === f.id && (
                      <tr>
                        <td colSpan={7} className="p-4 bg-bg-2 border-b border-border">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="mono-label text-[10px] mb-1">DESCRIPTION</p>
                              <p className="text-sm text-text-2">{f.description}</p>
                            </div>
                            <div>
                              <p className="mono-label text-[10px] mb-1">REMEDIATION</p>
                              <p className="text-sm text-text-2">{f.remediation}</p>
                            </div>
                          </div>
                          {(f.status === 'OPEN' || f.status === 'IN_PROGRESS') && (
                            <div className="mt-4 flex gap-2">
                              {f.status === 'OPEN' && (
                                <button 
                                  className="btn-outline text-xs disabled:opacity-50"
                                  onClick={() => updateStatusMutation.mutate({ id: f.id, status: 'IN_PROGRESS' })}
                                  disabled={updateStatusMutation.isPending}
                                >
                                  Mark In Progress
                                </button>
                              )}
                              <button 
                                className="btn-primary text-xs disabled:opacity-50"
                                onClick={() => updateStatusMutation.mutate({ id: f.id, status: 'FIXED' })}
                                disabled={updateStatusMutation.isPending}
                              >
                                Mark Fixed
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Findings;
