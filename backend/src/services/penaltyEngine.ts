import { prisma } from '../index';

export const applyPenalties = async (groupId: string) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { members: true }
    });

    if (!group) return;

    const rules = JSON.parse(group.penaltyRules);
    const lateFee = rules.lateFee || 500;
    const gracePeriodDays = rules.gracePeriodDays || 2;

    // Logic: Check members who haven't paid for this cycle
    // (Simplified for demo: find members with no contribution in the last 7 days)
    const aWeekAgo = new Date();
    aWeekAgo.setDate(aWeekAgo.getDate() - 7);

    for (const member of group.members) {
        const contribution = await prisma.contribution.findFirst({
            where: {
                userId: member.id,
                groupId: group.id,
                timestamp: { gte: aWeekAgo }
            }
        });

        if (!contribution) {
            // Apply penalty
            await prisma.penalty.create({
                data: {
                    amount: lateFee,
                    reason: 'Missed Weekly Contribution',
                    status: 'UNPAID',
                    userId: member.id,
                }
            });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    action: 'PENALTY_APPLIED',
                    details: JSON.stringify({ userId: member.id, amount: lateFee }),
                    groupId: group.id
                }
            });

            console.log(`[Penalty System] Applied ${lateFee} penalty to ${member.name}`);
        }
    }
};
