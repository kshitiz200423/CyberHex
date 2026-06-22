const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding Auronix database...\n');

  // ── Create Organisation ───────────────────────────────
  const auronix = await prisma.organisation.upsert({
    where: { id: 'org-auronix-001' },
    update: {},
    create: {
      id: 'org-auronix-001',
      name: 'Auronix Technologies',
      domain: 'auronix.in',
      industry: 'Cybersecurity',
      contactEmail: 'hello@auronix.in',
      contactPhone: '+91 XXXXX XXXXX',
      address: 'Bareilly, Uttar Pradesh, India',
    },
  });
  console.log('✓ Organisation created:', auronix.name);

  const clientOrg = await prisma.organisation.upsert({
    where: { id: 'org-client-demo-001' },
    update: {},
    create: {
      id: 'org-client-demo-001',
      name: 'Demo University',
      domain: 'demouniversity.edu.in',
      industry: 'Education',
      contactEmail: 'it@demouniversity.edu.in',
      contactPhone: '+91 98765 43210',
      address: 'New Delhi, India',
    },
  });
  console.log('✓ Client organisation created:', clientOrg.name);

  // ── Create Users ──────────────────────────────────────
  const adminPasswordHash = await bcrypt.hash('Auronix@2025', 12);
  const analystPasswordHash = await bcrypt.hash('Analyst@2025', 12);
  const clientPasswordHash = await bcrypt.hash('Client@2025', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@auronix.in' },
    update: {},
    create: {
      email: 'admin@auronix.in',
      passwordHash: adminPasswordHash,
      firstName: 'Kshitiz',
      lastName: 'Admin',
      role: 'ADMIN',
      phone: '+91 XXXXX XXXXX',
      totpEnabled: false,
      orgId: auronix.id,
    },
  });
  console.log('✓ Admin user created:', admin.email);

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@auronix.in' },
    update: {},
    create: {
      email: 'analyst@auronix.in',
      passwordHash: analystPasswordHash,
      firstName: 'Arjun',
      lastName: 'Singh',
      role: 'ANALYST',
      phone: '+91 98765 00001',
      orgId: auronix.id,
    },
  });
  console.log('✓ Analyst user created:', analyst.email);

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@demouniversity.edu.in' },
    update: {},
    create: {
      email: 'client@demouniversity.edu.in',
      passwordHash: clientPasswordHash,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      role: 'CLIENT',
      phone: '+91 98765 43210',
      orgId: clientOrg.id,
    },
  });
  console.log('✓ Client user created:', clientUser.email);

  // ── Create Engagements ────────────────────────────────
  const engagements = [
    {
      id: 'eng-001',
      refId: 'AX-2025-001',
      name: 'Demo University Network VAPT',
      type: 'VAPT',
      status: 'IN_PROGRESS',
      progress: 65,
      scope: 'Full network penetration testing covering 12 campus networks, 200+ endpoints, and 15 web applications.',
      startDate: new Date('2025-06-01'),
      dueDate: new Date('2025-07-15'),
      orgId: clientOrg.id,
      analystId: analyst.id,
    },
    {
      id: 'eng-002',
      refId: 'AX-2025-002',
      name: 'Demo University ISO 27001 Audit',
      type: 'AUDIT',
      status: 'SCHEDULED',
      progress: 0,
      scope: 'ISO 27001:2022 compliance audit covering information security management system.',
      startDate: new Date('2025-07-20'),
      dueDate: new Date('2025-09-01'),
      orgId: clientOrg.id,
      analystId: analyst.id,
    },
    {
      id: 'eng-003',
      refId: 'AX-2025-003',
      name: 'Demo University Security Training',
      type: 'TRAINING',
      status: 'COMPLETE',
      progress: 100,
      scope: 'Security awareness training for 200+ staff members including phishing simulations.',
      startDate: new Date('2025-04-01'),
      dueDate: new Date('2025-04-15'),
      completedAt: new Date('2025-04-14'),
      orgId: clientOrg.id,
      analystId: analyst.id,
    },
    {
      id: 'eng-004',
      refId: 'AX-2025-004',
      name: 'Demo University Web App Security',
      type: 'APPSEC',
      status: 'IN_REVIEW',
      progress: 90,
      scope: 'OWASP Top 10 assessment for student portal, admin dashboard, and mobile API.',
      startDate: new Date('2025-05-15'),
      dueDate: new Date('2025-06-30'),
      orgId: clientOrg.id,
      analystId: analyst.id,
    },
  ];

  for (const eng of engagements) {
    await prisma.engagement.upsert({
      where: { id: eng.id },
      update: {},
      create: eng,
    });
  }
  console.log(`✓ ${engagements.length} engagements created`);

  // ── Create Findings ───────────────────────────────────
  const findings = [
    {
      id: 'find-001',
      refId: 'F-001-01',
      title: 'SQL Injection in Student Login Endpoint',
      severity: 'CRITICAL',
      cvss: 9.8,
      description: 'The student login form at /api/auth/login is vulnerable to SQL injection via the username parameter. An attacker can bypass authentication and access any student account.',
      remediation: 'Use parameterized queries or prepared statements. Implement input validation on the username field. Consider using an ORM for all database operations.',
      references: ['https://owasp.org/www-community/attacks/SQL_Injection', 'https://cwe.mitre.org/data/definitions/89.html'],
      status: 'OPEN',
      engagementId: 'eng-001',
    },
    {
      id: 'find-002',
      refId: 'F-001-02',
      title: 'Cross-Site Scripting (XSS) in Search',
      severity: 'HIGH',
      cvss: 7.5,
      description: 'Stored XSS vulnerability in the course search functionality. User-supplied input is rendered without sanitization in search results.',
      remediation: 'Implement output encoding for all user-supplied data. Use Content-Security-Policy headers to prevent inline script execution.',
      references: ['https://owasp.org/www-community/attacks/xss/'],
      status: 'IN_PROGRESS',
      engagementId: 'eng-001',
    },
    {
      id: 'find-003',
      refId: 'F-001-03',
      title: 'Missing HSTS Header',
      severity: 'MEDIUM',
      cvss: 5.3,
      description: 'The application does not set the HTTP Strict-Transport-Security header, leaving users vulnerable to protocol downgrade attacks.',
      remediation: 'Configure HSTS header with max-age of at least 31536000 seconds and include the includeSubDomains directive.',
      references: ['https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Strict_Transport_Security_Cheat_Sheet.html'],
      status: 'FIXED',
      fixedAt: new Date('2025-06-20'),
      engagementId: 'eng-001',
    },
    {
      id: 'find-004',
      refId: 'F-001-04',
      title: 'Verbose Error Messages Exposing Stack Traces',
      severity: 'LOW',
      cvss: 3.1,
      description: 'API error responses include detailed stack traces and internal server information that could help an attacker map the application architecture.',
      remediation: 'Implement a global error handler that returns generic error messages in production. Log detailed errors server-side only.',
      references: ['https://owasp.org/www-community/Improper_Error_Handling'],
      status: 'OPEN',
      engagementId: 'eng-001',
    },
    {
      id: 'find-005',
      refId: 'F-001-05',
      title: 'Outdated TLS Configuration',
      severity: 'HIGH',
      cvss: 7.4,
      description: 'The server supports TLS 1.0 and 1.1 which are deprecated and known to have security vulnerabilities.',
      remediation: 'Disable TLS 1.0 and 1.1. Configure the server to support only TLS 1.2 and 1.3 with strong cipher suites.',
      references: ['https://www.rfc-editor.org/rfc/rfc8996'],
      status: 'OPEN',
      engagementId: 'eng-001',
    },
    {
      id: 'find-006',
      refId: 'F-004-01',
      title: 'IDOR in Student Profile API',
      severity: 'CRITICAL',
      cvss: 9.1,
      description: 'The /api/students/:id endpoint does not verify that the authenticated user has access to the requested student profile.',
      remediation: 'Implement authorization checks that verify the requesting user has permission to access the requested resource.',
      references: ['https://owasp.org/www-project-web-security-testing-guide/latest/4-Web_Application_Security_Testing/05-Authorization_Testing/04-Testing_for_Insecure_Direct_Object_References'],
      status: 'OPEN',
      engagementId: 'eng-004',
    },
    {
      id: 'find-007',
      refId: 'F-004-02',
      title: 'Insecure File Upload in Assignment Portal',
      severity: 'HIGH',
      cvss: 8.2,
      description: 'The assignment submission endpoint accepts arbitrary file types including executable files. No server-side validation of MIME type is performed.',
      remediation: 'Implement strict file type validation on the server. Check both file extension and MIME type. Store uploads outside the web root.',
      references: ['https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload'],
      status: 'IN_PROGRESS',
      engagementId: 'eng-004',
    },
  ];

  for (const finding of findings) {
    await prisma.finding.upsert({
      where: { id: finding.id },
      update: {},
      create: finding,
    });
  }
  console.log(`✓ ${findings.length} findings created`);

  // ── Create Reports ────────────────────────────────────
  const reports = [
    {
      id: 'rep-001',
      name: 'VAPT Technical Report - Phase 1',
      type: 'TECHNICAL',
      version: 'v1.0',
      storageKey: 'reports/org-client-demo-001/eng-001/VAPT-Technical-Report-v1.0.pdf',
      sizeBytes: 2457600,
      engagementId: 'eng-001',
      uploadedById: analyst.id,
    },
    {
      id: 'rep-002',
      name: 'Security Training Completion Certificate',
      type: 'CERTIFICATE',
      version: 'v1.0',
      storageKey: 'reports/org-client-demo-001/eng-003/Training-Certificate-v1.0.pdf',
      sizeBytes: 524288,
      engagementId: 'eng-003',
      uploadedById: analyst.id,
    },
    {
      id: 'rep-003',
      name: 'Web Application Security Assessment',
      type: 'EXECUTIVE',
      version: 'v1.0',
      storageKey: 'reports/org-client-demo-001/eng-004/AppSec-Executive-Report-v1.0.pdf',
      sizeBytes: 1843200,
      engagementId: 'eng-004',
      uploadedById: analyst.id,
    },
  ];

  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: {},
      create: report,
    });
  }
  console.log(`✓ ${reports.length} reports created`);

  console.log('\n✅ Seed complete!\n');
  console.log('Login credentials:');
  console.log('  Admin:   admin@auronix.in / Auronix@2025');
  console.log('  Analyst: analyst@auronix.in / Analyst@2025');
  console.log('  Client:  client@demouniversity.edu.in / Client@2025');
}

seed()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
