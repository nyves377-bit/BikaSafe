import { Router } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest, JWT_SECRET } from '../middleware/auth';
import { z } from 'zod/v4';
import { sendWelcomeEmail } from '../services/emailService';
import { SMSService } from '../services/smsService';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const loginSchema = z.object({
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only digits'),
    password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d+$/, 'Phone must contain only digits'),
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    groupName: z.string().min(2, 'Group name is required').max(100),
    registrationId: z.string().min(1, 'Registration ID is required'),
    nationalId: z.string().optional(),
    email: z.string().email('Invalid email format').optional().or(z.literal('')),
    tier: z.enum(['FREE', 'ELITE', 'ENTERPRISE']).optional().default('FREE'),
});

const changePasswordSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// ─── SIMPLE PASSWORD LOGIN ───────────────────────────────────────────
router.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { phone, password } = parsed.data;

    try {
        const user = await prisma.user.findUnique({
            where: { phone },
            include: { group: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Check if user is deactivated
        if (!user.isActive) {
            return res.status(403).json({ error: 'This account has been deactivated. Contact your group admin.' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, groupId: user.groupId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                groupName: user.group.name,
                tier: user.group.tier,
                mustChangePassword: user.mustChangePassword
            }
        });
    } catch (error: any) {
        console.error('[AUTH] Login error:', error.message);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

// ─── DEMO LOGIN (Development Only) ──────────────────────────────────
router.post('/demo-login', async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not available' });
    }

    try {
        const demoPhone = '0788000000';
        let user = await prisma.user.findUnique({ where: { phone: demoPhone }, include: { group: true } });

        if (!user) {
            const hashedPassword = await bcrypt.hash('Demo@123', 10);
            const group = await prisma.group.create({
                data: {
                    name: 'Portfolio Demo Group',
                    registrationId: `DEMO-${Date.now()}`,
                    contributionAmt: 5000,
                    frequency: 'Weekly',
                    penaltyRules: JSON.stringify({ lateFee: 500, gracePeriodDays: 2 }),
                    startDate: new Date(),
                }
            });
            user = await prisma.user.create({
                data: {
                    phone: demoPhone,
                    name: 'Demo Admin',
                    password: hashedPassword,
                    role: 'ADMIN',
                    groupId: group.id
                },
                include: { group: true }
            });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, groupId: user.groupId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                groupName: user.group.name,
                tier: user.group.tier,
                mustChangePassword: false
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Demo login failed' });
    }
});

// ─── REGISTER ────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { phone, name, password, groupName, registrationId, nationalId, email, tier } = parsed.data;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    registrationId,
                    contributionAmt: 10000,
                    frequency: 'Weekly',
                    penaltyRules: JSON.stringify({ lateFee: 500, gracePeriodDays: 2 }),
                    startDate: new Date(),
                    tier: tier,
                    maxMembers: tier === 'ELITE' ? 1000 : 25
                }
            });

            const user = await tx.user.create({
                data: {
                    phone,
                    name,
                    email: email || null,
                    nationalId: nationalId || null,
                    password: hashedPassword,
                    role: 'ADMIN',
                    groupId: group.id,
                },
                include: { group: true }
            });

            return { user, group };
        });

        const token = jwt.sign(
            { userId: result.user.id, role: result.user.role, groupId: result.user.groupId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.user.id,
                name: result.user.name,
                role: result.user.role,
                groupName: result.group.name,
                tier: result.group.tier,
                mustChangePassword: false
            }
        });

        // Send welcome email and SMS (non-blocking)
        if (result.user.email) {
            sendWelcomeEmail(result.user.email, result.user.name, result.group.name).catch(() => {});
        }
        if (result.user.phone) {
            SMSService.sendSMS(result.user.phone, `Welcome to BikaSafe, ${result.user.name}! Your group "${result.group.name}" is now ready. Start saving together!`).catch(() => {});
        }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Phone number or Group Registration ID already exists' });
        }
        console.error('[AUTH] Registration error:', error.message);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// ─── CHANGE PASSWORD ─────────────────────────────────────────────────
router.post('/change-password', authenticate, async (req: AuthRequest, res: any) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.issues[0].message });
    }

    const { currentPassword, newPassword } = parsed.data;
    const userId = req.user?.userId;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ error: 'Incorrect current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedNewPassword,
                lastPasswordChange: new Date(),
                mustChangePassword: false
            }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('[AUTH] Password change error:', error.message);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

export default router;
