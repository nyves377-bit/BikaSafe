import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '../prisma/client';
import authRoutes from './routes/auth';
import groupRoutes from './routes/group';
import contributionRoutes from './routes/contribution';
import loanRoutes from './routes/loan';
import penaltyRoutes from './routes/penalty';
import payoutRoutes from './routes/payout';
import auditRoutes from './routes/audit';
import reportRoutes from './routes/report';
import uploadRoutes from './routes/upload';
import ussdRoutes from './routes/ussd';
import announcementRoutes from './routes/announcement';
import meetingRoutes from './routes/meeting';
import pollRoutes from './routes/poll';
import path from 'path';
import { startCronJobs } from './services/cronService';

const app = express();
export const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// ─── CORS Configuration ─────────────────────────────────────────────
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    process.env.FRONTEND_URL
].filter(Boolean) as string[];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Rate Limiting ───────────────────────────────────────────────────
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 attempts per window
    message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: { error: 'Too many requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limit to all routes
app.use('/api/', generalLimiter);

// Apply stricter rate limit to auth routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/auth/demo-login', authLimiter);

// ─── Routes ──────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ussd', ussdRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/polls', pollRoutes);

// ─── Health Check ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Global Error Handler ────────────────────────────────────────────
// Catches unhandled errors and prevents stack trace leaks
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[GLOBAL ERROR]', err.message);

    // Multer file size errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
    }

    // CORS errors
    if (err.message?.includes('CORS')) {
        return res.status(403).json({ error: 'Cross-origin request blocked' });
    }

    // Default error response — no stack trace
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'An internal error occurred'
            : err.message || 'An internal error occurred'
    });
});

// ─── Startup ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    startCronJobs();
    if (process.env.NODE_ENV !== 'production') {
        console.log(`[DEV] Demo login available at POST /api/auth/demo-login`);
    }
});
