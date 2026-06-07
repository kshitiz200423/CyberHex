// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Client Routes (Organisation Management)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const { protect, restrictTo } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { auditLog } = require('../middleware/errorHandler');
const { createClientSchema } = require('../schemas/client.schemas');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

/**
 * Generate a secure temporary password
 */
function generateTempPassword() {
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const digits = '0123456789';
  const special = '!@#$%&*';

  let password = '';
  password += upper[crypto.randomInt(upper.length)];
  password += lower[crypto.randomInt(lower.length)];
  password += digits[crypto.randomInt(digits.length)];
  password += special[crypto.randomInt(special.length)];

  const allChars = upper + lower + digits + special;
  for (let i = 0; i < 12; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }

  // Shuffle
  const arr = password.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join('');
}

// ── GET / — List Organisations ───────────────────────────────

router.get(
  '/',
  protect,
  restrictTo('ADMIN', 'ANALYST'),
  async (req, res, next) => {
    try {
      const { page = '1', limit = '10', search } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
      const skip = (pageNum - 1) * limitNum;

      const where = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { domain: { contains: search, mode: 'insensitive' } },
          { industry: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [organisations, total] = await Promise.all([
        prisma.organisation.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                users: true,
                engagements: true,
              },
            },
          },
        }),
        prisma.organisation.count({ where }),
      ]);

      return res.status(200).json({
        status: 'ok',
        data: {
          organisations,
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── POST / — Create Organisation + Client User ──────────────

router.post(
  '/',
  protect,
  restrictTo('ADMIN'),
  validate(createClientSchema),
  auditLog('CREATE_CLIENT'),
  async (req, res, next) => {
    try {
      const {
        orgName,
        domain,
        industry,
        contactEmail,
        contactPhone,
        address,
        userFirstName,
        userLastName,
        userEmail,
      } = req.body;

      // Check if user email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: userEmail },
        select: { id: true },
      });

      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'A user with this email already exists.',
        });
      }

      // Generate temporary password
      const tempPassword = generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, BCRYPT_ROUNDS);

      // Create organisation and user in a transaction
      const result = await prisma.$transaction(async (tx) => {
        const organisation = await tx.organisation.create({
          data: {
            name: orgName,
            domain,
            industry,
            contactEmail,
            contactPhone,
            address,
          },
        });

        const user = await tx.user.create({
          data: {
            email: userEmail,
            passwordHash,
            firstName: userFirstName,
            lastName: userLastName,
            role: 'CLIENT',
            orgId: organisation.id,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        });

        return { organisation, user };
      });

      // Send welcome email with temporary password
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      sendEmail({
        to: userEmail,
        subject: 'Welcome to HexaShield Security Portal',
        html: `
          <h2>Welcome to HexaShield Security</h2>
          <p>Dear ${userFirstName} ${userLastName},</p>
          <p>Your client account has been created for <strong>${orgName}</strong>.</p>
          <p>Here are your login credentials:</p>
          <ul>
            <li><strong>Email:</strong> ${userEmail}</li>
            <li><strong>Temporary Password:</strong> ${tempPassword}</li>
          </ul>
          <p>Please log in at <a href="${frontendUrl}">${frontendUrl}</a> and change your password immediately.</p>
          <p><em>This is an automated message. Please do not reply.</em></p>
          <hr>
          <p>HexaShield Security — Securing Your Digital Assets</p>
        `,
      }).catch(() => {
        // Email failures should not block account creation
      });

      return res.status(201).json({
        status: 'ok',
        data: {
          organisation: result.organisation,
          user: result.user,
          message: 'Organisation and client user created. Welcome email sent.',
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
