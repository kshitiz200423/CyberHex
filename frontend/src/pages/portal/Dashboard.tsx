import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardApi, engagementsApi } from '../../lib/api';
import { format, formatDistanceToNow } from 'date-fns';

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

const Dashboard: React.FC = () => {
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: dashboardApi.getStats,
  });

  const { data: engagementsData, isLoading: isLoadingEngagements } = useQuery({
    queryKey: ['engagements', { limit: 5 }],
    queryFn: () => engagementsApi.list({ limit: 5 }),
  });

  if (isLoadingStats || isLoadingEngagements) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-surface-2 rounded w-48 mb-2" />
        <div className="h-4 bg-surface-2 rounded w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-2 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (statsError || !stats) {
    return (
      <div className="text-center py-20 text-brand-red font-mono">
        Error loading dashboard data. Please try again.
      </div>
    );
  }

  const engagements = engagementsData?.data || [];
  
  const statCards = [
    { label: 'Active Engagements', value: stats.activeEngagements.toString(), trend: `${stats.totalEngagements} total`, icon: '📋', color: 'accent' },
    { label: 'Open Findings', value: stats.openFindings.toString(), trend: `${stats.criticalFindings} critical`, icon: '🔴', color: 'brand-red' },
    { label: 'Fix Rate', value: `${stats.fixRate}%`, trend: 'overall', icon: '✅', color: 'brand-green' },
    { label: 'Reports Available', value: stats.reportsCount.toString(), trend: 'total', icon: '📄', color: 'brand-purple' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-sm text-text-3 font-mono">Security overview for your organisation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-text">Recent Engagements</h2>
          </div>
          <div className="overflow-x-auto">
            {engagements.length === 0 ? (
              <p className="text-text-3 text-sm font-mono text-center py-8">No recent engagements found.</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-surface rounded-lg">
                    <th className="table-header">Ref ID</th>
                    <th className="table-header">Name</th>
                    <th className="table-header">Type</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Progress</th>
                    <th className="table-header">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {engagements.map((e) => (
                    <tr key={e.id} className="table-row hover:bg-surface/80">
                      <td className="table-cell font-mono text-accent text-xs">{e.refId}</td>
                      <td className="table-cell text-text">{e.name}</td>
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
                          <div className="w-16 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                e.progress === 100 ? 'bg-brand-green' : 'bg-accent'
                              }`}
                              style={{ width: `${e.progress}%` }}
                            />
                          </div>
                          <span className="text-xs font-mono text-text-3">{e.progress}%</span>
                        </div>
                      </td>
                      <td className="table-cell text-xs text-text-3">
                        {format(new Date(e.dueDate), 'dd MMM yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Activity */}
        <div className="card">
          <h2 className="font-display text-lg font-bold text-text mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-text-3 text-sm font-mono text-center py-4">No recent activity.</p>
            ) : (
              stats.recentActivity.map((a) => (
                <div key={a.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                  <span className="text-lg mt-0.5">
                    {a.action.includes('FINDING') ? '🔴' : a.action.includes('REPORT') ? '📄' : '📋'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-text truncate">
                      <span className="font-semibold">{a.user}</span> {a.action.replace(/_/g, ' ').toLowerCase()}
                    </p>
                    <p className="text-xs text-text-3 font-mono">
                      {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
