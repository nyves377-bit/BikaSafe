import nodemailer from 'nodemailer';

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

const FROM = process.env.SMTP_FROM || '"BikaSafe" <noreply@bikasafe.co.rw>';

// ─── Base HTML Layout ─────────────────────────────────────────────────────────
const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          <!-- Logo / Header -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <div style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:16px;padding:12px 28px;">
                <span style="font-size:24px;font-weight:800;color:#fff;letter-spacing:-0.5px;">🔒 BikaSafe</span>
              </div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td style="background:#1e293b;border-radius:20px;overflow:hidden;border:1px solid rgba(99,102,241,0.2);">
              <!-- Accent bar -->
              <div style="height:4px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa);"></div>
              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:36px 40px;">
                    ${content}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:28px;">
              <p style="color:#475569;font-size:13px;margin:0;">
                © ${new Date().getFullYear()} BikaSafe · Secure Savings Platform · Rwanda
              </p>
              <p style="color:#334155;font-size:12px;margin:8px 0 0;">
                This is an automated message. Please do not reply directly to this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Shared UI Helpers ────────────────────────────────────────────────────────
const heading = (text: string) =>
    `<h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">${text}</h1>`;

const subheading = (text: string) =>
    `<p style="color:#94a3b8;font-size:15px;margin:0 0 28px;">${text}</p>`;

const paragraph = (text: string) =>
    `<p style="color:#cbd5e1;font-size:15px;line-height:1.7;margin:0 0 16px;">${text}</p>`;

const divider = () =>
    `<hr style="border:none;border-top:1px solid rgba(99,102,241,0.15);margin:24px 0;" />`;

const infoBox = (rows: { label: string; value: string }[]) => `
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;margin:20px 0;border:1px solid rgba(99,102,241,0.15);">
  ${rows.map(r => `
  <tr>
    <td style="padding:12px 20px;color:#64748b;font-size:13px;width:40%;border-bottom:1px solid rgba(99,102,241,0.08);">${r.label}</td>
    <td style="padding:12px 20px;color:#e2e8f0;font-size:14px;font-weight:600;border-bottom:1px solid rgba(99,102,241,0.08);">${r.value}</td>
  </tr>`).join('')}
</table>`;

const button = (text: string, href: string, color = '#6366f1') => `
<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
  <tr>
    <td style="background:${color};border-radius:10px;padding:14px 32px;text-align:center;">
      <a href="${href}" style="color:#fff;font-size:15px;font-weight:700;text-decoration:none;">${text}</a>
    </td>
  </tr>
</table>`;

const badge = (text: string, color: string) =>
    `<span style="display:inline-block;background:${color};color:#fff;border-radius:6px;padding:4px 12px;font-size:12px;font-weight:700;letter-spacing:0.5px;">${text}</span>`;

const APP_URL = process.env.FRONTEND_URL || 'https://bikasafe-frontend.onrender.com';

// ─── Safe Send ────────────────────────────────────────────────────────────────
const sendMail = async (to: string, subject: string, html: string) => {
    // Skip silently if SMTP is not configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(`[EMAIL] SMTP not configured — skipped sending "${subject}" to ${to}`);
        return null;
    }
    try {
        const info = await transporter.sendMail({ from: FROM, to, subject, html });
        console.log(`[EMAIL] ✓ "${subject}" → ${to} (${info.messageId})`);
        return info;
    } catch (error: any) {
        console.error(`[EMAIL] ✗ Failed to send "${subject}" to ${to}:`, error.message);
        // Non-fatal: we log but don't throw so the main request still succeeds
        return null;
    }
};

// ═══════════════════════════════════════════════════════════════════════════════
// EMAIL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

// 1. Welcome Email (on registration)
export const sendWelcomeEmail = async (to: string, name: string, groupName: string) => {
    const html = baseTemplate('Welcome to BikaSafe', `
        ${heading(`Welcome, ${name}! 🎉`)}
        ${subheading('Your BikaSafe account has been created successfully.')}
        ${paragraph(`You've been registered as the <strong style="color:#a78bfa;">Admin</strong> of the savings group <strong style="color:#e2e8f0;">${groupName}</strong>. You now have full access to manage contributions, loans, payouts, and member records.`)}
        ${infoBox([
            { label: 'Account Name', value: name },
            { label: 'Group', value: groupName },
            { label: 'Role', value: 'Admin' },
        ])}
        ${paragraph('Get started by adding your group members and setting up your first contribution cycle.')}
        ${button('Go to Dashboard', `${APP_URL}/dashboard`)}
        ${divider()}
        ${paragraph('<small style="color:#64748b;">If you did not create this account, please ignore this email.</small>')}
    `);
    return sendMail(to, `Welcome to BikaSafe — ${groupName}`, html);
};

// 2. Member Added (when Treasurer/Admin adds them to a group)
export const sendMemberInviteEmail = async (to: string, name: string, groupName: string, tempPassword: string) => {
    const html = baseTemplate('You have been added to a BikaSafe Group', `
        ${heading(`You've been added to ${groupName}`)}
        ${subheading('Your group admin has created an account for you on BikaSafe.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, you are now a member of the savings group <strong style="color:#a78bfa;">${groupName}</strong>. Use the credentials below to log in for the first time.`)}
        ${infoBox([
            { label: 'Group', value: groupName },
            { label: 'Temporary Password', value: `<code style="background:#0f172a;padding:2px 8px;border-radius:4px;">${tempPassword}</code>` },
        ])}
        ${paragraph('<strong style="color:#fbbf24;">⚠️ Please change your password immediately after your first login.</strong>')}
        ${button('Login to BikaSafe', `${APP_URL}/login`)}
    `);
    return sendMail(to, `You've been added to ${groupName} on BikaSafe`, html);
};

// 3. Loan Approved
export const sendLoanApprovedEmail = async (
    to: string, name: string, groupName: string,
    amount: number, deadline: Date, refNo: string
) => {
    const html = baseTemplate('Your Loan Has Been Approved', `
        ${heading('Loan Approved ✅')}
        ${subheading('Great news — your loan request has been approved.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, your loan request for <strong style="color:#a78bfa;">${groupName}</strong> has been reviewed and approved by the Treasurer.`)}
        ${infoBox([
            { label: 'Reference', value: refNo },
            { label: 'Approved Amount', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Repayment Deadline', value: deadline.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Status', value: badge('APPROVED', '#10b981') },
        ])}
        ${paragraph('The disbursement will be processed by your Treasurer. Please ensure you repay on time to avoid penalties.')}
        ${button('View Loan Details', `${APP_URL}/dashboard`)}
    `);
    return sendMail(to, `Loan Approved — RWF ${amount.toLocaleString()} (${refNo})`, html);
};

// 4. Loan Rejected
export const sendLoanRejectedEmail = async (
    to: string, name: string, groupName: string,
    amount: number, refNo: string, reason?: string
) => {
    const html = baseTemplate('Loan Request Update', `
        ${heading('Loan Request Declined ❌')}
        ${subheading('Your loan request has been reviewed.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, unfortunately your loan request for <strong style="color:#a78bfa;">${groupName}</strong> could not be approved at this time.`)}
        ${infoBox([
            { label: 'Reference', value: refNo },
            { label: 'Requested Amount', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Status', value: badge('REJECTED', '#ef4444') },
            ...(reason ? [{ label: 'Reason', value: reason }] : []),
        ])}
        ${paragraph('You may contact your group Treasurer for more information or reapply in the next cycle.')}
        ${button('View Dashboard', `${APP_URL}/dashboard`, '#475569')}
    `);
    return sendMail(to, `Loan Request Update — ${refNo}`, html);
};

// 5. Penalty Applied
export const sendPenaltyEmail = async (
    to: string, name: string, groupName: string,
    amount: number, reason: string
) => {
    const html = baseTemplate('Penalty Notice', `
        ${heading('Penalty Applied ⚠️')}
        ${subheading(`A late fee has been issued on your account in ${groupName}.`)}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, a penalty has been applied to your account due to a missed obligation in <strong style="color:#a78bfa;">${groupName}</strong>.`)}
        ${infoBox([
            { label: 'Group', value: groupName },
            { label: 'Penalty Amount', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Reason', value: reason },
            { label: 'Status', value: badge('UNPAID', '#f59e0b') },
        ])}
        ${paragraph('Please clear this penalty with your group Treasurer as soon as possible to avoid additional charges.')}
        ${button('View Penalties', `${APP_URL}/dashboard`, '#f59e0b')}
        ${divider()}
        ${paragraph('<small style="color:#64748b;">If you believe this penalty was applied in error, please contact your group Admin.</small>')}
    `);
    return sendMail(to, `⚠️ Penalty Notice — RWF ${amount.toLocaleString()} (${groupName})`, html);
};

// 6. Loan Repayment Reminder (3 days before deadline)
export const sendLoanReminderEmail = async (
    to: string, name: string, groupName: string,
    amount: number, deadline: Date, refNo: string
) => {
    const daysLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    const html = baseTemplate('Loan Repayment Reminder', `
        ${heading(`Loan Due in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} ⏰`)}
        ${subheading('This is a friendly reminder about your upcoming loan repayment.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, your loan in <strong style="color:#a78bfa;">${groupName}</strong> is coming due soon. Please ensure you have the funds ready.`)}
        ${infoBox([
            { label: 'Reference', value: refNo },
            { label: 'Amount Due', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Deadline', value: deadline.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Days Remaining', value: `${daysLeft} day${daysLeft !== 1 ? 's' : ''}` },
        ])}
        ${paragraph('Contact your Treasurer to arrange repayment before the deadline to avoid a penalty.')}
        ${button('View Dashboard', `${APP_URL}/dashboard`, '#6366f1')}
    `);
    return sendMail(to, `Reminder: Loan Repayment Due in ${daysLeft} Day${daysLeft !== 1 ? 's' : ''} — ${refNo}`, html);
};

// 7. Contribution Recorded (receipt)
export const sendContributionReceiptEmail = async (
    to: string, name: string, groupName: string,
    amount: number, refNo: string, date: Date
) => {
    const html = baseTemplate('Contribution Receipt', `
        ${heading('Contribution Recorded ✅')}
        ${subheading('Your payment has been successfully recorded.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, your contribution to <strong style="color:#a78bfa;">${groupName}</strong> has been recorded by the Treasurer.`)}
        ${infoBox([
            { label: 'Reference', value: refNo },
            { label: 'Amount', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Group', value: groupName },
            { label: 'Date', value: date.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) },
            { label: 'Status', value: badge('CONFIRMED', '#10b981') },
        ])}
        ${paragraph('Please keep this email as your receipt for this contribution.')}
        ${button('View My History', `${APP_URL}/dashboard`)}
    `);
    return sendMail(to, `Contribution Receipt — RWF ${amount.toLocaleString()} (${refNo})`, html);
};

// 8. Payout Approved / Disbursed
export const sendPayoutNotificationEmail = async (
    to: string, name: string, groupName: string,
    amount: number, refNo: string, description: string
) => {
    const html = baseTemplate('Payout Notification', `
        ${heading('Payout Disbursed 💸')}
        ${subheading('A payout has been processed for your group.')}
        ${paragraph(`Hello <strong style="color:#e2e8f0;">${name}</strong>, a payout has been approved and processed in <strong style="color:#a78bfa;">${groupName}</strong>.`)}
        ${infoBox([
            { label: 'Reference', value: refNo },
            { label: 'Amount', value: `RWF ${amount.toLocaleString()}` },
            { label: 'Description', value: description },
            { label: 'Status', value: badge('DISBURSED', '#10b981') },
        ])}
        ${paragraph('Please confirm receipt with your group Treasurer if this payout was for you.')}
        ${button('View Dashboard', `${APP_URL}/dashboard`)}
    `);
    return sendMail(to, `Payout Disbursed — RWF ${amount.toLocaleString()} (${refNo})`, html);
};

// 9. Weekly/Monthly Financial Report (existing — enhanced)
export const sendReportEmail = async (to: string, groupName: string, excelBuffer: Buffer) => {
    const html = baseTemplate('Financial Report', `
        ${heading(`${groupName} — Financial Report 📊`)}
        ${subheading(`Generated on ${new Date().toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`)}
        ${paragraph(`Please find attached the latest financial report for <strong style="color:#a78bfa;">${groupName}</strong>. This report covers all contributions, loans, penalties, and payouts recorded in the current cycle.`)}
        ${divider()}
        ${paragraph('Open the attached Excel file for a full breakdown. If you have questions, contact your group Admin.')}
        ${button('View Live Dashboard', `${APP_URL}/dashboard`)}
    `);

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn(`[EMAIL] SMTP not configured — skipped report email to ${to}`);
        return null;
    }

    try {
        const info = await transporter.sendMail({
            from: FROM,
            to,
            subject: `Financial Report — ${groupName}`,
            html,
            attachments: [{
                filename: `BikaSafe_Report_${groupName.replace(/\s+/g, '_')}.xlsx`,
                content: excelBuffer,
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }]
        });
        console.log(`[EMAIL] ✓ Report → ${to} (${info.messageId})`);
        return info;
    } catch (error: any) {
        console.error(`[EMAIL] ✗ Report failed to ${to}:`, error.message);
        return null;
    }
};
