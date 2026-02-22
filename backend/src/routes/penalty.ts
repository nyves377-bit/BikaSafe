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

export default router;
