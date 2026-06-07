import React from 'react';
import { useParams, Link } from 'react-router-dom';

const BLOG_CONTENT: Record<string, { title: string; date: string; author: string; category: string; readTime: string; content: string[] }> = {
  'dpdp-act-2023-guide': {
    title: 'Understanding the DPDP Act 2023: What Indian Businesses Need to Know',
    date: '2025-06-15', author: 'Priya Sharma', category: 'Compliance', readTime: '5 min',
    content: [
      'The Digital Personal Data Protection Act 2023 (DPDP Act) represents a landmark shift in how Indian businesses must handle personal data. Enacted on 11 August 2023, this legislation establishes a comprehensive framework for data protection that applies to every organisation processing the personal data of individuals in India.',
      'Key obligations under the DPDP Act include obtaining explicit consent before processing personal data, implementing reasonable security safeguards, appointing a Data Protection Officer for significant data fiduciaries, and establishing mechanisms for data principals to exercise their rights. Non-compliance can attract penalties up to ₹250 crore.',
      'For SMEs, the practical implications are significant. You need to audit what personal data you collect, ensure you have lawful basis for processing it, implement data minimisation principles, and establish clear data retention policies. HexaShield can help you conduct a DPDP readiness assessment to identify gaps and build a compliance roadmap.',
    ],
  },
  'top-10-cybersecurity-threats-2025': {
    title: 'Top 10 Cybersecurity Threats Facing Indian SMEs in 2025',
    date: '2025-06-10', author: 'Arjun Singh', category: 'Threat Intelligence', readTime: '8 min',
    content: [
      'The cybersecurity threat landscape in India has evolved dramatically. SMEs are increasingly targeted because attackers know they often lack the security infrastructure of larger enterprises. In 2024-25, CERT-In reported a 300% increase in cybersecurity incidents targeting Indian SMEs.',
      'The top threats include: (1) Ransomware-as-a-Service making sophisticated attacks accessible to anyone, (2) Business Email Compromise targeting finance teams, (3) AI-powered phishing that bypasses traditional filters, (4) Supply chain attacks through vulnerable vendors, (5) Cloud misconfigurations exposing sensitive data, (6) Insider threats from disgruntled employees, (7) IoT vulnerabilities in smart office devices, (8) API security weaknesses in mobile applications, (9) Cryptojacking consuming computing resources, and (10) Social engineering targeting C-suite executives.',
      'The good news: most of these threats can be mitigated with proper security hygiene, employee training, and regular assessments. A comprehensive VAPT engagement and security awareness programme can address 80% of these risks at a fraction of the cost of a breach.',
    ],
  },
  'iso-27001-audit-preparation': {
    title: 'How to Prepare for an ISO 27001 Audit',
    date: '2025-06-05', author: 'Priya Sharma', category: 'Compliance', readTime: '6 min',
    content: [
      'ISO 27001 certification is increasingly becoming a prerequisite for doing business with large enterprises and government bodies in India. The standard provides a systematic approach to managing sensitive information through an Information Security Management System (ISMS).',
      'Preparation should begin 6-9 months before the certification audit. Key steps include: defining the ISMS scope, conducting a risk assessment, implementing required controls from Annex A, documenting policies and procedures, training staff, and conducting an internal audit. The most common failure points are inadequate documentation, lack of management commitment, and incomplete risk treatment.',
      'HexaShield offers a complete ISO 27001 readiness programme that includes gap analysis, policy template library, control implementation guidance, internal audit, and support through the certification process. Our clients have a 100% first-attempt pass rate.',
    ],
  },
  'phishing-employee-training': {
    title: 'Phishing Attacks: Why Your Employees Are Your Weakest Link',
    date: '2025-05-28', author: 'Kshitiz Agrawal', category: 'Best Practices', readTime: '4 min',
    content: [
      '91% of all cyberattacks begin with a phishing email. Despite advances in email security, human error remains the primary vector for security breaches. Traditional annual security awareness training simply doesn\'t work — research shows that training effects diminish within weeks without reinforcement.',
      'Modern phishing simulations provide continuous, measurable training that keeps employees vigilant. At HexaShield, our phishing campaigns mimic real-world attacks that are relevant to Indian organisations — UPI payment notifications, GST compliance emails, Aadhaar verification requests, and more.',
      'Our training programme typically achieves a reduction in phishing click rates from 60-70% to under 5% within three months. The key is frequency, relevance, and immediate feedback. When an employee clicks a simulated phishing link, they immediately see an educational page explaining what they missed and how to identify similar attacks in the future.',
    ],
  },
  'cloud-security-aws-azure': {
    title: 'Cloud Security Best Practices for AWS and Azure',
    date: '2025-05-20', author: 'Rohit Kumar', category: 'Tutorials', readTime: '10 min',
    content: [
      'Cloud adoption in India has accelerated dramatically, but security often lags behind. The shared responsibility model means that while AWS and Azure secure the infrastructure, you are responsible for securing everything you put in it — and misconfigurations are the number one cause of cloud data breaches.',
      'Essential cloud security practices include: implementing least-privilege IAM policies, enabling MFA on all privileged accounts, encrypting data at rest and in transit, configuring VPC network segmentation, enabling comprehensive logging (CloudTrail/Activity Log), using security groups and NACLs to restrict traffic, and conducting regular configuration audits against CIS benchmarks.',
      'We recommend monthly cloud security posture assessments and continuous monitoring through a CSPM tool. HexaShield\'s cloud security assessment covers all major cloud providers and provides a detailed hardening guide tailored to your specific environment and compliance requirements.',
    ],
  },
  'rbi-cybersecurity-framework-guide': {
    title: 'RBI Cybersecurity Framework: A Complete Guide for Banks',
    date: '2025-05-15', author: 'Priya Sharma', category: 'Compliance', readTime: '7 min',
    content: [
      'The Reserve Bank of India\'s cybersecurity framework, issued under circular DBS.CO/CSITE/BC.11/33.01.001/2015-16, mandates comprehensive cybersecurity measures for all regulated entities. This includes banks, NBFCs, and payment system operators.',
      'Key requirements include: establishing a Board-approved Cybersecurity Policy, appointing a Chief Information Security Officer (CISO), implementing a Cyber Security Operations Centre, conducting regular VAPT assessments, maintaining a Cyber Crisis Management Plan, and reporting incidents to CERT-In within 6 hours.',
      'Compliance is not optional — non-compliance can result in regulatory action including penalties, business restrictions, and reputational damage. HexaShield specialises in RBI compliance and has helped multiple banks achieve full compliance within our engagement timelines.',
    ],
  },
};

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? BLOG_CONTENT[slug] : null;

  if (!post) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-text mb-4">Post Not Found</h1>
          <Link to="/blog" className="btn-primary">Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-20">
      <section className="section">
        <div className="container-custom max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-2 text-text-3 hover:text-accent text-sm font-mono mb-8 transition-colors">
            ← Back to Blog
          </Link>

          <div className="flex items-center gap-3 mb-4">
            <span className="pill bg-accent/10 text-accent">{post.category}</span>
            <span className="text-xs text-text-3">{post.readTime} read</span>
          </div>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-text mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-text-3 mb-10 pb-6 border-b border-border">
            <span>By {post.author}</span>
            <span>·</span>
            <span>{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>

          <article className="prose prose-invert max-w-none">
            {post.content.map((para, i) => (
              <p key={i} className="text-text-2 leading-relaxed mb-6">{para}</p>
            ))}
          </article>

          {/* Share */}
          <div className="flex items-center gap-4 mt-10 pt-6 border-t border-border">
            <span className="mono-label text-[10px]">SHARE</span>
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-lg text-text-3 hover:text-accent transition-colors">
              𝕏
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="p-2 bg-surface rounded-lg text-text-3 hover:text-accent transition-colors">
              in
            </a>
          </div>

          {/* CTA */}
          <div className="mt-12 card bg-accent/5 border-accent/20 text-center">
            <h3 className="font-display text-xl font-bold text-text mb-2">Need Help With This Topic?</h3>
            <p className="text-sm text-text-2 mb-4">Our experts can help you implement these recommendations.</p>
            <Link to="/contact" className="btn-primary">Talk to an Expert</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPost;
