import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../../lib/api';
import { format } from 'date-fns';

const typeColors: Record<string, string> = {
  TECHNICAL: 'bg-accent/20 text-accent',
  EXECUTIVE: 'bg-brand-purple/20 text-brand-purple',
  CERTIFICATE: 'bg-brand-green/20 text-brand-green',
  GAP_ANALYSIS: 'bg-brand-amber/20 text-brand-amber',
  RETEST: 'bg-brand-teal/20 text-brand-teal'
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const Reports: React.FC = () => {
  const [search, setSearch] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  const { data: reportsData, isLoading, error } = useQuery({
    queryKey: ['reports'],
    queryFn: () => reportsApi.list({ limit: 100 }),
  });

  const reports = reportsData?.data || [];

  const filtered = reports.filter((r) => 
    !search || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownload = async (id: string, name: string) => {
    try {
      setDownloading(id);
      const blob = await reportsApi.download(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed', err);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Reports</h1>
        <p className="text-sm text-text-3 font-mono">
          {isLoading ? 'Loading...' : `${reports.length} available`}
        </p>
      </div>

      <input 
        type="text" 
        placeholder="Search reports..." 
        value={search} 
        onChange={(e) => setSearch(e.target.value)} 
        className="input max-w-xs" 
      />

      {isLoading ? (
        <div className="text-center py-12 text-text-3 font-mono">Loading reports...</div>
      ) : error ? (
        <div className="text-center py-12 text-brand-red font-mono">Error loading reports.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-text-3 font-mono">No reports found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <div key={r.id} className="card card-hover relative">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-red font-mono text-xs font-bold">PDF</span>
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-medium text-text truncate">{r.name}</h3>
                  <p className="text-xs text-text-3 truncate">{r.engagement?.name || 'Unknown Engagement'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className={`pill ${typeColors[r.type] || 'bg-surface-2'}`}>
                  {r.type.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono text-text-3">{r.version}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-text-3 mb-4">
                <span>{formatBytes(r.sizeBytes)}</span>
                <span>{format(new Date(r.createdAt), 'dd MMM yyyy')}</span>
              </div>
              
              <button 
                onClick={() => handleDownload(r.id, r.name)} 
                disabled={downloading === r.id}
                className={`btn-primary w-full text-xs ${downloading === r.id ? 'opacity-70' : ''}`}
              >
                {downloading === r.id ? 'Downloading...' : 'Download Report'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
