import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';

const router = Router();

// Request a loan (Members)
router.post('/request', authenticate, async (req: AuthRequest, res) => {
    const { amount, interestRate, deadline } = req.body;
    const userId = req.user?.userId;
    const groupId = req.user?.groupId;

    if (!userId || !groupId) return res.status(400).json({ error: 'User/Group not found' });

    try {
        const loan = await prisma.loan.create({
            data: {
                amount: parseFloat(amount),
                interestRate: parseFloat(interestRate),
                deadline: new Date(deadline),
                status: 'PENDING', // Start as PENDING
                userId,
                groupId
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'LOAN_REQUESTED',
                details: JSON.stringify(loan),
                userId,
                groupId
            }
        });

        res.json(loan);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to request loan' });
    }
});

// Update loan status (Admin/Treasurer)
router.patch('/:id/status', authenticate, authorize([ROLES.ADMIN, ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    const { status } = req.body;
    const { id } = req.params;
    const groupId = req.user?.groupId;
    const userId = req.user?.userId;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        const loan = await prisma.loan.findFirst({
            where: { id: id as string, groupId: groupId as string },
            include: { user: { select: { name: true } } }
        });

        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        if (loan.status !== 'PENDING') return res.status(400).json({ error: 'Loan already processed' });

        if (status === 'APPROVED') {
            // Use a transaction to update loan and create payout
            const [updatedLoan, payout] = await prisma.$transaction([
                prisma.loan.update({
                    where: { id: id as string },
                    data: { status: 'APPROVED' }
                }),
                prisma.payout.create({
                    data: {
                        amount: loan.amount,
                        description: `Loan Disbursement for ${loan.user.name}`,
                        status: 'PENDING',
                        requestedById: userId as string,
                        groupId: groupId as string,
                        loanId: loan.id
                    }
                })
            ]);

            await prisma.auditLog.create({
                data: {
                    action: 'LOAN_APPROVED_AWAITING_PAYOUT',
                    details: JSON.stringify(updatedLoan),
                    userId,
                    groupId: groupId!
                }
            });

            return res.json({ loan: updatedLoan, payout });
        } else {
            const updatedLoan = await prisma.loan.update({
                where: { id: id as string },
                data: { status }
            });

            await prisma.auditLog.create({
                data: {
                    action: `LOAN_${status}`,
                    details: JSON.stringify(updatedLoan),
                    userId,
                    groupId: groupId!
                }
            });

            return res.json(updatedLoan);
        }
    } catch (error: any) {
        console.error('[LOAN] Status update error:', error.message);
        res.status(500).json({ error: 'Failed to update loan status' });
    }
});

// Record repayment (Treasurer)
router.post('/:id/repay', authenticate, authorize([ROLES.TREASURER]), async (req: AuthRequest, res) => {
    const { amount } = req.body;
    const { id } = req.params;

    try {
        const repayment = await prisma.repayment.create({
            data: {
                amount: parseFloat(amount),
                loanId: id as string
            }
        });

        res.json(repayment);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to record repayment' });
    }
});

// Get all loans for the group
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const loans = await prisma.loan.findMany({
            where: { groupId },
            include: { user: { select: { name: true, phone: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(loans);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

export default router;
