import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';

const router = Router();

// Get audit logs for the group (Admin/Treasurer only)
router.get('/', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const logs = await prisma.auditLog.findMany({
            where: { groupId },
            include: {
                user: {
                    select: { name: true, role: true }
                }
            },
            orderBy: { timestamp: 'desc' },
            take: 100 // Limit to last 100 logs
        });
        res.json(logs);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

export default router;
