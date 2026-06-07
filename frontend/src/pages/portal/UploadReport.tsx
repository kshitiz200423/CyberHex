import React, { useState } from 'react';
import { FieldWrap, Input, Select } from '@/components/ui/FormField';
import FileDropZone from '@/components/ui/FileDropZone';

const engagements = [
  { value: 'eng-001', label: 'HS-2025-001 — Network VAPT' },
  { value: 'eng-002', label: 'HS-2025-002 — ISO 27001 Audit' },
  { value: 'eng-004', label: 'HS-2025-004 — Web App Security' },
];

const recentUploads = [
  { name: 'VAPT Technical Report v1.0', date: '10 Jun 2025', size: '2.3 MB' },
  { name: 'Training Certificate v1.0', date: '14 Apr 2025', size: '512 KB' },
  { name: 'Executive Summary v1.0', date: '25 Jun 2025', size: '1.8 MB' },
];

const UploadReport: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); setUploading(false); setSuccess(true); return 100; }
        return p + 10;
      });
    }, 200);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] animate-fade-up">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-brand-green/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-brand-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-text mb-2">Report Uploaded</h2>
          <p className="text-text-2 text-sm mb-6">The report has been securely stored and is now available in the client portal.</p>
          <button onClick={() => { setSuccess(false); setProgress(0); setFiles([]); }} className="btn-primary text-xs">Upload Another</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-text">Upload Report</h1>
        <p className="text-sm text-text-3 font-mono">Securely upload assessment reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          <div className="card space-y-5">
            <FieldWrap label="Engagement" htmlFor="engagement" required>
              <Select id="engagement" placeholder="Select engagement" options={engagements} />
            </FieldWrap>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FieldWrap label="Report Name" htmlFor="reportName" required>
                <Input id="reportName" placeholder="e.g., VAPT Technical Report" />
              </FieldWrap>
              <FieldWrap label="Report Type" htmlFor="reportType" required>
                <Select id="reportType" placeholder="Select type" options={[
                  { value: 'TECHNICAL', label: 'Technical Report' },
                  { value: 'EXECUTIVE', label: 'Executive Summary' },
                  { value: 'GAP_ANALYSIS', label: 'Gap Analysis' },
                  { value: 'CERTIFICATE', label: 'Certificate' },
                  { value: 'RETEST', label: 'Retest Report' },
                ]} />
              </FieldWrap>
            </div>
            <FieldWrap label="Version" htmlFor="version">
              <Input id="version" defaultValue="v1.0" />
            </FieldWrap>
            <FieldWrap label="Report File" htmlFor="file" required>
              <FileDropZone onFilesSelected={setFiles} files={files} accept=".pdf" maxFiles={1} maxSize={50 * 1024 * 1024} />
            </FieldWrap>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-border bg-surface text-accent focus:ring-accent" />
              <span className="text-sm text-text-2">Notify client when report is available</span>
            </label>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-text-2">Uploading...</span>
                  <span className="text-accent">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={files.length === 0 || uploading}>
              {uploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="card">
            <h3 className="font-display text-sm font-bold text-text mb-3">Upload Guidelines</h3>
            <ul className="space-y-2 text-xs text-text-2">
              <li className="flex gap-2"><span className="text-accent">•</span>PDF format only</li>
              <li className="flex gap-2"><span className="text-accent">•</span>Maximum file size: 50 MB</li>
              <li className="flex gap-2"><span className="text-accent">•</span>Files are encrypted at rest</li>
              <li className="flex gap-2"><span className="text-accent">•</span>Download access is logged</li>
              <li className="flex gap-2"><span className="text-accent">•</span>Reports are stored securely</li>
            </ul>
          </div>
          <div className="card">
            <h3 className="font-display text-sm font-bold text-text mb-3">Recent Uploads</h3>
            <div className="space-y-3">
              {recentUploads.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-xs text-text truncate">{r.name}</p>
                    <p className="text-[10px] text-text-3">{r.date}</p>
                  </div>
                  <span className="text-[10px] font-mono text-text-3">{r.size}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadReport;
