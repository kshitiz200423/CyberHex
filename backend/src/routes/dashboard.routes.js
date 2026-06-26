// ═══════════════════════════════════════════════════════════════
// Auronix Technologies — Dashboard Routes
// ═══════════════════════════════════════════════════════════════

const { Router } = require('express');
const { protect } = require('../middleware/auth');

const router = Router();

// GET /api/dashboard/stats — Dashboard statistics
router.get('/stats', protect, async (req, res, next) => {
  try {
    const prisma = req.app.get('prisma');
    const userId = req.user.id;
    const userRole = req.user.role;
    const orgId = req.user.orgId;

    // Build where clause based on role
    const engagementWhere = userRole === 'CLIENT' ? { orgId } : {};
    const findingWhere = userRole === 'CLIENT'
      ? { engagement: { orgId } }
      : {};

    const [
      activeEngagements,
      totalEngagements,
      criticalFindings,
      openFindings,
      fixedFindings,
      totalFindings,
      reportsCount,
      recentActivity,
    ] = await Promise.all([
      prisma.engagement.count({
        where: { ...engagementWhere, status: { in: ['IN_PROGRESS', 'IN_REVIEW'] } },
      }),
      prisma.engagement.count({ where: engagementWhere }),
      prisma.finding.count({
        where: { ...findingWhere, severity: 'CRITICAL', status: { not: 'FIXED' } },
      }),
      prisma.finding.count({
        where: { ...findingWhere, status: 'OPEN' },
      }),
      prisma.finding.count({
        where: { ...findingWhere, status: 'FIXED' },
      }),
      prisma.finding.count({ where: findingWhere }),
      prisma.report.count({
        where: userRole === 'CLIENT'
          ? { engagement: { orgId } }
          : {},
      }),
      prisma.auditLog.findMany({
        where: userRole === 'CLIENT' ? { userId } : {},
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
    ]);

    const fixRate = totalFindings > 0
      ? Math.round((fixedFindings / totalFindings) * 100)
      : 0;

    res.json({
      status: 'success',
      data: {
        activeEngagements,
        totalEngagements,
        criticalFindings,
        openFindings,
        fixRate,
        reportsCount,
        recentActivity: recentActivity.map((log) => ({
          id: log.id,
          action: log.action,
          user: `${log.user.firstName} ${log.user.lastName}`,
          createdAt: log.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
