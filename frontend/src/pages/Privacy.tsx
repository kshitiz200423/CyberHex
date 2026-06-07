import React from 'react';

const Privacy: React.FC = () => (
  <div className="pt-20">
    <section className="section bg-grid-pattern border-b border-border">
      <div className="container-custom max-w-4xl">
        <p className="mono-label text-[11px] text-accent mb-3">LEGAL</p>
        <h1 className="font-display text-4xl font-bold text-text mb-4">Privacy Policy</h1>
        <p className="text-sm text-text-3 font-mono">Last updated: 1 June 2025</p>
      </div>
    </section>
    <section className="section">
      <div className="container-custom max-w-4xl prose prose-invert">
        <div className="space-y-8 text-text-2 text-sm leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">1. Data Controller</h2>
            <p>HexaShield Security ("we", "us", "our"), a cybersecurity services company registered in Bareilly, Uttar Pradesh, India, is the data controller for personal data collected through this website and client portal.</p>
            <p className="mt-2">Contact: <a href="mailto:privacy@hexashield.in" className="text-accent">privacy@hexashield.in</a></p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">2. Data We Collect</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-text">Personal Information:</strong> Name, email, phone number, organisation name provided through contact forms and portal registration.</li>
              <li><strong className="text-text">Portal Usage Data:</strong> Login timestamps, IP addresses, user agent strings, pages accessed, and actions performed within the client portal.</li>
              <li><strong className="text-text">Security Assessment Data:</strong> Vulnerability findings, network configurations, and system information discovered during authorised security assessments.</li>
              <li><strong className="text-text">Technical Data:</strong> Browser type, operating system, referring URLs collected automatically via server logs.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">3. Lawful Basis for Processing</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                <thead><tr className="bg-surface"><th className="table-header">Purpose</th><th className="table-header">Lawful Basis</th></tr></thead>
                <tbody>
                  <tr className="table-row"><td className="table-cell">Service delivery</td><td className="table-cell">Contract performance</td></tr>
                  <tr className="table-row"><td className="table-cell">Security assessments</td><td className="table-cell">Contract + explicit authorisation</td></tr>
                  <tr className="table-row"><td className="table-cell">Legal compliance</td><td className="table-cell">Legal obligation (IT Act, DPDP Act)</td></tr>
                  <tr className="table-row"><td className="table-cell">Service improvement</td><td className="table-cell">Legitimate interest</td></tr>
                  <tr className="table-row"><td className="table-cell">Marketing communications</td><td className="table-cell">Consent</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">4. Data Storage & Security</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>All data encrypted at rest using AES-256 encryption</li>
              <li>Data stored on secured servers within India</li>
              <li>Security reports accessible only via authenticated, time-limited secure links</li>
              <li>All portal access logged in an append-only audit trail</li>
              <li>Regular security assessments of our own infrastructure</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Contact form submissions: 2 years</li>
              <li>Client portal data: duration of engagement + 3 years</li>
              <li>Security assessment reports: as agreed in engagement contract</li>
              <li>Audit logs: 7 years (legal requirement)</li>
              <li>Marketing data: until consent is withdrawn</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">6. Your Rights</h2>
            <p>Under the IT Act 2000, SPDI Rules 2011, DPDP Act 2023, and GDPR (where applicable), you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Withdraw consent for processing</li>
              <li>Data portability</li>
              <li>Lodge a complaint with the Data Protection Board of India</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">7. Cookies</h2>
            <p>We use strictly necessary cookies (authentication, CSRF protection) and optional analytics cookies. You can manage cookie preferences through your browser settings.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">8. Contact</h2>
            <p>For data-related queries: <a href="mailto:privacy@hexashield.in" className="text-accent">privacy@hexashield.in</a></p>
            <p className="mt-1">HexaShield Security, Bareilly, Uttar Pradesh, India</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Privacy;
