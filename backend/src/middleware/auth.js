// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Authentication & Authorization Middleware
// ═══════════════════════════════════════════════════════════════

const { PrismaClient } = require('@prisma/client');
const { verifyAccessToken } = require('../utils/jwt');

const prisma = new PrismaClient();

/**
 * Protect route — verify JWT and attach user to request
 */
function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in.',
      });
    }

    const decoded = verifyAccessToken(token);

    // Reject partial tokens (2FA not completed)
    if (decoded.partial) {
      return res.status(401).json({
        status: 'error',
        message: 'Two-factor authentication required.',
      });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      orgId: decoded.orgId,
    };

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Session expired. Please log in again.',
      });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token.',
      });
    }
    next(err);
  }
}

/**
 * Restrict access to specific roles
 */
function restrictTo(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to perform this action.',
      });
    }

    next();
  };
}

/**
 * Require completed 2FA for admin operations
 */
function require2FA(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication required.',
    });
  }

  // Only enforce for ADMIN role
  if (req.user.role === 'ADMIN' && !req.user.twoFactorVerified) {
    return res.status(403).json({
      status: 'error',
      message: 'Two-factor authentication verification required for this action.',
    });
  }

  next();
}

/**
 * Verify organisation access for CLIENT role users
 * Fetches the resource and checks if it belongs to the user's org
 * @param {string} model - Prisma model name ('engagement', 'report', 'finding')
 */
function verifyOrgAccess(model) {
  return async (req, res, next) => {
    try {
      // ADMIN and ANALYST have access to all resources
      if (req.user.role === 'ADMIN' || req.user.role === 'ANALYST') {
        return next();
      }

      // CLIENT must have orgId
      if (!req.user.orgId) {
        return res.status(403).json({
          status: 'error',
          message: 'No organisation associated with your account.',
        });
      }

      const resourceId = req.params.id;
      if (!resourceId) {
        return next();
      }

      let resource;
      let resourceOrgId;

      switch (model) {
        case 'engagement':
          resource = await prisma.engagement.findUnique({
            where: { id: resourceId },
            select: { orgId: true },
          });
          resourceOrgId = resource?.orgId;
          break;

        case 'report':
          resource = await prisma.report.findUnique({
            where: { id: resourceId },
            include: {
              engagement: { select: { orgId: true } },
            },
          });
          resourceOrgId = resource?.engagement?.orgId;
          break;

        case 'finding':
          resource = await prisma.finding.findUnique({
            where: { id: resourceId },
            include: {
              engagement: { select: { orgId: true } },
            },
          });
          resourceOrgId = resource?.engagement?.orgId;
          break;

        default:
          return res.status(500).json({
            status: 'error',
            message: 'Invalid resource type for access verification.',
          });
      }

      if (!resource) {
        return res.status(404).json({
          status: 'error',
          message: `${model.charAt(0).toUpperCase() + model.slice(1)} not found.`,
        });
      }

      if (resourceOrgId !== req.user.orgId) {
        // Log the access mismatch for security audit
        await prisma.auditLog.create({
          data: {
            action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
            userId: req.user.userId,
            resourceId,
            ip: req.ip || 'unknown',
            userAgent: req.headers['user-agent'] || 'unknown',
            statusCode: 403,
          },
        });

        return res.status(403).json({
          status: 'error',
          message: 'You do not have access to this resource.',
        });
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

module.exports = {
  protect,
  restrictTo,
  require2FA,
  verifyOrgAccess,
};
