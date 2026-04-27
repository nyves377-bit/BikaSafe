/**
 * SMS Notification Service for BikaSafe
 * Uses Africa's Talking API for production SMS delivery.
 */
import AfricasTalking from 'africastalking';

const username = process.env.AT_USERNAME || 'sandbox';
const apiKey = process.env.AT_API_KEY;
const senderId = process.env.AT_SENDER_ID; // Optional sender ID

// Initialize Africa's Talking
const at = apiKey ? AfricasTalking({
    username,
    apiKey
}) : null;

const sms = at ? at.SMS : null;

export class SMSService {
    /**
     * Sends an SMS notification via Africa's Talking
     */
    static async sendSMS(phone: string, message: string) {
        // Fallback for development or if credentials are missing
        if (!apiKey || !sms) {
            console.log(`\n--- [SMS GATEWAY (MOCK)] ---`);
            console.log(`To: ${phone}`);
            console.log(`Message: ${message}`);
            console.log(`---------------------------\n`);
            return { success: true, messageId: `mock_${Math.random().toString(36).substring(7)}` };
        }

        try {
            const options: any = {
                to: [phone],
                message: message
            };

            if (senderId && username !== 'sandbox') {
                options.from = senderId;
            }

            const response = await sms.send(options);
            console.log(`[SMS] Success: Sent to ${phone}. Response:`, JSON.stringify(response));
            return { success: true, response };
        } catch (error: any) {
            console.error(`[SMS ERROR] Failed to send to ${phone}:`, error.message);
            // We don't throw error to prevent breaking the main flow
            return { success: false, error: error.message };
        }
    }

    static async notifyContributionSuccess(phone: string, amount: number, refNo: string) {
        const msg = `BikaSafe: Your contribution of RWF ${amount.toLocaleString()} (${refNo}) has been received successfully. Thank you for building your community!`;
        return this.sendSMS(phone, msg);
    }

    static async notifyPayoutRequested(phone: string, amount: number, description: string) {
        const msg = `BikaSafe: A payout request of RWF ${amount.toLocaleString()} for "${description}" requires your approval. Check your BikaSafe dashboard.`;
        return this.sendSMS(phone, msg);
    }

    static async notifyDisbursementSuccess(phone: string, amount: number, providerRef: string) {
        const msg = `BikaSafe: Funds of RWF ${amount.toLocaleString()} have been sent to your Mobile Money. Ref: ${providerRef}. Enjoy!`;
        return this.sendSMS(phone, msg);
    }

    static async notifyPenaltyApplied(phone: string, amount: number, groupName: string) {
        const msg = `BikaSafe Alert: A penalty of RWF ${amount.toLocaleString()} has been applied in ${groupName}. Please clear it with your Treasurer.`;
        return this.sendSMS(phone, msg);
    }
}
