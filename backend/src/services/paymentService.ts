import { prisma } from '../index';
import { generateRefNo } from '../utils/reference';

export enum PaymentStatus {
    PENDING = 'PENDING',
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED'
}

export interface PaymentRequest {
    amount: number;
    phone: string;
    description: string;
    metadata?: any;
}

export interface PaymentResponse {
    success: boolean;
    providerRef: string;
    message: string;
}

/**
 * Unified Payment Service for BikaSafe
 * Handles interactions with Mobile Money providers (simulated for Phase 2).
 */
export class PaymentService {
    /**
     * Initiates a C2B (Customer to Business) Payment request (Push request to phone)
     */
    static async initiateCollection(req: PaymentRequest): Promise<PaymentResponse> {
        console.log(`[PaymentService] Initiating Collection: ${req.amount} from ${req.phone}`);

        // Simulate Network Latency
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simulate Success (90% success rate for simulation)
        const isSuccess = Math.random() > 0.1;
        const providerRef = `MOMO-${Math.random().toString(36).substring(7).toUpperCase()}`;

        if (isSuccess) {
            console.log(`[PaymentService] Collection Success: ${providerRef}`);
            return {
                success: true,
                providerRef,
                message: 'Collection request sent to member phone.'
            };
        } else {
            console.error(`[PaymentService] Collection Failed`);
            return {
                success: false,
                providerRef,
                message: 'Failed to initiate mobile money request.'
            };
        }
    }

    /**
     * Initiates a B2C (Business to Customer) Disbursement (Sending funds to member)
     */
    static async initiateDisbursement(req: PaymentRequest): Promise<PaymentResponse> {
        console.log(`[PaymentService] Initiating Disbursement: ${req.amount} to ${req.phone}`);

        // Simulate Network Latency
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Payouts are high stakes, 95% success rate for simulation
        const isSuccess = Math.random() > 0.05;
        const providerRef = `PAYOUT-${Math.random().toString(36).substring(7).toUpperCase()}`;

        if (isSuccess) {
            console.log(`[PaymentService] Disbursement Success: ${providerRef}`);
            return {
                success: true,
                providerRef,
                message: 'Funds disbursed successfully via Mobile Money.'
            };
        } else {
            console.error(`[PaymentService] Disbursement Failed`);
            return {
                success: false,
                providerRef,
                message: 'Disbursement failed at the gateway level.'
            };
        }
    }

    /**
     * Background Sync: Simulates a webhook callback for payment completion
     */
    static async simulateCallback(type: 'CONTRIBUTION' | 'PAYOUT', id: string, finalStatus: PaymentStatus) {
        console.log(`[PaymentService] Simulating Callback for ${type} ${id} -> ${finalStatus}`);

        if (type === 'CONTRIBUTION') {
            await prisma.contribution.update({
                where: { id },
                data: { paymentStatus: finalStatus, status: finalStatus === PaymentStatus.SUCCESS ? 'PAID' : 'MISSED' }
            });
        } else {
            await prisma.payout.update({
                where: { id },
                data: { paymentStatus: finalStatus, status: finalStatus === PaymentStatus.SUCCESS ? 'APPROVED' : 'REJECTED' }
            });
        }
    }
}
