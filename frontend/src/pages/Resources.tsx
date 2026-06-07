import React, { useState } from 'react';

const RESOURCES = [
  { id: 1, title: 'SME Cybersecurity Checklist 2025', desc: 'A comprehensive checklist covering essential security controls every SME should implement. Covers network security, access control, data protection, and incident response.', format: 'PDF', icon: '📋' },
  { id: 2, title: 'VAPT Methodology Whitepaper', desc: 'Detailed whitepaper explaining our VAPT methodology, tools, and approach. Understand what a professional penetration test involves and what to expect.', format: 'PDF', icon: '📄' },
  { id: 3, title: 'ISO 27001 Readiness Assessment Template', desc: 'Self-assessment template covering all ISO 27001 Annex A controls. Identify gaps in your security posture before engaging an auditor.', format: 'XLSX', icon: '📊' },
  { id: 4, title: 'Incident Response Plan Template', desc: 'Ready-to-use incident response plan template aligned with CERT-In guidelines. Customise it for your organisation and be prepared for security incidents.', format: 'DOCX', icon: '📝' },
];

const Resources: React.FC = () => {
  const [emailModal, setEmailModal] = useState<number | null>(null);
  const [email, setEmail] = useState('');
  const [downloaded, setDownloaded] = useState<number[]>([]);

  const handleDownload = (id: number) => {
    if (email.includes('@')) {
      setDownloaded((prev) => [...prev, id]);
      setEmailModal(null);
      setEmail('');
    }
  };

  return (
    <div className="pt-20">
      <section className="section bg-grid-pattern border-b border-border">
        <div className="container-custom">
          <p className="mono-label text-[11px] text-accent mb-3">RESOURCES</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">Free Security Resources</h1>
          <p className="text-lg text-text-2 max-w-2xl">Download free templates, checklists, and whitepapers to strengthen your security posture.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {RESOURCES.map((r) => (
              <div key={r.id} className="card card-hover flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-3xl">{r.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display text-lg font-bold text-text">{r.title}</h3>
                      <span className="pill bg-surface-2 text-text-3">{r.format}</span>
                    </div>
                    <p className="text-sm text-text-2">{r.desc}</p>
                  </div>
                </div>
                <div className="mt-auto pt-4 border-t border-border">
                  {downloaded.includes(r.id) ? (
                    <div className="flex items-center gap-2 text-brand-green text-sm">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Download link sent to your email!
                    </div>
                  ) : (
                    <button onClick={() => setEmailModal(r.id)} className="btn-primary text-xs">
                      Download Free
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Email Modal */}
      {emailModal !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setEmailModal(null)} />
          <div className="relative bg-bg-2 border border-border rounded-2xl p-8 max-w-md w-full animate-fade-up">
            <h3 className="font-display text-xl font-bold text-text mb-2">Enter your email</h3>
            <p className="text-sm text-text-2 mb-6">We'll send the download link to your inbox.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" className="input mb-4" autoFocus />
            <div className="flex gap-3">
              <button onClick={() => setEmailModal(null)} className="btn-outline flex-1">Cancel</button>
              <button onClick={() => handleDownload(emailModal)} className="btn-primary flex-1" disabled={!email.includes('@')}>Get Download</button>
            </div>
            <p className="text-[10px] text-text-3 mt-4">We respect your privacy. No spam, ever.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
