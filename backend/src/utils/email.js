// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Email Utility (Nodemailer SMTP only)
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');

const ADMIN_EMAIL = 'contact@auronixtechnologies.com';
const EMAIL_FROM = process.env.EMAIL_FROM || `Auronix Technologies <${ADMIN_EMAIL}>`;

/**
 * Send an email via SMTP (Gmail / Google Workspace compatible)
 */
async function sendEmail({ to, subject, html }) {
  // SMTP must be configured
  if (!process.env.SMTP_HOST && !process.env.SMTP_USER) {
    console.warn('[Email] SMTP not configured. Email NOT sent to:', to);
    console.warn('[Email] Subject:', subject);
    return { provider: 'none', messageId: `not-sent-${Date.now()}` };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: parseInt(process.env.SMTP_PORT, 10) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  console.log('[Email] Sent to:', to, 'MessageId:', info.messageId);
  return { provider: 'smtp', messageId: info.messageId };
}

module.exports = { sendEmail };
