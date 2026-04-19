import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import { PaymentService, PaymentStatus } from '../services/paymentService';
import { SMSService } from '../services/smsService';
import { generateRefNo } from '../utils/reference';
import { z } from 'zod/v4';
import { GroupService } from '../services/groupService';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const payoutRequestSchema = z.object({
    amount: z.coerce.number().positive('Amount must be positive').max(100000000, 'Amount too large'),
    description: z.string().min(3, 'Description must be at least 3 characters').max(500, 'Description too long'),
});

// Get all payout requests for the group — with pagination
router.get('/', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    try {
        const [payouts, total] = await Promise.all([
            prisma.payout.findMany({
                where: { groupId },
                include: {
                    requestedBy: { select: { name: true } },
                    approvals: { include: { admin: { select: { name: true } } } }
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip
            }),
            prisma.payout.count({ where: { groupId } })
        ]);
        res.json({ data: payouts, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch payouts' });
    }
});

// Request a new payout (Treasurers only)
router.post('/request', authenticate, authorize([ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    // Pre-coerce
    if (req.body.amount) req.body.amount = parseFloat(req.body.amount);

    const parsed = payoutRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { amount, description } = parsed.data;
    const { groupId, userId } = req.user!;

    try {
        const payout = await prisma.payout.create({
            data: {
                refNo: generateRefNo('PAY'),
                amount,
                description,
                status: 'PENDING',
                requestedById: userId as string,
                groupId: groupId as string
            }
        });
        res.status(201).json(payout);
    } catch (error: any) {
        console.error('[PAYOUT] Create error:', error.message);
        res.status(500).json({ error: 'Failed to create payout request' });
    }
});

// Approve a payout request (Requires 2 unique approvals from Treasurers)
router.post('/:id/approve', authenticate, authorize([ROLES.TREASURER]), async (req: AuthRequest, res: any) => {
    const payoutId = req.params.id as string;
    const { userId } = req.user!;

    try {
        const payout = await prisma.payout.findUnique({
            where: { id: payoutId },
            include: { approvals: true }
        });

        if (!payout) return res.status(404).json({ error: 'Payout not found' });
        if (payout.status !== 'PENDING') return res.status(400).json({ error: 'Payout is already processed' });

        if (payout.requestedById === userId) {
            return res.status(400).json({ error: 'You cannot approve your own payout request' });
        }

        const alreadyApproved = (payout.approvals as any[]).some(a => a.adminId === userId);
        if (alreadyApproved) {
            return res.status(400).json({ error: 'You have already approved this payout' });
        }

        await prisma.payoutApproval.create({
            data: {
                payoutId,
                adminId: userId as string
            }
        });

        const approvalCount = await prisma.payoutApproval.count({
            where: { payoutId }
        });

        if (approvalCount >= 1) {
            await prisma.$transaction(async (tx) => {
                // Check Treasury Balance first
                const balance = await GroupService.getGroupBalance(payout.groupId as string);
                
                if (balance < payout.amount) {
                    await tx.auditLog.create({
                        data: {
                            action: 'PAYOUT_REJECTED_INSUFFICIENT_FUNDS',
                            details: JSON.stringify({
                                payoutId,
                                amount: payout.amount,
                                currentBalance: balance
                            }),
                            groupId: payout.groupId as string,
                            userId: userId as string
                        }
                    });
                    throw new Error(`Insufficient group funds. Current balance: RWF ${balance}`);
                }

                const userToPay = await tx.user.findUnique({
                    where: { id: payout.requestedById },
                    select: { phone: true }
                });

                if (!userToPay || !userToPay.phone) {
                    throw new Error('Member phone number not found for disbursement');
                }

                const disbursement = await PaymentService.initiateDisbursement({
                    amount: payout.amount,
                    phone: userToPay.phone,
                    description: `BikaSafe Payout: ${payout.description}`
                });

                const updatedPayout = await tx.payout.update({
                    where: { id: payoutId },
                    data: {
                        status: disbursement.success ? 'APPROVED' : 'PENDING',
                        paymentStatus: disbursement.success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
                        providerRef: disbursement.providerRef
                    }
                });

                if (disbursement.success && updatedPayout.loanId) {
                    await tx.loan.update({
                        where: { id: updatedPayout.loanId },
                        data: { status: 'ACTIVE' }
                    });
                }

                if (disbursement.success) {
                    await SMSService.notifyDisbursementSuccess(userToPay.phone!, updatedPayout.amount, disbursement.providerRef!);
                }

                await tx.auditLog.create({
                    data: {
                        action: disbursement.success ? 'PAYOUT_FINALIZED' : 'PAYOUT_DISBURSEMENT_FAILED',
                        details: JSON.stringify({
                            payoutId,
                            amount: updatedPayout.amount,
                            signatories: approvalCount + 1,
                            status: disbursement.success ? 'SUCCESS' : 'FAILED'
                        }),
                        groupId: updatedPayout.groupId as string,
                        userId: userId as string
                    }
                });
            });

            return res.json({
                message: 'Dual-signature requirement met. Disbursement initiated.',
                status: 'PROCESSING'
            });
        }

        res.json({
            message: 'Approval recorded. Waiting for additional signature.',
            totalApprovals: approvalCount
        });
    } catch (error: any) {
        console.error('[PAYOUT] Approve error:', error.message);
        res.status(500).json({ error: 'Failed to approve payout' });
    }
});

export default router;
