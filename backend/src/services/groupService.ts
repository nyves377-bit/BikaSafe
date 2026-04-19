import { prisma } from '../index';

export class GroupService {
    /**
     * Calculates the current liquidity (Treasury Balance) of a group.
     * Balance = Sum(Paid Contributions) - Sum(Approved/Paid Payouts)
     */
    static async getGroupBalance(groupId: string): Promise<number> {
        const [contributions, payouts] = await Promise.all([
            prisma.contribution.aggregate({
                where: {
                    groupId,
                    status: 'PAID'
                },
                _sum: { amount: true }
            }),
            prisma.payout.aggregate({
                where: {
                    groupId,
                    status: 'APPROVED',
                    // Note: If we had a DISBURSED status, we'd use that, 
                    // but APPROVED in this system implies it went through PaymentService.
                },
                _sum: { amount: true }
            })
        ]);

        const totalIn = contributions._sum.amount || 0;
        const totalOut = payouts._sum.amount || 0;

        return totalIn - totalOut;
    }
}
