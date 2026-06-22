// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Crypto Utilities
// ═══════════════════════════════════════════════════════════════

const crypto = require('crypto');

/**
 * Generate a cryptographically secure CSRF token
 */
function generateCsrfToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeCompare(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  if (a.length !== b.length) {
    return false;
  }
  const bufA = Buffer.from(a, 'utf8');
  const bufB = Buffer.from(b, 'utf8');
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Hash a token using SHA-256 (for storing refresh tokens, etc.)
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

module.exports = {
  generateCsrfToken,
  timingSafeCompare,
  hashToken,
};
