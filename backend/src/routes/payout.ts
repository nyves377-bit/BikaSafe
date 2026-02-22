import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all payout requests for the group
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const payouts = await prisma.payout.findMany({
            where: { groupId },
            include: {
                requestedBy: { select: { name: true } },
                approvals: { include: { admin: { select: { name: true } } } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(payouts);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch payouts' });
    }
});

// Request a new payout (Treasurers or Admins)
router.post('/request', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    const { amount, description } = req.body;
    const { groupId, userId } = req.user!;

    if (!amount || !description) return res.status(400).json({ error: 'Amount and description are required' });

    try {
        const payout = await prisma.payout.create({
            data: {
                amount: parseFloat(amount),
                description,
                status: 'PENDING',
                requestedById: userId as string,
                groupId: groupId as string
            }
        });
        res.status(201).json(payout);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create payout request' });
    }
});

// Approve a payout request (Requires 2 unique approvals total)
router.post('/:id/approve', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    const payoutId = req.params.id;
    const { userId } = req.user!;

    try {
        const payout = await prisma.payout.findUnique({
            where: { id: payoutId as string },
            include: { approvals: true }
        });

        if (!payout) return res.status(404).json({ error: 'Payout not found' });
        if (payout.status !== 'PENDING') return res.status(400).json({ error: 'Payout is already processed' });

        // Cannot approve your own request
        if (payout.requestedById === userId) {
            return res.status(400).json({ error: 'You cannot approve your own payout request' });
        }

        // Check if already approved by this user
        const alreadyApproved = (payout.approvals as any[]).some(a => a.adminId === userId);
        if (alreadyApproved) {
            return res.status(400).json({ error: 'You have already approved this payout' });
        }

        // Add approval
        await prisma.payoutApproval.create({
            data: {
                payoutId: payoutId as string,
                adminId: userId as string
            }
        });

        // Check if we now have 2 approvals
        const currentApprovals = await prisma.payoutApproval.count({
            where: { payoutId: payoutId as string }
        });

        if (currentApprovals >= 2) {
            await prisma.$transaction(async (tx) => {
                await tx.payout.update({
                    where: { id: payoutId as string },
                    data: { status: 'APPROVED' }
                });

                // If this payout is linked to a loan, activate the loan
                if (payout.loanId) {
                    await tx.loan.update({
                        where: { id: payout.loanId },
                        data: { status: 'ACTIVE' }
                    });

                    console.log(`[PAYOUT] Loan ${payout.loanId} activated via payout approval`);
                }

                await tx.auditLog.create({
                    data: {
                        action: 'PAYOUT_FINALIZED',
                        details: JSON.stringify({ payoutId: payoutId, amount: payout.amount, loanId: payout.loanId }),
                        groupId: payout.groupId as string,
                        userId: userId as string
                    }
                });
            });
        }

        res.json({ message: 'Payout approved successfully', totalApprovals: currentApprovals });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to approve payout' });
    }
});

export default router;
