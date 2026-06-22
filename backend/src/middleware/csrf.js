// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — CSRF Protection (Double Submit Cookie)
// ═══════════════════════════════════════════════════════════════

const { generateCsrfToken, timingSafeCompare } = require('../utils/crypto');

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// Routes exempt from CSRF protection
const EXEMPT_ROUTES = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/contact',
];

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

/**
 * CSRF Double Submit Cookie middleware
 * - Safe methods (GET, HEAD, OPTIONS) are always allowed
 * - Exempt routes skip CSRF validation
 * - All other requests must match cookie + header tokens
 */
function csrfProtection(req, res, next) {
  // Always allow safe methods
  if (SAFE_METHODS.includes(req.method)) {
    // Set CSRF cookie if not already present
    if (!req.cookies || !req.cookies.csrf_token) {
      const token = generateCsrfToken();
      res.cookie('csrf_token', token, {
        httpOnly: false, // Must be readable by JavaScript
        secure: IS_PRODUCTION,
        sameSite: 'Strict',
        path: '/',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      });
    }
    return next();
  }

  // Check if route is exempt
  const isExempt = EXEMPT_ROUTES.some((route) => req.path === route || req.path.startsWith(route + '/'));
  if (isExempt) {
    return next();
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token missing. Please refresh the page.',
    });
  }

  if (!timingSafeCompare(cookieToken, headerToken)) {
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token mismatch. Please refresh the page.',
    });
  }

  next();
}

module.exports = { csrfProtection };
