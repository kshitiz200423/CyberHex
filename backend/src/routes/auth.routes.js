// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Auth Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { authenticator } = require('otplib');
const { PrismaClient } = require('@prisma/client');

const { signAccessToken, signPartialToken, verifyAccessToken } = require('../utils/jwt');
const { generateCsrfToken } = require('../utils/crypto');
const { authLimiter } = require('../middleware/security');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { loginSchema, verify2faSchema } = require('../schemas/auth.schemas');
const { AppError } = require('../middleware/errorHandler');

const router = express.Router();
const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// ── POST /login ──────────────────────────────────────────────

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        orgId: true,
        totpEnabled: true,
        totpSecret: true,
        twoFactorVerified: true,
        loginAttempts: true,
        lockedUntil: true,
      },
    });

    if (!user) {
      // Constant-time: hash a dummy password to prevent timing attacks
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Check account lockout
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const remainingMs = new Date(user.lockedUntil).getTime() - Date.now();
      const remainingMin = Math.ceil(remainingMs / 60000);
      return res.status(423).json({
        status: 'error',
        message: `Account locked. Please try again in ${remainingMin} minute(s).`,
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      const attempts = user.loginAttempts + 1;
      const updateData = { loginAttempts: attempts };

      // Lock account after max attempts
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        updateData.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      });

      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Reset login attempts on successful authentication
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    // Check if 2FA is required (admin with TOTP enabled)
    if (user.totpEnabled && user.totpSecret) {
      const partialToken = signPartialToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        status: 'ok',
        data: {
          requires2fa: true,
          partialToken,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
        },
      });
    }

    // Generate tokens (no 2FA required)
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      twoFactorVerified: false,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
      },
    });

    // Set refresh token as HttpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_EXPIRY_MS,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN',
        userId: user.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        statusCode: 200,
      },
    });

    return res.status(200).json({
      status: 'ok',
      data: {
        requires2fa: false,
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /verify-2fa ─────────────────────────────────────────

router.post('/verify-2fa', authLimiter, validate(verify2faSchema), async (req, res, next) => {
  try {
    const { code, partialToken } = req.body;

    // Verify the partial token
    let decoded;
    try {
      decoded = verifyAccessToken(partialToken);
    } catch {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired verification session.',
      });
    }

    if (!decoded.partial) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid token type.',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        orgId: true,
        firstName: true,
        lastName: true,
        totpSecret: true,
        totpEnabled: true,
      },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return res.status(401).json({
        status: 'error',
        message: 'Two-factor authentication not configured.',
      });
    }

    // Verify TOTP code
    const isValid = authenticator.verify({
      token: code,
      secret: user.totpSecret,
    });

    if (!isValid) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid verification code.',
      });
    }

    // Mark 2FA as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorVerified: true },
    });

    // Issue full access token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      twoFactorVerified: true,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: refreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
      },
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_EXPIRY_MS,
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGIN_2FA_VERIFIED',
        userId: user.id,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        statusCode: 200,
      },
    });

    return res.status(200).json({
      status: 'ok',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /refresh ────────────────────────────────────────────

router.post('/refresh', async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token;

    if (!refreshToken) {
      return res.status(401).json({
        status: 'error',
        message: 'No refresh token provided.',
      });
    }

    // Find all valid (unused, unexpired) refresh tokens
    const storedTokens = await prisma.refreshToken.findMany({
      where: {
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            orgId: true,
            firstName: true,
            lastName: true,
            twoFactorVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Find matching token by comparing with bcrypt
    let matchedToken = null;
    for (const stored of storedTokens) {
      const isMatch = await bcrypt.compare(refreshToken, stored.token);
      if (isMatch) {
        matchedToken = stored;
        break;
      }
    }

    if (!matchedToken) {
      // Possible token reuse attack — invalidate all tokens for the user
      // by clearing the refresh cookie
      res.clearCookie('refresh_token', {
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'Strict',
        path: '/api/auth/refresh',
      });

      return res.status(401).json({
        status: 'error',
        message: 'Invalid refresh token. Please log in again.',
      });
    }

    // Mark old token as used (single-use rotation)
    await prisma.refreshToken.update({
      where: { id: matchedToken.id },
      data: { usedAt: new Date() },
    });

    const user = matchedToken.user;

    // Issue new tokens
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      orgId: user.orgId,
      twoFactorVerified: user.twoFactorVerified,
    };

    const accessToken = signAccessToken(tokenPayload);
    const newRefreshToken = crypto.randomBytes(40).toString('hex');
    const newRefreshHash = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);

    await prisma.refreshToken.create({
      data: {
        token: newRefreshHash,
        userId: user.id,
        expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
      },
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'Strict',
      path: '/api/auth/refresh',
      maxAge: REFRESH_EXPIRY_MS,
    });

    return res.status(200).json({
      status: 'ok',
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          orgId: user.orgId,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /logout ─────────────────────────────────────────────

router.post('/logout', protect, async (req, res, next) => {
  try {
    // Mark all user's refresh tokens as used
    await prisma.refreshToken.updateMany({
      where: {
        userId: req.user.userId,
        usedAt: null,
      },
      data: { usedAt: new Date() },
    });

    // Clear refresh cookie
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'Strict',
      path: '/api/auth/refresh',
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        action: 'LOGOUT',
        userId: req.user.userId,
        ip: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        statusCode: 200,
      },
    });

    return res.status(200).json({
      status: 'ok',
      data: { message: 'Logged out successfully.' },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /csrf-token ──────────────────────────────────────────

router.get('/csrf-token', (req, res) => {
  const token = generateCsrfToken();

  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: 'Strict',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    status: 'ok',
    data: { csrfToken: token },
  });
});

// ── GET /health ──────────────────────────────────────────────

router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    data: {
      service: 'auth',
      timestamp: new Date().toISOString(),
    },
  });
});

module.exports = router;
