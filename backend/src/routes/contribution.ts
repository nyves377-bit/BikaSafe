import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';

const router = Router();

// Record a contribution (Treasurer only)
router.post('/record', authenticate, authorize([ROLES.TREASURER, ROLES.ADMIN]), async (req: AuthRequest, res) => {
    const { userId, amount, status } = req.body;
    const groupId = req.user?.groupId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found in token' });

    try {
        const contribution = await prisma.contribution.create({
            data: {
                amount: parseFloat(amount),
                status, // PAID, LATE, MISSED
                userId,
                groupId,
                isLocked: true // Locked immediately
            }
        });

        // Create Audit Log
        await prisma.auditLog.create({
            data: {
                action: 'CONTRIBUTION_RECORDED',
                details: JSON.stringify(contribution),
                userId: req.user?.userId,
                groupId
            }
        });

        res.json(contribution);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to record contribution', details: error.message });
    }
});

// View all contributions for the group (All members)
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;

    try {
        const contributions = await prisma.contribution.findMany({
            where: { groupId },
            include: { user: { select: { name: true, phone: true } } },
            orderBy: { timestamp: 'desc' }
        });
        res.json(contributions);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

export default router;
