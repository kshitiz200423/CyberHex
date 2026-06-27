import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const CATEGORIES = ['All', 'Threat Intelligence', 'Compliance', 'Best Practices', 'Tutorials'];

const POSTS = [
  {
    slug: 'dpdp-act-2023-guide', title: 'Understanding the DPDP Act 2023: What Indian Businesses Need to Know',
    category: 'Compliance', readTime: '5 min', date: '2025-06-15', author: 'Priya Sharma',
    excerpt: 'The Digital Personal Data Protection Act 2023 is India\'s most significant data privacy legislation. Here\'s what every business needs to know about compliance requirements, data processing obligations, and the penalties for non-compliance.',
  },
  {
    slug: 'top-10-cybersecurity-threats-2025', title: 'Top 10 Cybersecurity Threats Facing Indian SMEs in 2025',
    category: 'Threat Intelligence', readTime: '8 min', date: '2025-06-10', author: 'Arjun Singh',
    excerpt: 'From ransomware-as-a-service to AI-powered phishing, the threat landscape is evolving rapidly. We analyse the top 10 threats specifically targeting small and medium enterprises in India and provide actionable defence strategies.',
  },
  {
    slug: 'iso-27001-audit-preparation', title: 'How to Prepare for an ISO 27001 Audit',
    category: 'Compliance', readTime: '6 min', date: '2025-06-05', author: 'Priya Sharma',
    excerpt: 'Preparing for an ISO 27001 certification audit can be overwhelming. This step-by-step guide covers everything from gap analysis to documentation requirements, helping you achieve certification on your first attempt.',
  },
  {
    slug: 'phishing-employee-training', title: 'Phishing Attacks: Why Your Employees Are Your Weakest Link',
    category: 'Best Practices', readTime: '4 min', date: '2025-05-28', author: 'Kshitiz Kumar',
    excerpt: '91% of cyberattacks begin with a phishing email. Learn why traditional security awareness training fails and what modern, simulation-based approaches can achieve for your organisation\'s human firewall.',
  },
  {
    slug: 'cloud-security-aws-azure', title: 'Cloud Security Best Practices for AWS and Azure',
    category: 'Tutorials', readTime: '10 min', date: '2025-05-20', author: 'Rohit Kumar',
    excerpt: 'Moving to the cloud doesn\'t mean moving your security responsibility. This comprehensive guide covers IAM policies, network segmentation, encryption, logging, and the top misconfigurations we find in client environments.',
  },
  {
    slug: 'rbi-cybersecurity-framework-guide', title: 'RBI Cybersecurity Framework: A Complete Guide for Banks',
    category: 'Compliance', readTime: '7 min', date: '2025-05-15', author: 'Priya Sharma',
    excerpt: 'The Reserve Bank of India\'s cybersecurity framework mandates specific controls for all regulated entities. This guide breaks down every requirement and provides a practical implementation roadmap.',
  },
];

const Blog: React.FC = () => {
  const [category, setCategory] = useState('All');
  const filtered = POSTS.filter((p) => category === 'All' || p.category === category);

  return (
    <div className="pt-20">
      <section className="section bg-grid-pattern border-b border-border">
        <div className="container-custom">
          <p className="mono-label text-[11px] text-accent mb-3">BLOG</p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-text mb-4">Security Insights</h1>
          <p className="text-lg text-text-2 max-w-2xl">Expert analysis, practical guides, and threat intelligence from our security team.</p>
        </div>
      </section>

      <section className="section">
        <div className="container-custom">
          <div className="flex flex-wrap gap-2 mb-8">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-4 py-2 rounded-full text-xs font-mono transition-all ${category === c ? 'bg-accent text-white' : 'bg-surface text-text-2 hover:bg-surface-2'}`}>
                {c}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="card card-hover group flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="pill bg-accent/10 text-accent">{post.category}</span>
                  <span className="text-xs text-text-3">{post.readTime} read</span>
                </div>
                <h3 className="font-display text-lg font-bold text-text mb-2 group-hover:text-accent transition-colors line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-text-2 mb-4 line-clamp-3 flex-1">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                  <span className="text-xs text-text-3">{new Date(post.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span className="text-xs text-text-3">By {post.author}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
