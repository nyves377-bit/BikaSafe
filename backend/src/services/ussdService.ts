import { prisma } from '../index';

interface USSDSession {
    step: 'MAIN' | 'STATUS' | 'BALANCE' | 'LOAN';
}

// Note: Sessions are in-memory. USSD sessions are short-lived (<180s) so
// this is acceptable — the session dies when the call ends anyway.
const sessions: Record<string, USSDSession> = {};

/**
 * USSD Logic Service for BikaSafe
 * CON = Continue session (show menu)
 * END = Terminate session (final message)
 */
export class USSDService {
    static async handleRequest(sessionId: string, phone: string, text: string): Promise<string> {
        const session = sessions[sessionId] ?? { step: 'MAIN' as const };
        sessions[sessionId] = session;

        const user = await prisma.user.findUnique({
            where: { phone },
            include: { group: { select: { name: true } } }
        });

        if (!user || !user.isActive) {
            delete sessions[sessionId];
            return 'END BikaSafe: Phone number not registered. Please contact your VSLA Treasurer.';
        }

        // `text` accumulates all inputs joined by `*`
        // The last segment is the user's most recent input
        const inputs = text.split('*');
        const lastInput = inputs[inputs.length - 1] ?? '';

        // First call has empty text → show main menu
        if (!text) {
            session.step = 'MAIN';
            return this.mainMenu(user.group?.name ?? 'your group');
        }

        switch (inputs.length === 1 ? lastInput : session.step) {
            case '1':
            case 'STATUS': {
                session.step = 'STATUS';
                const [penalties, loans] = await Promise.all([
                    prisma.penalty.count({ where: { userId: user.id, status: 'UNPAID' } }),
                    prisma.loan.count({ where: { userId: user.id, status: 'ACTIVE' } })
                ]);
                delete sessions[sessionId];
                return `END BikaSafe — My Status\nName: ${user.name}\nRole: ${user.role}\nUnpaid Fines: ${penalties}\nActive Loans: ${loans}`;
            }

            case '2':
            case 'BALANCE': {
                session.step = 'BALANCE';
                const funds = await prisma.contribution.aggregate({
                    where: { groupId: user.groupId as string, status: 'PAID' },
                    _sum: { amount: true }
                });
                delete sessions[sessionId];
                return `END BikaSafe — Group Balance\nGroup: ${user.group?.name}\nTotal Savings: RWF ${(funds._sum.amount ?? 0).toLocaleString()}`;
            }

            case '3':
            case 'LOAN': {
                session.step = 'LOAN';
                const loan = await prisma.loan.findFirst({
                    where: { userId: user.id, status: 'ACTIVE' },
                    orderBy: { deadline: 'asc' }
                });
                delete sessions[sessionId];
                if (!loan) return `END BikaSafe: You have no active loans.`;
                const daysLeft = Math.ceil((new Date(loan.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return `END BikaSafe — Loan Due\nAmount: RWF ${Number(loan.amount).toLocaleString()}\nDeadline: ${loan.deadline.toLocaleDateString()}\nDays Left: ${daysLeft > 0 ? daysLeft : 'OVERDUE'}`;
            }

            case '0':
                delete sessions[sessionId];
                return `END BikaSafe: Thank you. Stay on track with your savings!`;

            default:
                return this.mainMenu(user.group?.name ?? 'your group');
        }
    }

    private static mainMenu(groupName: string): string {
        return `CON BikaSafe — ${groupName}\n1. My Status & Fines\n2. Group Balance\n3. My Loan Deadline\n0. Exit`;
    }
}
