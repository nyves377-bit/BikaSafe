import { Router, Request, Response } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { z } from 'zod/v4';

const router = Router();

const pollSchema = z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(2, 'Description required'),
});

const voteSchema = z.object({
    choice: z.enum(['YES', 'NO'])
});

router.get('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        const polls = await prisma.poll.findMany({
            where: { groupId: user.groupId },
            include: {
                voices: {
                    select: { userId: true, choice: true }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(polls);
    } catch (err) {
        console.error('GET /polls error:', err);
        res.status(500).json({ error: 'Failed to fetch polls' });
    }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        if (user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Only admins can create polls' });
        }

        const parsed = pollSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        const poll = await prisma.poll.create({
            data: {
                ...parsed.data,
                groupId: user.groupId,
            },
            include: { voices: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'POLL_CREATED',
                details: JSON.stringify({ title: poll.title }),
                userId: user.userId,
                groupId: user.groupId,
            },
        });

        res.status(201).json(poll);
    } catch (err) {
        console.error('POST /polls error:', err);
        res.status(500).json({ error: 'Failed to create poll' });
    }
});

router.post('/:id/vote', authenticate, async (req: Request, res: Response) => {
    try {
        const user = (req as AuthRequest).user!;
        const pollId = req.params.id;

        const poll = await prisma.poll.findUnique({ where: { id: pollId as string } });
        if (!poll || poll.groupId !== user.groupId) {
            return res.status(404).json({ error: 'Poll not found' });
        }
        if (poll.status !== 'OPEN') {
            return res.status(400).json({ error: 'Poll is closed' });
        }

        const parsed = voteSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: parsed.error.issues[0].message });
        }

        // Upsert vote
        const existingVote = await prisma.vote.findUnique({
            where: { pollId_userId: { pollId: pollId as string, userId: user.userId } }
        });

        if (existingVote) {
             await prisma.vote.update({
                 where: { id: existingVote.id },
                 data: { choice: parsed.data.choice }
             });
        } else {
             await prisma.vote.create({
                 data: {
                     pollId: pollId as string,
                     userId: user.userId,
                     choice: parsed.data.choice
                 }
             });
        }

        res.json({ success: true });
    } catch (err) {
        console.error('POST /polls/:id/vote error:', err);
        res.status(500).json({ error: 'Failed to vote' });
    }
});

export default router;
