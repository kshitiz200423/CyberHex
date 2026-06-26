// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Settings Routes
// ═══════════════════════════════════════════════════════════════

const { Router } = require('express');
const bcrypt = require('bcrypt');
const { authenticator } = require('otplib');
const { protect } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { z } = require('zod');

const router = Router();

// All settings routes require authentication
router.use(protect);

// ── Schemas ────────────────────────────────────────────────────

const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  phone: z.string().max(20).optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[a-z]/, 'Must contain a lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[^A-Za-z0-9]/, 'Must contain a special character'),
  confirmPassword: z.string().min(8),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const verify2faSchema = z.object({
  code: z.string().length(6).regex(/^\d+$/, 'Must be 6 digits'),
});

// ── PATCH /api/settings/profile ────────────────────────────────

router.patch('/profile', validate(updateProfileSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: req.body,
      select: {
        id: true, email: true, firstName: true, lastName: true,
        role: true, phone: true, totpEnabled: true, lastLogin: true,
        orgId: true,
      },
    });
    res.json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/settings/password ────────────────────────────────

router.post('/password', validate(changePasswordSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = await bcrypt.compare(req.body.currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Current password is incorrect',
      });
    }

    const hash = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: hash },
    });

    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/settings/2fa/enable ──────────────────────────────

router.post('/2fa/enable', async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const secret = authenticator.generateSecret();

    await prisma.user.update({
      where: { id: req.user.id },
      data: { totpSecret: secret },
    });

    const otpauth = authenticator.keyuri(req.user.email, 'Auronix Technologies', secret);

    res.json({
      status: 'success',
      data: { secret, qrCode: otpauth },
    });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/settings/2fa/verify ──────────────────────────────

router.post('/2fa/verify', validate(verify2faSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.totpSecret) {
      return res.status(400).json({
        status: 'error',
        message: '2FA setup not started. Enable 2FA first.',
      });
    }

    const isValid = authenticator.verify({ token: req.body.code, secret: user.totpSecret });
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code',
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { totpEnabled: true, twoFactorVerified: true },
    });

    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
});

// ── POST /api/settings/2fa/disable ─────────────────────────────

router.post('/2fa/disable', validate(verify2faSchema), async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    const isValid = authenticator.verify({ token: req.body.code, secret: user.totpSecret });
    if (!isValid) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid verification code',
      });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { totpSecret: null, totpEnabled: false, twoFactorVerified: false },
    });

    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
