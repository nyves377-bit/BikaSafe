import { Router } from 'express';
import { prisma } from '../index';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';

// STEP 0: DEMO LOGIN (One-click bypass)
router.post('/demo-login', async (req, res) => {
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
                groupName: user.group.name
            }
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Demo login failed', details: error.message });
    }
});

// STEP 1: LOGIN (Phone + Password) -> Request OTP
router.post('/login/otp-request', async (req, res) => {
    const { phone, password } = req.body;

    if (!phone || !password) {
        return res.status(400).json({ error: 'Phone number and password are required' });
    }

    if (phone.length !== 10) {
        return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { phone }
        });

        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        // Verify password again
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Store OTP in database
        await prisma.verificationCode.create({
            data: {
                phone,
                code: otp,
                expiresAt
            }
        });

        // Simulate sending OTP (Placeholder for Africa's Talking)
        console.log(`\n--- [OTP SENT TO ${phone}] ---`);
        console.log(`CODE: ${otp}`);
        console.log(`EXPIRY: ${expiresAt.toLocaleTimeString()}`);
        console.log(`--------------------------------\n`);

        res.json({ message: 'Identity verified. OTP sent successfully.' });
    } catch (error: any) {
        res.status(500).json({ error: 'Authentication failed', details: error.message });
    }
});

// STEP 2: VERIFY OTP -> Issue Token
router.post('/login/verify', async (req, res) => {
    const { phone, password, otp } = req.body;

    if (!phone || !password || !otp) {
        return res.status(400).json({ error: 'Phone, password, and OTP are required' });
    }

    try {
        console.log(`[AUTH] Login attempt for phone: ${phone}`);

        // Check for Master OTP (123456) for easier testing
        const isMasterOtp = otp === '123456';

        let verification: any = null;
        if (!isMasterOtp) {
            // Find the latest valid OTP for this phone
            verification = await prisma.verificationCode.findFirst({
                where: {
                    phone,
                    code: otp,
                    expiresAt: { gt: new Date() }
                },
                orderBy: { createdAt: 'desc' }
            });

            if (!verification) {
                console.log(`[AUTH] Invalid or expired OTP for ${phone}`);
                return res.status(400).json({ error: 'Invalid or expired OTP code' });
            }
        } else {
            console.log(`[AUTH] Master OTP used for ${phone}`);
        }

        const user = await prisma.user.findUnique({
            where: { phone },
            include: { group: true }
        });

        if (!user) {
            console.log(`[AUTH] User not found during verification: ${phone}`);
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password again to prevent bypass
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            console.log(`[AUTH] Password mismatch during verification for ${phone}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role, groupId: user.groupId },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Delete utilized/expired codes for this phone to cleanup
        await prisma.verificationCode.deleteMany({
            where: { phone }
        });

        console.log(`[AUTH] Successful login for ${phone} (${user.role})`);

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                groupName: user.group.name
            }
        });
    } catch (error: any) {
        console.error(`[AUTH] Verification error for ${phone}:`, error.message);
        res.status(500).json({ error: 'Verification failed' });
    }
});

router.post('/register', async (req, res) => {
    const { phone, name, password, groupName, registrationId } = req.body;

    if (!phone || !name || !password || !groupName || !registrationId) {
        return res.status(400).json({ error: 'All fields (including password) are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Atomic operation: Create group and admin user together
        const result = await prisma.$transaction(async (tx) => {
            const group = await tx.group.create({
                data: {
                    name: groupName,
                    registrationId,
                    contributionAmt: 10000,
                    frequency: 'Weekly',
                    penaltyRules: JSON.stringify({ lateFee: 500, gracePeriodDays: 2 }),
                    startDate: new Date(),
                }
            });

            const user = await tx.user.create({
                data: {
                    phone,
                    name,
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
                groupName: result.group.name
            }
        });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Phone number or Group Registration ID already exists' });
        }
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
});

router.post('/change-password', authenticate, async (req: AuthRequest, res: any) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.userId;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
    }

    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) return res.status(401).json({ error: 'Incorrect current password' });

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword, lastPasswordChange: new Date() }
        });

        res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update password' });
    }
});

export default router;
