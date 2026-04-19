import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod/v4';

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────
const announcementSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters').max(200, 'Title too long'),
    body: z.string().min(5, 'Body must be at least 5 characters').max(2000, 'Body too long'),
    type: z.enum(['GENERAL', 'MEETING', 'URGENT', 'REMINDER']).optional().default('GENERAL'),
    eventDate: z.string().optional(),
});

// GET /api/announcements — All group members can view
router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        const announcements = await prisma.announcement.findMany({
            where: { groupId: user.groupId },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(announcements);
    } catch (err) {
        console.error('GET /announcements error:', err);
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// POST /api/announcements — ADMIN only
router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can post announcements' });
        }

        const parsed = announcementSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const { title, body, type, eventDate } = parsed.data;

        const announcement = await prisma.announcement.create({
            data: {
                title,
                body,
                type,
                eventDate: eventDate ? new Date(eventDate) : null,
                groupId: user.groupId,
                createdBy: user.userId,
            },
            include: {
                author: { select: { id: true, name: true, role: true } },
            },
        });

        await prisma.auditLog.create({
            data: {
                action: 'ANNOUNCEMENT_CREATED',
                details: JSON.stringify({ title, type }),
                userId: user.userId,
                groupId: user.groupId,
            },
        });

        res.status(201).json(announcement);
    } catch (err) {
        console.error('POST /announcements error:', err);
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// DELETE /api/announcements/:id — ADMIN only
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can delete announcements' });
        }

        const announcementId = req.params.id as string;

        const announcement = await prisma.announcement.findFirst({
            where: { id: announcementId, groupId: user.groupId },
        });

        if (!announcement) {
            return res.status(404).json({ error: 'Announcement not found' });
        }

        await prisma.announcement.delete({ where: { id: announcementId } });

        await prisma.auditLog.create({
            data: {
                action: 'ANNOUNCEMENT_DELETED',
                details: JSON.stringify({ title: announcement.title }),
                userId: user.userId,
                groupId: user.groupId,
            },
        });

        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /announcements/:id error:', err);
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

export default router;
