import { prisma } from '../index';

interface USSDSession {
    step: 'MAIN' | 'BALANCE' | 'STATUS' | 'APPROVAL_LIST' | 'APPROVAL_CONFIRM';
    data?: any;
}

const sessions: Record<string, USSDSession> = {};

/**
 * USSD Logic Service for BikaSafe
 * Standard formatting: 
 * - CON: Continue session, show menu.
 * - END: Terminate session, show final message.
 */
export class USSDService {
    static async handleRequest(sessionId: string, phone: string, text: string): Promise<string> {
        let session = sessions[sessionId] || { step: 'MAIN' };
        sessions[sessionId] = session;

        const user = await prisma.user.findUnique({
            where: { phone },
            include: { group: true }
        });

        if (!user) {
            return "END BikaSafe: Phone number not registered. Please register with your VSLA Treasurer.";
        }

        const input = text.split('*').pop() || '';

        // Router
        switch (session.step) {
            case 'MAIN':
                return this.handleMainMenu(user, session);
            case 'STATUS':
                return this.handleStatus(user);
            case 'BALANCE':
                const funds = await prisma.contribution.aggregate({
                    where: { groupId: user.groupId as string, status: 'PAID' },
                    _sum: { amount: true }
                });
                return `END BikaSafe Group: ${user.group?.name}\nTotal Funds: RWF ${funds._sum.amount || 0}\nMy Status: ${user.role}`;
            default:
                return "END BikaSafe: Feature coming soon.";
        }
    }

    private static handleMainMenu(user: any, session: USSDSession): string {
        session.step = 'STATUS'; // Just for simplicity in this demo simulation
        return `CON Welcome to BikaSafe (${user.group?.name})\n1. My Status\n2. Group Balance\n3. Approvals\n0. Exit`;
    }

    private static handleStatus(user: any): string {
        return `END BikaSafe: Your membership is ${user.role}. Dial *123# anytime to check balances.`;
    }
}
