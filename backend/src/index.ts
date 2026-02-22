import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '../prisma/client';
import authRoutes from './routes/auth';
import groupRoutes from './routes/group';
import contributionRoutes from './routes/contribution';
import loanRoutes from './routes/loan';
import penaltyRoutes from './routes/penalty';
import payoutRoutes from './routes/payout';
import auditRoutes from './routes/audit';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5001;

// Allow local frontend and production frontend
const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/penalties', penaltyRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/audit', auditRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'BikaSafe API is running' });
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

export { prisma };
