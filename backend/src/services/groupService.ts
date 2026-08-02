import { prisma } from '../index';

export class GroupService {
    /**
     * Calculates the current liquidity (Treasury Balance) of a group.
     * Balance = Sum(Paid Contributions) + Sum(Paid Penalties)
     *         - Sum(Approved Payouts) - Sum(Active/Disbursed Loans)
     */
    static async getGroupBalance(groupId: string): Promise<number> {
        const [contributions, paidPenalties, payouts, activeLoans] = await Promise.all([
            prisma.contribution.aggregate({
                where: { groupId, status: 'PAID' },
                _sum: { amount: true }
            }),
            // Penalties that were actually paid in cash are income
            prisma.penalty.aggregate({
                where: { groupId, status: 'PAID' },
                _sum: { amount: true }
            }),
            // Approved payouts = money that left the treasury
            prisma.payout.aggregate({
                where: { groupId, status: 'APPROVED' },
                _sum: { amount: true }
            }),
            // Active loans = disbursed capital not yet repaid
            prisma.loan.findMany({
                where: { groupId, status: 'ACTIVE' },
                include: { repayments: { select: { amount: true } } }
            })
        ]);

        const totalIn = (contributions._sum.amount || 0) + (paidPenalties._sum.amount || 0);
        const totalPayouts = payouts._sum.amount || 0;
        // Net loan exposure = disbursed - already repaid
        const netLoanExposure = activeLoans.reduce((sum, loan) => {
            const repaid = loan.repayments.reduce((s, r) => s + Number(r.amount), 0);
            return sum + Math.max(0, Number(loan.amount) - repaid);
        }, 0);

        return totalIn - totalPayouts - netLoanExposure;
    }
}
