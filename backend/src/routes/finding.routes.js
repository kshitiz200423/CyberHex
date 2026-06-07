// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Finding Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { PrismaClient } = require('@prisma/client');

const { protect, restrictTo, verifyOrgAccess } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { auditLog } = require('../middleware/errorHandler');
const { createFindingSchema, updateFindingSchema } = require('../schemas/finding.schemas');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * Generate a unique finding reference ID
 * Format: F-{engagement_num}-{sequential}
 */
async function generateFindingRefId(engagementRefId) {
  const engNum = engagementRefId.split('-').pop(); // e.g., '071' from 'HS-2025-071'

  const lastFinding = await prisma.finding.findFirst({
    where: { refId: { startsWith: `F-${engNum}-` } },
    orderBy: { refId: 'desc' },
    select: { refId: true },
  });

  let nextNum = 1;
  if (lastFinding) {
    const lastNum = parseInt(lastFinding.refId.split('-').pop(), 10);
    if (!isNaN(lastNum)) {
      nextNum = lastNum + 1;
    }
  }

  return `F-${engNum}-${String(nextNum).padStart(2, '0')}`;
}

// ── GET /engagements/:id/findings — List Findings ────────────

router.get(
  '/engagements/:id/findings',
  protect,
  verifyOrgAccess('engagement'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { page = '1', limit = '20', severity, status, search } = req.query;
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const skip = (pageNum - 1) * limitNum;

      // Verify engagement exists
      const engagement = await prisma.engagement.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!engagement) {
        return res.status(404).json({
          status: 'error',
          message: 'Engagement not found.',
        });
      }

      const where = { engagementId: id };

      if (severity) {
        where.severity = severity;
      }
      if (status) {
        where.status = status;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { refId: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [findings, total] = await Promise.all([
        prisma.finding.findMany({
          where,
          skip,
          take: limitNum,
          orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
          include: {
            _count: { select: { updates: true } },
          },
        }),
        prisma.finding.count({ where }),
      ]);

      return res.status(200).json({
        status: 'ok',
        data: {
          findings,
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

// ── POST / — Create Finding ─────────────────────────────────

router.post(
  '/',
  protect,
  restrictTo('ADMIN', 'ANALYST'),
  validate(createFindingSchema),
  auditLog('CREATE_FINDING'),
  async (req, res, next) => {
    try {
      const { title, severity, cvss, description, remediation, references, engagementId } = req.body;

      // Verify engagement exists
      const engagement = await prisma.engagement.findUnique({
        where: { id: engagementId },
        select: { id: true, refId: true },
      });

      if (!engagement) {
        return res.status(404).json({
          status: 'error',
          message: 'Engagement not found.',
        });
      }

      const refId = await generateFindingRefId(engagement.refId);

      const finding = await prisma.finding.create({
        data: {
          refId,
          title,
          severity,
          cvss,
          description,
          remediation,
          references: references || [],
          engagementId,
        },
      });

      return res.status(201).json({
        status: 'ok',
        data: { finding },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── PATCH /:id — Update Finding ──────────────────────────────

router.patch(
  '/:id',
  protect,
  validate(updateFindingSchema),
  auditLog('UPDATE_FINDING'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const existing = await prisma.finding.findUnique({
        where: { id },
        include: {
          engagement: { select: { orgId: true } },
        },
      });

      if (!existing) {
        return res.status(404).json({
          status: 'error',
          message: 'Finding not found.',
        });
      }

      // CLIENT: verify org access
      if (req.user.role === 'CLIENT') {
        if (existing.engagement.orgId !== req.user.orgId) {
          return res.status(403).json({
            status: 'error',
            message: 'You do not have access to this finding.',
          });
        }

        // CLIENT can only set IN_PROGRESS or FIXED
        const allowedClientStatuses = ['IN_PROGRESS', 'FIXED'];
        if (req.body.status && !allowedClientStatuses.includes(req.body.status)) {
          return res.status(403).json({
            status: 'error',
            message: `Clients can only set status to: ${allowedClientStatuses.join(', ')}`,
          });
        }

        // CLIENT can only update status and note
        const { status, note } = req.body;
        req.body = { status, note };
      }

      const { status, note, ...otherUpdates } = req.body;
      const updateData = { ...otherUpdates };

      // Handle status change
      if (status && status !== existing.status) {
        updateData.status = status;

        // Set fixedAt when status changes to FIXED
        if (status === 'FIXED') {
          updateData.fixedAt = new Date();
        } else if (existing.fixedAt) {
          updateData.fixedAt = null;
        }

        // Create finding update record
        await prisma.findingUpdate.create({
          data: {
            note: note || `Status changed from ${existing.status} to ${status}`,
            previousStatus: existing.status,
            newStatus: status,
            userId: req.user.userId,
            findingId: id,
          },
        });
      }

      const finding = await prisma.finding.update({
        where: { id },
        data: updateData,
        include: {
          updates: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
              user: { select: { id: true, firstName: true, lastName: true } },
            },
          },
        },
      });

      return res.status(200).json({
        status: 'ok',
        data: { finding },
      });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
