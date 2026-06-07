// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Engagement Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const crypto = require('crypto');
const { PrismaClient } = require('@prisma/client');

const { protect, restrictTo, require2FA, verifyOrgAccess } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { auditLog } = require('../middleware/errorHandler');
const { createEngagementSchema, updateEngagementSchema } = require('../schemas/engagement.schemas');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate a unique engagement reference ID
 * Format: HS-{YEAR}-{3-digit sequential}
 */
async function generateRefId() {
  const year = new Date().getFullYear();
  const prefix = `HS-${year}-`;

  const lastEngagement = await prisma.engagement.findFirst({
    where: { refId: { startsWith: prefix } },
    orderBy: { refId: 'desc' },
    select: { refId: true },
  });

  let nextNum = 1;
  if (lastEngagement) {
    const lastNum = parseInt(lastEngagement.refId.split('-')[2], 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

// ── GET / — List Engagements ─────────────────────────────────

router.get('/', protect, async (req, res, next) => {
  try {
    const { page = '1', limit = '10', status, type, search } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // CLIENT: restrict to own org
    if (req.user.role === 'CLIENT') {
      if (!req.user.orgId) {
        return res.status(200).json({
          status: 'ok',
          data: { engagements: [], total: 0, page: pageNum, limit: limitNum },
        });
      }
      where.orgId = req.user.orgId;
    }

    // Filters
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { refId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [engagements, total] = await Promise.all([
      prisma.engagement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          organisation: { select: { id: true, name: true } },
          analyst: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: { select: { findings: true, reports: true } },
        },
      }),
      prisma.engagement.count({ where }),
    ]);

    return res.status(200).json({
      status: 'ok',
      data: {
        engagements,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /:id — Get Single Engagement ─────────────────────────

router.get('/:id', protect, verifyOrgAccess('engagement'), async (req, res, next) => {
  try {
    const engagement = await prisma.engagement.findUnique({
      where: { id: req.params.id },
      include: {
        organisation: { select: { id: true, name: true, domain: true } },
        analyst: { select: { id: true, firstName: true, lastName: true, email: true } },
        findings: {
          orderBy: { severity: 'asc' },
          select: {
            id: true,
            refId: true,
            title: true,
            severity: true,
            cvss: true,
            status: true,
            createdAt: true,
          },
        },
        reports: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            type: true,
            version: true,
            sizeBytes: true,
            visibility: true,
            createdAt: true,
          },
        },
      },
    });

    if (!engagement) {
      return res.status(404).json({
        status: 'error',
        message: 'Engagement not found.',
      });
    }

    return res.status(200).json({
      status: 'ok',
      data: { engagement },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST / — Create Engagement ───────────────────────────────

router.post(
  '/',
  protect,
  restrictTo('ADMIN', 'ANALYST'),
  validate(createEngagementSchema),
  auditLog('CREATE_ENGAGEMENT'),
  async (req, res, next) => {
    try {
      const { name, type, scope, startDate, dueDate, orgId, analystId } = req.body;

      // Verify organisation exists
      const org = await prisma.organisation.findUnique({
        where: { id: orgId },
        select: { id: true },
      });

      if (!org) {
        return res.status(404).json({
          status: 'error',
          message: 'Organisation not found.',
        });
      }

      // Verify analyst exists if provided
      if (analystId) {
        const analyst = await prisma.user.findUnique({
          where: { id: analystId },
          select: { id: true, role: true },
        });

        if (!analyst || (analyst.role !== 'ANALYST' && analyst.role !== 'ADMIN')) {
          return res.status(400).json({
            status: 'error',
            message: 'Invalid analyst. User must have ANALYST or ADMIN role.',
          });
        }
      }

      const refId = await generateRefId();

      const engagement = await prisma.engagement.create({
        data: {
          refId,
          name,
          type,
          scope,
          startDate: new Date(startDate),
          dueDate: new Date(dueDate),
          orgId,
          analystId: analystId || null,
        },
        include: {
          organisation: { select: { id: true, name: true } },
          analyst: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      return res.status(201).json({
        status: 'ok',
        data: { engagement },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /:id — Update Engagement ───────────────────────────

router.patch(
  '/:id',
  protect,
  restrictTo('ADMIN', 'ANALYST'),
  validate(updateEngagementSchema),
  auditLog('UPDATE_ENGAGEMENT'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      // Verify engagement exists
      const existing = await prisma.engagement.findUnique({
        where: { id },
        select: { id: true, status: true },
      });

      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Engagement not found.',
        });
      }

      const updateData = { ...req.body };

      // Convert date strings to Date objects
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      if (updateData.dueDate) {
        updateData.dueDate = new Date(updateData.dueDate);
      }

      // Set completedAt when status changes to COMPLETE
      if (updateData.status === 'COMPLETE' && existing.status !== 'COMPLETE') {
        updateData.completedAt = new Date();
        updateData.progress = 100;
      }

      const engagement = await prisma.engagement.update({
        where: { id },
        data: updateData,
        include: {
          organisation: { select: { id: true, name: true } },
          analyst: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      return res.status(200).json({
        status: 'ok',
        data: { engagement },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── DELETE /:id — Delete Engagement ──────────────────────────

router.delete(
  '/:id',
  protect,
  restrictTo('ADMIN'),
  require2FA,
  auditLog('DELETE_ENGAGEMENT'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const existing = await prisma.engagement.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Engagement not found.',
        });
      }

      await prisma.engagement.delete({ where: { id } });

      return res.status(200).json({
        status: 'ok',
        data: { message: 'Engagement deleted successfully.' },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
