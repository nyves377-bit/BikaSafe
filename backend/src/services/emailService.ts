import nodemailer from 'nodemailer';

// Email configuration from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER || 'demo_user@ethereal.email', // Replace with real SMTP user
        pass: process.env.SMTP_PASS || 'demo_pass' // Replace with real SMTP password
    }
});

export const sendReportEmail = async (to: string, groupName: string, excelBuffer: Buffer) => {
    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"BikaSafe Admin" <admin@bikasafe.co.rw>',
            to,
            subject: `Financial Report for ${groupName}`,
            text: `Attached is the latest financial report for ${groupName}.`,
            attachments: [
                {
                    filename: `BikaSafe_Report_${groupName.replace(/\s+/g, '_')}.xlsx`,
                    content: excelBuffer
                }
            ]
        });

        console.log(`[EMAIL] Report successfully sent to ${to}: ${info.messageId}`);
        return info;
    } catch (error: any) {
        console.error(`[EMAIL ERROR] Failed to send to ${to}:`, error.message);
        throw new Error(`Email delivery failed: ${error.message}`);
    }
};
