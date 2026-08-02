import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod/v4';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const addMemberSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only digits'),
    role: z.enum(['MEMBER', 'TREASURER', 'AUDITOR', 'ADMIN']).optional().default('MEMBER'),
    nationalId: z.string().length(16, 'National ID must be exactly 16 digits').regex(/^\d+$/).optional().or(z.literal('')),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
});

const goalSchema = z.object({
    goal: z.number().positive('Goal must be a positive number').max(100000000000, 'Goal amount is too large'),
});

// ─── Helper: Generate secure temporary password ──────────────────────
function generateTempPassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    const bytes = crypto.randomBytes(8);
    for (let i = 0; i < 8; i++) {
        password += chars[bytes[i] % chars.length];
    }
    return password;
}

// ─── Helper: Calculate real trust score ──────────────────────────────
async function calculateTrustScore(groupId: string): Promise<number> {
    const [totalContribs, paidContribs, totalLoans, repaidLoans, unpaidPenalties] = await Promise.all([
        prisma.contribution.count({ where: { groupId } }),
        prisma.contribution.count({ where: { groupId, status: 'PAID' } }),
        prisma.loan.count({ where: { groupId, status: { in: ['ACTIVE', 'REPAID', 'OVERDUE'] } } }),
        prisma.loan.count({ where: { groupId, status: 'REPAID' } }),
        prisma.penalty.count({ where: { groupId, status: 'UNPAID' } }),
    ]);

    const contribScore = totalContribs > 0 ? (paidContribs / totalContribs) * 50 : 50;
    const loanScore = totalLoans > 0 ? (repaidLoans / totalLoans) * 30 : 30;
    const penaltyScore = unpaidPenalties === 0 ? 20 : Math.max(0, 20 - (unpaidPenalties * 2));

    return Math.round((contribScore + loanScore + penaltyScore) * 10) / 10;
}

// Validation schema for group registration
const registerGroupSchema = z.object({
    groupName: z.string().min(2).max(100),
    registrationId: z.string().min(2).max(50),
    contributionAmt: z.coerce.number().positive().max(10_000_000),
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).default('MONTHLY'),
    startDate: z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Invalid date' }),
    adminName: z.string().min(2).max(100),
    adminPhone: z.string().length(10).regex(/^\d+$/),
});

// Create a new Ikimina group (Admin initial setup — public route used by the signup flow)
router.post('/register', async (req, res) => {
    const parsed = registerGroupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }
    const { groupName, registrationId, contributionAmt, frequency, startDate, adminName, adminPhone } = parsed.data;

    try {
        // Check for duplicate registration ID
        const existing = await prisma.group.findUnique({ where: { registrationId } });
        if (existing) {
            return res.status(409).json({ error: 'A group with this registration ID already exists' });
        }

        const result = await prisma.$transaction(async (tx: any) => {
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    registrationId,
                    contributionAmt: contributionAmt,
                    frequency,
                    startDate: new Date(startDate),
                    penaltyRules: JSON.stringify({ lateFee: 500, gracePeriodDays: 2 })
                }
            });

            const hashedPassword = await bcrypt.hash('Pass@123', 10);
            const admin = await tx.user.create({
                data: {
                    name: adminName,
                    phone: adminPhone,
                    role: ROLES.ADMIN,
                    groupId: group.id,
                    password: hashedPassword
                }
            });

            return { group, admin };
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Registration failed' });
    }
});

// Add a new member to an existing group (Admin only)
router.post('/add-member', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const parsed = addMemberSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, phone, role, nationalId, email } = parsed.data;
    const groupId = req.user?.groupId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const groupExists = await prisma.group.findUnique({ where: { id: groupId } });
        if (!groupExists) {
            return res.status(401).json({ error: 'Your session is no longer valid. Please sign out and register again.' });
        }

        // Generate a random temporary password instead of hardcoded 'Pass@123'
        const tempPassword = generateTempPassword();
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Tier check: Enforce member limits
        const currentMemberCount = await prisma.user.count({ where: { groupId, isActive: true } });
        if (currentMemberCount >= groupExists.maxMembers) {
            return res.status(403).json({
                error: `Member limit reached for ${groupExists.tier} plan`,
                details: `Your current plan allows a maximum of ${groupExists.maxMembers} members.`
            });
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                phone,
                email: email === '' ? null : (email || null),
                nationalId: nationalId === '' ? null : (nationalId || null),
                password: hashedPassword,
                role: role || ROLES.MEMBER,
                groupId,
                mustChangePassword: true
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'MEMBER_ADDED',
                details: JSON.stringify({ memberId: newUser.id, name: newUser.name, role: newUser.role }),
                userId: req.user?.userId,
                groupId
            }
        });

        res.status(201).json({
            message: 'Member added successfully',
            user: { id: newUser.id, name: newUser.name, phone: newUser.phone, role: newUser.role },
            temporaryPassword: tempPassword
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target || '';
            if (field.includes('phone')) return res.status(400).json({ error: 'Phone number already exists' });
            if (field.includes('nationalId')) return res.status(400).json({ error: 'National ID already exists' });
            if (field.includes('email')) return res.status(400).json({ error: 'Email already exists' });
            return res.status(400).json({ error: 'User with this detail already exists' });
        }
        console.error('[GROUP] Add member error:', error.message);
        res.status(500).json({ error: 'Failed to add member' });
    }
});

// Deactivate a member (Admin only)
router.patch('/deactivate-member/:userId', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const targetUserId = req.params.userId as string;
    const groupId = req.user?.groupId;
    const adminId = req.user?.userId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    if (targetUserId === adminId) {
        return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    try {
        const member = await prisma.user.findFirst({
            where: { id: targetUserId, groupId }
        });

        if (!member) return res.status(404).json({ error: 'Member not found in your group' });

        await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: false }
        });

        await prisma.auditLog.create({
            data: {
                action: 'MEMBER_DEACTIVATED',
                details: JSON.stringify({ memberId: targetUserId, memberName: member.name }),
                userId: adminId,
                groupId
            }
        });

        res.json({ message: `${member.name} has been deactivated` });
    } catch (error: any) {
        console.error('[GROUP] Deactivation error:', error.message);
        res.status(500).json({ error: 'Failed to deactivate member' });
    }
});

// Reactivate a member (Admin only)
router.patch('/reactivate-member/:userId', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const targetUserId = req.params.userId as string;
    const groupId = req.user?.groupId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const member = await prisma.user.findFirst({
            where: { id: targetUserId, groupId }
        });

        if (!member) return res.status(404).json({ error: 'Member not found in your group' });

        await prisma.user.update({
            where: { id: targetUserId },
            data: { isActive: true }
        });

        res.json({ message: `${member.name} has been reactivated` });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to reactivate member' });
    }
});

// Get group statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const [totalSavings, totalSocial, memberCount, activeLoans, totalPayouts, totalPenalties, totalRepayments, totalDisbursedLoans, groupInfo, activeLoansAmountAgg, trustScore] = await Promise.all([
            prisma.contribution.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'PAID', fundType: 'SAVINGS' }
            }),
            prisma.contribution.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'PAID', fundType: 'SOCIAL' }
            }),
            prisma.user.count({ where: { groupId, isActive: true } }),
            prisma.loan.count({ where: { groupId, status: 'ACTIVE' } }),
            prisma.payout.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'APPROVED', fundType: 'SAVINGS' }
            }),
            prisma.penalty.aggregate({
                _sum: { amount: true },
                where: { user: { groupId }, status: 'PAID' }
            }),
            prisma.repayment.aggregate({
                _sum: { amount: true },
                where: { loan: { groupId } }
            }),
            prisma.loan.aggregate({
                _sum: { amount: true },
                where: { groupId, status: { in: ['ACTIVE', 'REPAID', 'OVERDUE'] } }
            }),
            prisma.group.findUnique({
                where: { id: groupId },
                select: { name: true, savingsGoal: true, contributionAmt: true, frequency: true, penaltyRules: true }
            }),
            prisma.loan.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'ACTIVE' }
            }),
            calculateTrustScore(groupId)
        ]);

        const savingsSum = totalSavings._sum.amount || 0;
        const socialSum = totalSocial._sum.amount || 0;
        const payoutSum = totalPayouts._sum.amount || 0;
        const penaltySum = totalPenalties._sum.amount || 0;
        const repaymentSum = totalRepayments._sum.amount || 0;
        const activeLoanAmount = activeLoansAmountAgg._sum.amount || 0;

        res.json({
            groupName: groupInfo?.name || 'N/A',
            totalSavings: savingsSum,
            totalSocial: socialSum,
            availableFunds: (savingsSum + penaltySum + repaymentSum) - payoutSum,
            savingsGoal: groupInfo?.savingsGoal || 5000000,
            memberCount,
            activeLoans,
            activeLoanAmount,
            trustScore,
            contributionAmt: groupInfo?.contributionAmt,
            frequency: groupInfo?.frequency,
            penaltyRules: groupInfo?.penaltyRules,
        });
    } catch (error: any) {
        console.error('[GROUP] Stats error:', error.message);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Update group goal
router.patch('/goal', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    const goalValue = parseFloat(req.body.goal);
    if (isNaN(goalValue) || goalValue <= 0) {
        return res.status(400).json({ error: 'Goal must be a positive number' });
    }

    try {
        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: { savingsGoal: goalValue }
        });
        res.json({ message: 'Savings goal updated successfully', goal: updatedGroup.savingsGoal });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update savings goal' });
    }
});

// Get members list
router.get('/members', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const members = await prisma.user.findMany({
            where: { groupId },
            select: {
                id: true,
                name: true,
                phone: true,
                role: true,
                nationalId: true,
                agreedToRules: true,
                agreementUrl: true,
                agreedAt: true,
                isActive: true,
                mustChangePassword: true
            }
        });
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Sign digital agreement
router.post('/sign-agreement', authenticate, async (req: AuthRequest, res: any) => {
    const userId = req.user?.userId;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                agreedToRules: true,
                agreedAt: new Date()
            },
            select: { id: true, agreedToRules: true, agreedAt: true, agreementUrl: true }
        });
        res.json({ message: 'Agreement signed successfully', user: updatedUser });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to sign agreement' });
    }
});

// ─── Group Settings (Admin only) ─────────────────────────────────────
const groupSettingsSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    contributionAmt: z.coerce.number().positive().max(10_000_000).optional(),
    frequency: z.enum(['WEEKLY', 'BIWEEKLY', 'MONTHLY']).optional(),
    penaltyLateFee: z.coerce.number().min(0).max(1_000_000).optional(),
    penaltyGraceDays: z.coerce.number().int().min(0).max(30).optional(),
});

router.patch('/settings', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    const parsed = groupSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { name, contributionAmt, frequency, penaltyLateFee, penaltyGraceDays } = parsed.data;

    try {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        // Build penaltyRules JSON if either penalty field is provided
        let penaltyRules = group.penaltyRules ? JSON.parse(group.penaltyRules as string) : { lateFee: 500, gracePeriodDays: 2 };
        if (penaltyLateFee !== undefined) penaltyRules.lateFee = penaltyLateFee;
        if (penaltyGraceDays !== undefined) penaltyRules.gracePeriodDays = penaltyGraceDays;

        const updated = await prisma.group.update({
            where: { id: groupId },
            data: {
                ...(name && { name }),
                ...(contributionAmt && { contributionAmt }),
                ...(frequency && { frequency }),
                penaltyRules: JSON.stringify(penaltyRules),
            },
        });

        await prisma.auditLog.create({
            data: {
                action: 'GROUP_SETTINGS_UPDATED',
                details: JSON.stringify({ name, contributionAmt, frequency, penaltyLateFee, penaltyGraceDays }),
                userId: req.user?.userId,
                groupId,
            }
        });

        res.json({ message: 'Group settings updated', group: updated });
    } catch (error: any) {
        console.error('[GROUP] Settings update error:', error.message);
        res.status(500).json({ error: 'Failed to update group settings' });
    }
});

// ─── Toggle Member Active/Suspended (ADMIN only) ─────────────────────
router.patch('/members/:id/toggle-active', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const targetId = req.params.id as string;
    const { userId: adminId, groupId } = req.user!;

    if (targetId === adminId) {
        return res.status(400).json({ error: 'You cannot deactivate your own account' });
    }

    try {
        const member = await prisma.user.findUnique({ where: { id: targetId } });
        if (!member || member.groupId !== groupId) {
            return res.status(404).json({ error: 'Member not found in your group' });
        }

        const updated = await prisma.user.update({
            where: { id: targetId },
            data: { isActive: !member.isActive },
            select: { id: true, name: true, isActive: true }
        });

        await prisma.auditLog.create({
            data: {
                action: updated.isActive ? 'MEMBER_REACTIVATED' : 'MEMBER_SUSPENDED',
                details: JSON.stringify({ memberId: targetId, name: member.name }),
                userId: adminId as string,
                groupId: groupId as string
            }
        });

        res.json({
            message: `${member.name} has been ${updated.isActive ? 'reactivated' : 'suspended'}`,
            member: updated
        });
    } catch (error: any) {
        console.error('[GROUP] Toggle active error:', error.message);
        res.status(500).json({ error: 'Failed to update member status' });
    }
});

export default router;
