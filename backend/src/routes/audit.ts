import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';

const router = Router();

// Get audit logs for the group (Admin/Treasurer only) — with pagination
router.get('/', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit as string) || 100));
    const skip = (page - 1) * limit;

    try {
        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                where: { groupId },
                include: {
                    user: {
                        select: { name: true, role: true }
                    }
                },
                orderBy: { timestamp: 'desc' },
                take: limit,
                skip
            }),
            prisma.auditLog.count({ where: { groupId } })
        ]);
        res.json({ data: logs, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
