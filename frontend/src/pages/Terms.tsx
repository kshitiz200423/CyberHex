import React from 'react';

const Terms: React.FC = () => (
  <div className="pt-20">
    <section className="section bg-grid-pattern border-b border-border">
      <div className="container-custom max-w-4xl">
        <p className="mono-label text-[11px] text-accent mb-3">LEGAL</p>
        <h1 className="font-display text-4xl font-bold text-text mb-4">Terms of Service</h1>
        <p className="text-sm text-text-3 font-mono">Last updated: 1 June 2025</p>
      </div>
    </section>
    <section className="section">
      <div className="container-custom max-w-4xl">
        <div className="space-y-8 text-text-2 text-sm leading-relaxed">
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">1. Service Description</h2>
            <p>Auronix Technologies provides cybersecurity services including vulnerability assessment, penetration testing (VAPT), security audits, consultancy, managed SOC monitoring, security training, and cloud/application security assessments ("Services") to client organisations ("Client").</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">2. Client Authorisation for Security Testing</h2>
            <div className="card bg-brand-red/5 border-brand-red/20">
              <p className="text-text font-medium mb-2">⚠️ Critical Legal Clause</p>
              <p>By engaging Auronix for VAPT or any security testing service, the Client explicitly authorises Auronix to conduct security testing against the specified systems within the agreed scope. This authorisation is essential to ensure all testing activities are lawful under the Information Technology Act 2000 (Section 43, 65, 66). The Client warrants that they have the legal authority to authorise such testing and that no third-party systems outside the agreed scope will be tested.</p>
            </div>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">3. Portal Acceptable Use</h2>
            <p>The Auronix client portal is provided for the sole purpose of accessing engagement-related information, reports, and findings. Users must not attempt to access data belonging to other organisations, reverse-engineer the portal, or share portal credentials. Any security concerns should be reported to <a href="mailto:contact@auronixtechnologies.com" className="text-accent">contact@auronixtechnologies.com</a>.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">4. Confidentiality & NDA</h2>
            <p>All engagement-related information, including vulnerability findings, reports, and remediation guidance, is strictly confidential. A separate Non-Disclosure Agreement (NDA) will be executed before any engagement commences. Both parties agree to maintain confidentiality for a period of 5 years following the completion of the engagement.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">5. Payment Terms</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong className="text-text">Advance Payment:</strong> 50% of the total engagement fee is payable upon signing the Statement of Work (SOW).</li>
              <li><strong className="text-text">Balance Payment:</strong> Remaining 50% is payable upon delivery of the final report.</li>
              <li><strong className="text-text">Invoice Terms:</strong> All invoices are payable within 14 days of issue.</li>
              <li><strong className="text-text">Late Payment:</strong> Interest of 1.5% per month will be charged on overdue amounts.</li>
              <li><strong className="text-text">Taxes:</strong> All prices are exclusive of GST, which will be charged at the applicable rate.</li>
            </ul>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">6. Intellectual Property</h2>
            <p>All reports, methodologies, tools, and deliverables created by Auronix remain the intellectual property of Auronix Technologies. The Client receives a non-exclusive, non-transferable licence to use deliverables for internal security improvement purposes only. Reports may not be shared with third parties without written consent.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">7. Limitation of Liability</h2>
            <p>Auronix's total liability under any engagement shall not exceed the total fees paid by the Client for that engagement in the preceding 3 months. Auronix shall not be liable for indirect, incidental, consequential, or punitive damages. Security testing inherently carries risk; while we take all reasonable precautions, we cannot guarantee that testing will not cause disruption.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">8. Indemnification</h2>
            <p>The Client agrees to indemnify and hold harmless Auronix against any claims, damages, or expenses arising from the Client's failure to provide accurate scope information, unauthorised use of Auronix's deliverables, or testing conducted on systems the Client does not have authority to authorise.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">9. Governing Law & Dispute Resolution</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of India, specifically the Information Technology Act 2000, the Indian Contract Act 1872, and applicable rules. Any disputes shall be resolved through arbitration in accordance with the Arbitration and Conciliation Act 1996 (as amended). The seat of arbitration shall be New Delhi, India, and proceedings shall be conducted in English.</p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-text mb-3">10. Contact</h2>
            <p>For questions about these terms: <a href="mailto:contact@auronixtechnologies.com" className="text-accent">contact@auronixtechnologies.com</a></p>
            <p className="mt-1">Auronix Technologies, Gurugram, Haryana, India</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Terms;
