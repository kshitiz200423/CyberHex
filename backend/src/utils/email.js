// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Email Utility (Resend API)
// ═══════════════════════════════════════════════════════════════

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Auronix Technologies <onboarding@resend.dev>';

/**
 * Send an email using Resend API (HTTP port 443 — bypasses Railway SMTP blocks)
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body
 */
async function sendEmail({ to, subject, html }) {
  if (!RESEND_API_KEY) {
    console.warn('[Email] RESEND_API_KEY not configured. Email NOT sent to:', to);
    return { provider: 'none', messageId: `not-sent-${Date.now()}` };
  }

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
  console.log('[Email] Sent via Resend to:', to, 'MessageId:', data.id);
  return { provider: 'resend', messageId: data.id };
}

module.exports = { sendEmail };
