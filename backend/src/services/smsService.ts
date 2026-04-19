/**
 * SMS Notification Service for BikaSafe
 * Simulates sending SMS alerts to members for critical platform actions.
 */
export class SMSService {
    /**
     * Sends a simulated SMS notification
     */
    static async sendSMS(phone: string, message: string) {
        console.log(`\n--- [SMS GATEWAY] ---`);
        console.log(`To: ${phone}`);
        console.log(`Message: ${message}`);
        console.log(`--------------------\n`);

        // In a production environment, this would call an API like Twilio or Africa's Talking
        return { success: true, messageId: `msg_${Math.random().toString(36).substring(7)}` };
    }

    static async notifyContributionSuccess(phone: string, amount: number, refNo: string) {
        const msg = `BikaSafe: Your contribution of RWF ${amount} (${refNo}) has been received successfully. Thank you for building your community!`;
        return this.sendSMS(phone, msg);
    }

    static async notifyPayoutRequested(phone: string, amount: number, description: string) {
        const msg = `BikaSafe: A payout request of RWF ${amount} for "${description}" requires your approval. Dial *123# to review.`;
        return this.sendSMS(phone, msg);
    }

    static async notifyDisbursementSuccess(phone: string, amount: number, providerRef: string) {
        const msg = `BikaSafe: Funds of RWF ${amount} have been sent to your Mobile Money. Ref: ${providerRef}. Enjoy!`;
        return this.sendSMS(phone, msg);
    }
}
