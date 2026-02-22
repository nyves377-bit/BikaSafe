import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, authorize, ROLES, AuthRequest } from '../middleware/auth';
import bcrypt from 'bcryptjs';

const router = Router();

// Create a new Ikimina group (Admin initial setup)
router.post('/register', async (req, res) => {
    const { groupName, registrationId, contributionAmt, frequency, startDate, adminName, adminPhone } = req.body;

    try {
        const result = await prisma.$transaction(async (tx: any) => {
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    registrationId,
                    contributionAmt: parseFloat(contributionAmt),
                    frequency,
                    startDate: new Date(startDate),
                    penaltyRules: JSON.stringify({ lateFee: 500, gracePeriodDays: 2 }) // Default rules
                }
            });

            const admin = await tx.user.create({
                data: {
                    name: adminName,
                    phone: adminPhone,
                    role: ROLES.ADMIN,
                    groupId: group.id,
                    password: 'defaultPassword123!' // Placeholder for group registration flow
                }
            });

            return { group, admin };
        });

        res.status(201).json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

// Add a new member to an existing group (Admin only)
router.post('/add-member', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const { name, phone, role, nationalId } = req.body;
    const groupId = req.user?.groupId;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });
    if (!name || !phone) return res.status(400).json({ error: 'Name and Phone are required' });
    if (nationalId && nationalId.length !== 16) {
        return res.status(400).json({ error: 'National ID must be exactly 16 digits' });
    }

    try {
        // Verify group exists (prevents foreign key fails on orphaned sessions)
        const groupExists = await prisma.group.findUnique({ where: { id: groupId } });
        if (!groupExists) {
            return res.status(401).json({ error: 'Your session is no longer valid (group reset). Please sign out and register again.' });
        }

        const hashedPassword = await bcrypt.hash('Pass@123', 10); // Default password for new members

        const newUser = await prisma.user.create({
            data: {
                name,
                phone,
                nationalId: nationalId === '' ? null : nationalId,
                password: hashedPassword,
                role: role || ROLES.MEMBER,
                groupId
            }
        });

        res.status(201).json({
            message: 'Member added successfully',
            user: { id: newUser.id, name: newUser.name, phone: newUser.phone, role: newUser.role }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            const field = error.meta?.target || '';
            if (field.includes('phone')) return res.status(400).json({ error: 'Phone number already exists' });
            if (field.includes('nationalId')) return res.status(400).json({ error: 'National ID already exists' });
            return res.status(400).json({ error: 'User with this detail already exists' });
        }
        console.error('Add member error:', error);
        res.status(500).json({ error: 'Failed to add member', details: error.message });
    }
});

// Get group statistics (savings, members, etc.)
router.get('/stats', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const [totalSavings, memberCount, activeLoans, totalPayouts, totalPenalties, totalRepayments, totalDisbursedLoans, groupInfo] = await Promise.all([
            prisma.contribution.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'PAID' }
            }),
            prisma.user.count({ where: { groupId } }),
            prisma.loan.count({ where: { groupId, status: 'ACTIVE' } }),
            prisma.payout.aggregate({
                _sum: { amount: true },
                where: { groupId, status: 'APPROVED' }
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
                select: { savingsGoal: true }
            })
        ]);

        const savingsSum = totalSavings._sum.amount || 0;
        const payoutSum = totalPayouts._sum.amount || 0;
        const penaltySum = totalPenalties._sum.amount || 0;
        const repaymentSum = totalRepayments._sum.amount || 0;
        const disbursedLoanSum = totalDisbursedLoans._sum.amount || 0;

        res.json({
            totalSavings: savingsSum,
            availableFunds: (savingsSum + penaltySum + repaymentSum) - (payoutSum + disbursedLoanSum),
            savingsGoal: groupInfo?.savingsGoal || 5000000,
            memberCount,
            activeLoans,
            trustScore: 98.5
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Update group savings goal (Admin only)
router.patch('/goal', authenticate, authorize([ROLES.ADMIN]), async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    const { goal } = req.body;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });
    if (!goal || isNaN(goal)) return res.status(400).json({ error: 'Valid goal amount is required' });

    try {
        const updatedGroup = await prisma.group.update({
            where: { id: groupId },
            data: { savingsGoal: parseFloat(goal) }
        });

        res.json({ message: 'Savings goal updated successfully', goal: updatedGroup.savingsGoal });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update savings goal' });
    }
});

// Get member list for the group
router.get('/members', authenticate, async (req: AuthRequest, res: any) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const members = await prisma.user.findMany({
            where: { groupId: groupId as string },
            select: { id: true, name: true, phone: true, role: true, nationalId: true }
        });
        res.json(members);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

// Sign digital agreement
router.post('/sign-agreement', authenticate, async (req: AuthRequest, res: any) => {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    try {
        const updatedUser = await prisma.user.update({
            where: { id: userId as string },
            data: {
                agreedToRules: true,
                agreedAt: new Date()
            },
            select: { id: true, agreedToRules: true, agreedAt: true }
        });

        res.json({ message: 'Agreement signed successfully', user: updatedUser });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to sign agreement' });
    }
});

export default router;
