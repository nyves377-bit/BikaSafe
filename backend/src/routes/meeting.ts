import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod/v4';

const router = Router();

const meetingSchema = z.object({
    date: z.string().transform((str) => new Date(str)),
    title: z.string().min(2, 'Title must be at least 2 characters'),
    attendances: z.array(z.object({
        userId: z.string(),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE'])
    }))
});

router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        const meetings = await prisma.meeting.findMany({
            where: { groupId: user.groupId },
            include: {
                attendances: {
                    include: { user: { select: { id: true, name: true, phone: true } } }
                }
            },
            orderBy: { date: 'desc' },
        });
        res.json(meetings);
    } catch (err) {
        console.error('GET /meetings error:', err);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can log meetings' });
        }

        const parsed = meetingSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const { date, title, attendances } = parsed.data;

        // Create the meeting and attendances
        const meeting = await prisma.meeting.create({
            data: {
                date,
                title,
                groupId: user.groupId,
                attendances: {
                    create: attendances.map(a => ({
                        userId: a.userId,
                        status: a.status,
                        groupId: user.groupId
                    }))
                }
            },
            include: { attendances: true }
        });

        // Automatically create UNPAID penalties for ABSENT attendees
        const absentees = attendances.filter(a => a.status === 'ABSENT');
        if (absentees.length > 0) {
            await prisma.penalty.createMany({
                data: absentees.map(a => ({
                    amount: 500, // Standard absent penalty
                    reason: `Missed Meeting: ${title}`,
                    status: 'UNPAID',
                    userId: a.userId,
                    groupId: user.groupId,
                }))
            });
        }

        await prisma.auditLog.create({
            data: {
                action: 'MEETING_LOGGED',
                details: JSON.stringify({ title, date, attendees: attendances.length }),
                userId: user.userId,
                groupId: user.groupId,
            },
        });

        res.status(201).json(meeting);
    } catch (err) {
        console.error('POST /meetings error:', err);
        res.status(500).json({ error: 'Failed to create meeting' });
    }
});

export default router;
