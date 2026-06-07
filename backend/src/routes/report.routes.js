// ═══════════════════════════════════════════════════════════════
// HexaShield Security — Report Routes
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const { protect, restrictTo, verifyOrgAccess } = require('../middleware/auth');
const { downloadLimiter } = require('../middleware/security');
const { auditLog } = require('../middleware/errorHandler');
const { uploadFile, downloadFile } = require('../utils/github-storage');
const { sendEmail } = require('../utils/email');

const router = express.Router();
const prisma = new PrismaClient();

// ── Multer Configuration ─────────────────────────────────────

const ALLOWED_MIMES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/zip',
  'text/csv',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('File type not allowed. Accepted: PDF, DOCX, XLSX, ZIP, CSV.'), false);
    }
  },
});

// ── GET / — List Reports ─────────────────────────────────────

router.get('/', protect, async (req, res, next) => {
  try {
    const { page = '1', limit = '10', type, engagementId } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {};

    // CLIENT: restrict to reports from own org's engagements
    if (req.user.role === 'CLIENT') {
      if (!req.user.orgId) {
        return res.status(200).json({
          status: 'ok',
          data: { reports: [], total: 0, page: pageNum, limit: limitNum },
        });
      }
      where.engagement = { orgId: req.user.orgId };
      where.visibility = 'client'; // Only show client-visible reports
    }

    if (type) {
      where.type = type;
    }
    if (engagementId) {
      where.engagementId = engagementId;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          engagement: {
            select: { id: true, refId: true, name: true, orgId: true },
          },
          uploadedBy: {
            select: { id: true, firstName: true, lastName: true },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    // Check access expiry
    const filteredReports = reports.map((report) => {
      if (report.accessExpiry && new Date(report.accessExpiry) < new Date()) {
        return { ...report, expired: true };
      }
      return report;
    });

    return res.status(200).json({
      status: 'ok',
      data: {
        reports: filteredReports,
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

// ── POST / — Upload Report ───────────────────────────────────

router.post(
  '/',
  protect,
  restrictTo('ADMIN', 'ANALYST'),
  upload.single('file'),
  auditLog('UPLOAD_REPORT'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          status: 'error',
          message: 'Report file is required.',
        });
      }

      const { name, type, version, engagementId, notifyClient, visibility, accessExpiry } = req.body;

      // Validate required fields
      if (!name || !type || !engagementId) {
        return res.status(400).json({
          status: 'error',
          message: 'Name, type, and engagement ID are required.',
        });
      }

      const REPORT_TYPES = ['TECHNICAL', 'EXECUTIVE', 'GAP_ANALYSIS', 'CERTIFICATE', 'RETEST'];
      if (!REPORT_TYPES.includes(type)) {
        return res.status(400).json({
          status: 'error',
          message: `Type must be one of: ${REPORT_TYPES.join(', ')}`,
        });
      }

      // Verify engagement exists
      const engagement = await prisma.engagement.findUnique({
        where: { id: engagementId },
        select: {
          id: true,
          orgId: true,
          organisation: {
            select: { id: true, name: true, contactEmail: true },
          },
        },
      });

      if (!engagement) {
        return res.status(404).json({
          status: 'error',
          message: 'Engagement not found.',
        });
      }

      // Sanitize filename
      const ext = path.extname(req.file.originalname).toLowerCase();
      const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `${safeName}_${Date.now()}${ext}`;
      const storagePath = `reports/${engagement.orgId}/${engagementId}/${fileName}`;

      // Upload to GitHub (or local fallback)
      await uploadFile(storagePath, req.file.buffer, req.file.mimetype);

      // Save to database
      const report = await prisma.report.create({
        data: {
          name,
          type,
          version: version || 'v1.0',
          storageKey: storagePath,
          sizeBytes: req.file.size,
          notifyClient: notifyClient === 'true' || notifyClient === true,
          visibility: visibility || 'private',
          accessExpiry: accessExpiry ? new Date(accessExpiry) : null,
          engagementId,
          uploadedById: req.user.userId,
        },
        include: {
          engagement: { select: { id: true, refId: true, name: true } },
          uploadedBy: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      // Notify client if requested
      if (report.notifyClient && engagement.organisation?.contactEmail) {
        sendEmail({
          to: engagement.organisation.contactEmail,
          subject: `New Report Available — ${report.name}`,
          html: `
            <h2>HexaShield Security</h2>
            <p>A new report has been uploaded for your review:</p>
            <ul>
              <li><strong>Report:</strong> ${report.name}</li>
              <li><strong>Type:</strong> ${report.type}</li>
              <li><strong>Engagement:</strong> ${engagement.organisation.name}</li>
            </ul>
            <p>Please log in to your HexaShield portal to download the report.</p>
          `,
        }).catch(() => {
          // Email notification failures should not block the upload
        });
      }

      return res.status(201).json({
        status: 'ok',
        data: { report },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ── GET /:id/download — Download Report ──────────────────────

router.get(
  '/:id/download',
  protect,
  downloadLimiter,
  auditLog('DOWNLOAD_REPORT'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const report = await prisma.report.findUnique({
        where: { id },
        include: {
          engagement: { select: { id: true, orgId: true } },
        },
      });

      if (!report) {
        return res.status(404).json({
          status: 'error',
          message: 'Report not found.',
        });
      }

      // CLIENT: verify org access
      if (req.user.role === 'CLIENT') {
        if (report.engagement.orgId !== req.user.orgId) {
          await prisma.auditLog.create({
            data: {
              action: 'UNAUTHORIZED_DOWNLOAD_ATTEMPT',
              userId: req.user.userId,
              resourceId: id,
              ip: req.ip || 'unknown',
              userAgent: req.headers['user-agent'] || 'unknown',
              statusCode: 403,
            },
          });

          return res.status(403).json({
            status: 'error',
            message: 'You do not have access to this report.',
          });
        }

        // Check visibility
        if (report.visibility !== 'client') {
          return res.status(403).json({
            status: 'error',
            message: 'This report is not available for download.',
          });
        }
      }

      // Check access expiry
      if (report.accessExpiry && new Date(report.accessExpiry) < new Date()) {
        return res.status(403).json({
          status: 'error',
          message: 'Report access has expired.',
        });
      }

      // Download file from storage
      const fileBuffer = await downloadFile(report.storageKey);

      // Log download
      await prisma.downloadLog.create({
        data: {
          reportId: id,
          userId: req.user.userId,
          ip: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
        },
      });

      // Determine content type from extension
      const ext = path.extname(report.storageKey).toLowerCase();
      const mimeTypes = {
        '.pdf': 'application/pdf',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.zip': 'application/zip',
        '.csv': 'text/csv',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${report.name}${ext}"`);
      res.setHeader('Content-Length', fileBuffer.length);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

      return res.send(fileBuffer);
    } catch (err) {
      if (err.message?.includes('not found')) {
        return res.status(404).json({
          status: 'error',
          message: 'Report file not found in storage.',
        });
      }
      next(err);
    }
  }
);

module.exports = router;
