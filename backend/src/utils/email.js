// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Email Utility
// ═══════════════════════════════════════════════════════════════
// Priority: Resend API → SMTP (Nodemailer) → Console (dev only)
// ═══════════════════════════════════════════════════════════════

const nodemailer = require('nodemailer');

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'HexaShield Security <noreply@hexashield.in>';
const IS_DEV = process.env.NODE_ENV === 'development';

/**
 * Send an email using available provider
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
async function sendEmail({ to, subject, html }) {
  // Try Resend first
  if (RESEND_API_KEY) {
    return sendViaResend({ to, subject, html });
  }

  // Try SMTP
  if (process.env.SMTP_HOST) {
    return sendViaSMTP({ to, subject, html });
  }

  // Development fallback
  if (IS_DEV) {
    process.stderr.write(`[HexaShield Email] To: ${to}\n`);
    process.stderr.write(`[HexaShield Email] Subject: ${subject}\n`);
    process.stderr.write(`[HexaShield Email] Body length: ${html.length} chars\n`);
    return { provider: 'console', messageId: `dev-${Date.now()}` };
  }

  throw new Error('No email provider configured. Set RESEND_API_KEY or SMTP_HOST.');
}

async function sendViaResend({ to, subject, html }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Resend API error: ${response.status} - ${error.message || 'Unknown'}`);
  }

  const data = await response.json();
  return { provider: 'resend', messageId: data.id };
}

async function sendViaSMTP({ to, subject, html }) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
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

  return { provider: 'smtp', messageId: info.messageId };
}

module.exports = { sendEmail };
