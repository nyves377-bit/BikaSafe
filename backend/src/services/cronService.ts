import cron from 'node-cron';
import { prisma } from '../index';
import { SMSService } from './smsService';
import { applyPenalties } from './penaltyEngine';
import { sendPenaltyEmail, sendLoanReminderEmail } from './emailService';

export const startCronJobs = () => {
    // 1. Penalty Engine - Run every day at Midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('[CRON] Running daily penalty checks...');
        try {
            const groups = await prisma.group.findMany({
                select: { id: true, name: true }
            });

            for (const group of groups) {
                // Apply penalties and get back the new ones created
                const before = await prisma.penalty.count({ where: { groupId: group.id } });
                await applyPenalties(group.id);
                const after = await prisma.penalty.count({ where: { groupId: group.id } });

                // If new penalties were created, email the affected users
                if (after > before) {
                    const newPenalties = await prisma.penalty.findMany({
                        where: { groupId: group.id, status: 'UNPAID' },
                        include: { user: true, group: true },
                        orderBy: { timestamp: 'desc' },
                        take: after - before
                    });

                    for (const penalty of newPenalties) {
                        // Email
                        if (penalty.user.email) {
                            sendPenaltyEmail(
                                penalty.user.email,
                                penalty.user.name,
                                penalty.group.name,
                                Number(penalty.amount),
                                penalty.reason
                            ).catch(() => {});
                        }
                        // SMS
                        if (penalty.user.phone) {
                            SMSService.sendSMS(
                                penalty.user.phone,
                                `BikaSafe Alert: A penalty of RWF ${penalty.amount} has been applied in ${penalty.group.name}. Reason: ${penalty.reason}.`
                            );
                        }
                    }
                }
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
            // 1. Scan for loans due within 3 days
            const upcomingBound = new Date();
            upcomingBound.setDate(upcomingBound.getDate() + 3);

            const upcomingLoans = await prisma.loan.findMany({
                where: {
                    status: 'ACTIVE',
                    deadline: { lte: upcomingBound, gte: new Date() }
                },
                include: { user: true, group: true }
            });

            for (const loan of upcomingLoans) {
                // Email reminder
                if (loan.user.email) {
                    sendLoanReminderEmail(
                        loan.user.email!,
                        loan.user.name,
                        loan.group.name,
                        Number(loan.amount),
                        loan.deadline,
                        loan.refNo ?? 'N/A'
                    ).catch(() => {});
                }
                // SMS reminder
                if (loan.user.phone) {
                    SMSService.sendSMS(
                        loan.user.phone,
                        `BikaSafe Reminder: Your loan of RWF ${loan.amount} for ${loan.group.name} is due by ${loan.deadline.toLocaleDateString()}. Please prepare your repayment.`
                    );
                }
            }

            // 2. Scan for unpaid penalties (SMS only — email was sent when penalty was created)
            const unpaidPenalties = await prisma.penalty.findMany({
                where: { status: 'UNPAID' },
                include: { user: true, group: true }
            });

            for (const penalty of unpaidPenalties) {
                if (penalty.user.phone) {
                    SMSService.sendSMS(
                        penalty.user.phone,
                        `BikaSafe Alert: You have an unpaid penalty of RWF ${penalty.amount} in ${penalty.group.name}. Reason: ${penalty.reason}. Please clear it with your Treasurer.`
                    );
                }
            }

            console.log(`[CRON] Processed ${upcomingLoans.length} loan reminders & ${unpaidPenalties.length} penalty alerts.`);
        } catch (error) {
            console.error('[CRON] Error running routines:', error);
        }
    });

    console.log('[CRON] Background Services Started: Penalty Engine (00:00) & Reminders (08:00).');
};
