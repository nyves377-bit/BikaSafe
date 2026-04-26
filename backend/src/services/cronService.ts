import cron from 'node-cron';
import { prisma } from '../index';
import { SMSService } from './smsService';
import { applyPenalties } from './penaltyEngine';

export const startCronJobs = () => {
    // 1. Penalty Engine - Run every day at Midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily penalty checks...');
        try {
            const groups = await prisma.group.findMany({
                select: { id: true, name: true }
            });

            for (const group of groups) {
                await applyPenalties(group.id);
            }
            console.log(`[CRON] Penalty check completed for ${groups.length} groups.`);
        } catch (error) {
            console.error('[CRON] Error during penalty checks:', error);
        }
    });

    // 2. Reminders - Run every day at 08:00 AM
    cron.schedule('0 8 * * *', async () => {
        console.log('[CRON] Running daily morning routines...');

        try {
            // 1. Scan for unmet deadlines and alert (Upcoming Loans)
            const upcomingBound = new Date();
            upcomingBound.setDate(upcomingBound.getDate() + 3);

            const upcomingLoans = await prisma.loan.findMany({
                where: {
                    status: 'ACTIVE',
                    deadline: {
                        lte: upcomingBound,
                        gte: new Date()
                    }
                },
                include: { user: true, group: true }
            });

            for (const loan of upcomingLoans) {
                if (loan.user.phone) {
                    const msg = `BikaSafe Reminder: Your loan of RWF ${loan.amount} for group ${loan.group.name} is due by ${loan.deadline.toLocaleDateString()}. Please prepare your repayment.`;
                    // Mock SMS sending
                    SMSService.sendSMS(loan.user.phone, msg);
                }
            }

            // 2. Scan for unpaid penalties
            const unpaidPenalties = await prisma.penalty.findMany({
                where: { status: 'UNPAID' },
                include: { user: true, group: true }
            });

            for (const penalty of unpaidPenalties) {
                if (penalty.user.phone) {
                    const msg = `BikaSafe Alert: You have an unpaid penalty of RWF ${penalty.amount} in ${penalty.group.name}. Reason: ${penalty.reason}. Please clear it with the Treasurer.`;
                    SMSService.sendSMS(penalty.user.phone, msg);
                }
            }

            console.log(`[CRON] Processed ${upcomingLoans.length} loan reminders & ${unpaidPenalties.length} penalty alerts.`);
        } catch (error) {
            console.error('[CRON] Error running routines:', error);
        }
    });

    console.log('[CRON] Background Services Started: Penalty Engine (00:00) & Reminders (08:00).');
};
