import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import { PaymentService, PaymentStatus } from '../services/paymentService';
import { SMSService } from '../services/smsService';
import { sendContributionReceiptEmail } from '../services/emailService';
import { generateRefNo } from '../utils/reference';
import { z } from 'zod/v4';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const recordSchema = z.object({
    userId: z.string().min(1, 'Member ID is required'),
    amount: z.coerce.number().positive('Amount must be positive'),
    status: z.enum(['PAID', 'LATE', 'MISSED']).default('PAID'),
    fundType: z.enum(['SAVINGS', 'SOCIAL']).default('SAVINGS'),
});

// Record a contribution (Treasurer or Admin)
router.post('/record', authenticate, authorize([ROLES.TREASURER, ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const parsed = recordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const groupId = req.user?.groupId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found in token' });

    try {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const expectedAmount = group.contributionAmt;
        const { userId, amount, status, fundType } = parsed.data;

        if (fundType === 'SAVINGS' && amount !== expectedAmount) {
            return res.status(400).json({
                error: `Incorrect contribution amount for Savings. Expected ${expectedAmount}, but received ${amount}.`
            });
        }

        const lookbackDate = new Date();
        if (group.frequency.toLowerCase() === 'monthly') {
            lookbackDate.setMonth(lookbackDate.getMonth() - 1);
        } else {
            lookbackDate.setDate(lookbackDate.getDate() - 7);
        }

        const existingContribution = await prisma.contribution.findFirst({
            where: {
                userId,
                groupId,
                fundType,
                timestamp: { gte: lookbackDate }
            }
        });

        if (existingContribution) {
            return res.status(400).json({
                error: `A contribution for this ${group.frequency} cycle has already been recorded for this member.`
            });
        }

        const contribution = await prisma.contribution.create({
            data: {
                refNo: generateRefNo('CON'),
                amount,
                status,
                fundType,
                userId,
                groupId,
                isLocked: true
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CONTRIBUTION_RECORDED',
                details: JSON.stringify({
                    contributionId: contribution.id,
                    userId,
                    amount,
                    refNo: contribution.refNo
                }),
                userId: req.user?.userId,
                groupId
            }
        });

        res.json(contribution);

        // Notify member via SMS and Email (non-blocking)
        prisma.user.findUnique({ where: { id: userId } }).then(member => {
            if (member) {
                if (member.phone) {
                    SMSService.notifyContributionSuccess(member.phone, amount, contribution.refNo!).catch(() => {});
                }
                if (member.email) {
                    sendContributionReceiptEmail(member.email, member.name, group.name, amount, contribution.refNo!, new Date()).catch(() => {});
                }
            }
        }).catch(() => {});
    } catch (error: any) {
        console.error('[CONTRIBUTION] Record error:', error.message);
        res.status(500).json({ error: 'Failed to record contribution' });
    }
});

// Initiate Mobile Money Payment (Member themself)
router.post('/initiate-mobile-payment', authenticate, async (req: AuthRequest, res: any) => {
    const { fundType = 'SAVINGS' } = req.body;
    const amount = parseFloat(req.body.amount);
    const { groupId, userId } = req.user!;

    if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: 'Valid positive amount is required' });

    try {
        const group = await prisma.group.findUnique({ where: { id: groupId as string } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const member = await prisma.user.findUnique({ where: { id: userId as string } });
        if (!member || !member.phone) return res.status(400).json({ error: 'Member phone number not found' });

        const payment = await PaymentService.initiateCollection({
            amount: amount,
            phone: member.phone,
            description: `BikaSafe Contribution: ${group.name}`
        });

        const contribution = await prisma.contribution.create({
            data: {
                refNo: generateRefNo('CON'),
                amount: amount,
                status: 'PAID',   // Updated to PAID once callback confirms success
                fundType,
                paymentStatus: payment.success ? PaymentStatus.PENDING : PaymentStatus.FAILED,
                providerRef: payment.providerRef,
                userId: userId as string,
                groupId: groupId as string,
                isLocked: false
            }
        });

        if (payment.success) {
            PaymentService.simulateCallback('CONTRIBUTION', contribution.id, PaymentStatus.SUCCESS).then(() => {
                if (member.phone) {
                    SMSService.notifyContributionSuccess(member.phone, amount, contribution.refNo!).catch(() => {});
                }
                if (member.email) {
                    sendContributionReceiptEmail(member.email, member.name, group.name, amount, contribution.refNo!, new Date()).catch(() => {});
                }
            });

            res.json({
                message: 'Payment initiated. Check your phone for the PIN prompt.',
                contributionId: contribution.id,
                providerRef: payment.providerRef
            });
        } else {
            res.status(502).json({
                error: 'Mobile Money provider failed to initiate request',
            });
        }

    } catch (error: any) {
        console.error('[CONTRIBUTION] Payment error:', error.message);
        res.status(500).json({ error: 'Failed to initiate payment' });
    }
});

// View all contributions for the group — with pagination
router.get('/', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const skip = (page - 1) * limit;

    try {
        const [contributions, total] = await Promise.all([
            prisma.contribution.findMany({
                where: { groupId },
                include: { user: { select: { name: true, phone: true } } },
                orderBy: { timestamp: 'desc' },
                take: limit,
                skip
            }),
            prisma.contribution.count({ where: { groupId } })
        ]);
        res.json({ data: contributions, total, page, limit, pages: Math.ceil(total / limit) });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch contributions' });
    }
});

export default router;
