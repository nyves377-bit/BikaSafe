import { Router } from 'express';
import { applyPenalties } from '../services/penaltyEngine';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import { prisma } from '../index';

const router = Router();

// Manually trigger penalty check (In prod this would be a CRON)
router.post('/trigger-check', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        await applyPenalties(groupId);
        res.json({ message: 'Penalty check completed and penalties applied where necessary' });
    } catch (error: any) {
        res.status(500).json({ error: 'Penalty check failed', details: error.message });
    }
});

// Get all penalties for the group
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        // Since Penalty model doesn't have groupId directly in schema, 
        // we'll fetch by users belonging to the group
        const penalties = await prisma.penalty.findMany({
            where: {
                user: {
                    groupId
                }
            },
            include: {
                user: {
                    select: { name: true }
                }
            },
            orderBy: { timestamp: 'desc' }
        });
        res.json(penalties);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch penalties' });
    }
});

// Waive a penalty (Admin / Treasurer)
router.post('/:id/waive', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res) => {
    const penaltyId = req.params.id;
    const groupId = req.user?.groupId;

    try {
        const penalty = await prisma.penalty.findUnique({
            where: { id: penaltyId as string }
        });

        if (!penalty) return res.status(404).json({ error: 'Penalty not found' });
        if (penalty.groupId !== groupId) return res.status(403).json({ error: 'Unauthorized to waive this penalty' });
        if (penalty.status === 'PAID') return res.status(400).json({ error: 'Cannot waive a paid penalty' });

        const updatedPenalty = await prisma.penalty.update({
            where: { id: penaltyId as string },
            data: { status: 'WAIVED' }
        });

        await prisma.auditLog.create({
            data: {
                action: 'PENALTY_WAIVED',
                details: JSON.stringify({ penaltyId, amount: updatedPenalty.amount, reason: updatedPenalty.reason }),
                userId: req.user?.userId,
                groupId
            }
        });

        res.json(updatedPenalty);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to waive penalty', details: error.message });
    }
});

export default router;
