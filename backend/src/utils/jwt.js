// ═══════════════════════════════════════════════════════════════
// HexaShield Security — JWT Utilities (RS256)
// ═══════════════════════════════════════════════════════════════

const jwt = require('jsonwebtoken');

const PRIVATE_KEY = (process.env.JWT_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const PUBLIC_KEY = (process.env.JWT_PUBLIC_KEY || '').replace(/\\n/g, '\n');
const ISSUER = process.env.JWT_ISSUER || 'hexashield.in';
const ACCESS_EXPIRY = process.env.JWT_EXPIRY || '15m';

/**
 * Sign a full access token (RS256)
 */
function signAccessToken(payload) {
  return jwt.sign(payload, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: ACCESS_EXPIRY,
    issuer: ISSUER,
    subject: payload.userId,
  });
}

/**
 * Verify an access token (RS256)
 */
function verifyAccessToken(token) {
  return jwt.verify(token, PUBLIC_KEY, {
    algorithms: ['RS256'],
    issuer: ISSUER,
  });
}

/**
 * Sign a partial token for 2FA flow (short-lived, 5 min)
 */
function signPartialToken(payload) {
  return jwt.sign({ ...payload, partial: true }, PRIVATE_KEY, {
    algorithm: 'RS256',
    expiresIn: '5m',
    issuer: ISSUER,
    subject: payload.userId,
  });
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  signPartialToken,
};
