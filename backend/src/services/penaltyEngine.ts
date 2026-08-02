import { prisma } from '../index';

export const applyPenalties = async (groupId: string) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { members: true }
    });

    if (!group) return;

    let rules;
    try {
        rules = group.penaltyRules ? JSON.parse(group.penaltyRules) : {};
    } catch (e) {
        console.error(`[Penalty System] Invalid penalty rules for group ${group.name}`);
        rules = {};
    }
    
    const lateFee = rules.lateFee || 500;

    // Determine the lookback period based on frequency
    const lookbackDate = new Date();
    if (group.frequency.toLowerCase() === 'monthly') {
        lookbackDate.setMonth(lookbackDate.getMonth() - 1);
    } else {
        // Default to Weekly
        lookbackDate.setDate(lookbackDate.getDate() - 7);
    }

    console.log(`[Penalty System] Checking group ${group.name} (${group.frequency}) since ${lookbackDate.toISOString()}`);

    for (const member of group.members) {
        // Only MEMBER and TREASURER roles can be penalized — skip ADMIN and AUDITOR
        if (member.role === 'ADMIN' || member.role === 'AUDITOR' || member.role === 'TREASURER') continue;

        const reason = `Missed ${group.frequency} Contribution`;

        // Check if a contribution exists for this period
        const contribution = await prisma.contribution.findFirst({
            where: {
                userId: member.id,
                groupId: group.id,
                status: 'PAID',
                timestamp: { gte: lookbackDate }
            }
        });

        if (!contribution) {
            // Check IF a penalty for this reason was ALREADY applied in this cycle
            const existingPenalty = await prisma.penalty.findFirst({
                where: {
                    userId: member.id,
                    groupId: group.id,
                    reason: reason,
                    timestamp: { gte: lookbackDate }
                }
            });

            if (existingPenalty) {
                console.log(`[Penalty System] Skipping: Penalty already exists for ${member.name} (${reason})`);
                continue;
            }

            // Apply penalty
            await prisma.penalty.create({
                data: {
                    amount: lateFee,
                    reason: reason,
                    status: 'UNPAID',
                    userId: member.id,
                    groupId: group.id
                }
            });

            // Audit Log
            await prisma.auditLog.create({
                data: {
                    action: 'PENALTY_APPLIED',
                    details: JSON.stringify({
                        userId: member.id,
                        memberName: member.name,
                        amount: lateFee,
                        frequency: group.frequency
                    }),
                    groupId: group.id
                }
            });

            console.log(`[Penalty System] Applied ${lateFee} penalty to ${member.name} for missed ${group.frequency} payment`);
        }
    }
};
