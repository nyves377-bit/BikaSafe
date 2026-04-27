import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import { generateRefNo } from '../utils/reference';
import { z } from 'zod/v4';
import { sendLoanApprovedEmail, sendLoanRejectedEmail } from '../services/emailService';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const loanRequestSchema = z.object({
    amount: z.coerce.number().positive('Amount must be positive').max(100000000, 'Amount is too large'),
    interestRate: z.coerce.number().min(0, 'Interest rate cannot be negative').max(100, 'Interest rate cannot exceed 100%'),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid deadline date'),
    guarantorId: z.string().optional()
});

// Request a loan (Members)
router.post('/request', authenticate, async (req: AuthRequest, res) => {
    const parsed = loanRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { amount, interestRate, deadline, guarantorId } = parsed.data;
    const userId = req.user?.userId;
    const groupId = req.user?.groupId;

    if (!userId || !groupId) return res.status(400).json({ error: 'User/Group not found' });

    try {
        const loan = await prisma.loan.create({
            data: {
                refNo: generateRefNo('LOA'),
                amount,
                interestRate,
                deadline: new Date(deadline),
                status: 'PENDING',
                userId,
                groupId,
                ...(guarantorId ? { guarantorId } : {})
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'LOAN_REQUESTED',
                details: JSON.stringify({ loanId: loan.id, amount, interestRate }),
                userId,
                groupId
            }
        });

        res.json(loan);
    } catch (error: any) {
        console.error('[LOAN] Request error:', error.message);
        res.status(500).json({ error: 'Failed to request loan' });
    }
});

// Update loan status (Treasurer)
router.patch('/:id/status', authenticate, authorize([ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    const { status } = req.body;
    const loanId = req.params.id as string;
    const groupId = req.user?.groupId;
    const userId = req.user?.userId;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
        return res.status(400).json({ error: 'Status must be APPROVED or REJECTED' });
    }

    try {
        const loan = await prisma.loan.findFirst({
            where: { id: loanId, groupId: groupId as string },
            include: { user: { select: { name: true, email: true } }, group: { select: { name: true } } }
        });

        if (!loan) return res.status(404).json({ error: 'Loan not found' });
        if (loan.status !== 'PENDING') return res.status(400).json({ error: 'Loan already processed' });

        if (status === 'APPROVED') {
            const [updatedLoan, payout] = await prisma.$transaction([
                prisma.loan.update({
                    where: { id: loanId },
                    data: { status: 'APPROVED' }
                }),
                prisma.payout.create({
                    data: {
                        refNo: generateRefNo('PAY'),
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
                    details: JSON.stringify({ loanId: updatedLoan.id, amount: updatedLoan.amount }),
                    userId,
                    groupId: groupId!
                }
            });

            // Notify borrower via email (non-blocking)
            if (loan.user.email) {
                sendLoanApprovedEmail(
                    loan.user.email!, loan.user.name, loan.group.name,
                    Number(loan.amount), loan.deadline, loan.refNo ?? 'N/A'
                ).catch(() => {});
            }

            return res.json({ loan: updatedLoan, payout });
        } else {
            const updatedLoan = await prisma.loan.update({
                where: { id: loanId },
                data: { status }
            });

            await prisma.auditLog.create({
                data: {
                    action: `LOAN_${status}`,
                    details: JSON.stringify({ loanId: updatedLoan.id }),
                    userId,
                    groupId: groupId!
                }
            });

            // Notify borrower via email (non-blocking)
            if (loan.user.email) {
                sendLoanRejectedEmail(
                    loan.user.email!, loan.user.name, loan.group.name,
                    Number(loan.amount), loan.refNo ?? 'N/A'
                ).catch(() => {});
            }

            return res.json(updatedLoan);
        }
    } catch (error: any) {
        console.error('[LOAN] Status update error:', error.message);
        res.status(500).json({ error: 'Failed to update loan status' });
    }
});

// Record repayment (Treasurer)
router.post('/:id/repay', authenticate, authorize([ROLES.TREASURER]), async (req: AuthRequest, res) => {
    const amount = parseFloat(req.body.amount);
    const loanId = req.params.id as string;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Valid positive amount is required' });
    }

    try {
        const repayment = await prisma.repayment.create({
            data: {
                amount,
                loanId
            }
        });

        res.json(repayment);
    } catch (error: any) {
        console.error('[LOAN] Repayment error:', error.message);
        res.status(500).json({ error: 'Failed to record repayment' });
    }
});

// Get all loans for the group — with pagination
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    try {
        const [loans, total] = await Promise.all([
            prisma.loan.findMany({
                where: { groupId },
                include: { 
                    user: { select: { name: true, phone: true } },
                    guarantor: { select: { name: true } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            prisma.loan.count({ where: { groupId } })
        ]);
        res.json({ data: loans, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch loans' });
    }
});

export default router;
