import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { engagementsApi } from '../../lib/api';
import type { EngagementStatus, EngagementType } from '../../lib/types';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  VAPT: 'bg-accent/20 text-accent',
  AUDIT: 'bg-brand-green/20 text-brand-green',
  TRAINING: 'bg-brand-amber/20 text-brand-amber',
  APPSEC: 'bg-brand-purple/20 text-brand-purple',
  SOC: 'bg-brand-teal/20 text-brand-teal',
  CONSULTANCY: 'bg-brand-purple/20 text-brand-purple',
};

const statusColors: Record<string, string> = {
  SCHEDULED: 'bg-text-3/20 text-text-3',
  IN_PROGRESS: 'bg-accent/20 text-accent',
  IN_REVIEW: 'bg-brand-amber/20 text-brand-amber',
  COMPLETE: 'bg-brand-green/20 text-brand-green',
};

const Engagements: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<EngagementStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<EngagementType | 'All'>('All');

  const { data: engagementsData, isLoading, error } = useQuery({
    queryKey: ['engagements', statusFilter, typeFilter],
    queryFn: () => engagementsApi.list({
      ...(statusFilter !== 'All' ? { status: statusFilter } : {}),
      ...(typeFilter !== 'All' ? { type: typeFilter } : {}),
      limit: 100, // fetch up to 100 for now instead of pagination
    }),
  });

  const engagements = engagementsData?.data || [];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-text">Engagements</h1>
          <p className="text-sm text-text-3 font-mono">
            {isLoading ? 'Loading...' : `${engagements.length} engagements`}
          </p>
        </div>
        <button className="btn-primary text-xs">+ New Engagement</button>
      </div>

      <div className="flex flex-wrap gap-3">
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value as EngagementStatus | 'All')} 
          className="input max-w-[160px]"
        >
          <option value="All">All Status</option>
          <option value="SCHEDULED">Scheduled</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="COMPLETE">Complete</option>
        </select>
        <select 
          value={typeFilter} 
          onChange={(e) => setTypeFilter(e.target.value as EngagementType | 'All')} 
          className="input max-w-[160px]"
        >
          <option value="All">All Types</option>
          <option value="VAPT">VAPT</option>
          <option value="AUDIT">Audit</option>
          <option value="APPSEC">AppSec</option>
          <option value="SOC">SOC</option>
          <option value="TRAINING">Training</option>
          <option value="CONSULTANCY">Consultancy</option>
        </select>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface">
                <th className="table-header">Ref ID</th>
                <th className="table-header">Name</th>
                <th className="table-header">Type</th>
                <th className="table-header">Status</th>
                <th className="table-header">Progress</th>
                <th className="table-header">Analyst</th>
                <th className="table-header">Due Date</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-3 font-mono">Loading...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-brand-red font-mono">Error loading engagements.</td>
                </tr>
              ) : engagements.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-text-3 font-mono">No engagements match your filters.</td>
                </tr>
              ) : (
                engagements.map((e) => (
                  <tr key={e.id} className="table-row cursor-pointer hover:bg-surface/80">
                    <td className="table-cell font-mono text-accent text-xs">{e.refId}</td>
                    <td className="table-cell text-text font-medium">{e.name}</td>
                    <td className="table-cell">
                      <span className={`pill ${typeColors[e.type] || 'bg-surface-2'}`}>{e.type}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`pill ${statusColors[e.status] || 'bg-surface-2'}`}>
                        {e.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${e.progress === 100 ? 'bg-brand-green' : 'bg-accent'}`} 
                            style={{ width: `${e.progress}%` }} 
                          />
                        </div>
                        <span className="text-xs font-mono text-text-3 w-8">{e.progress}%</span>
                      </div>
                    </td>
                    <td className="table-cell text-text-2 text-xs">
                      {e.analyst ? `${e.analyst.firstName} ${e.analyst.lastName}` : 'Unassigned'}
                    </td>
                    <td className="table-cell text-text-3 text-xs">
                      {format(new Date(e.dueDate), 'dd MMM yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Engagements;
