import { Router } from 'express';
import { prisma } from '../index';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateExcelReport } from '../services/reportService';
import { sendReportEmail } from '../services/emailService';

const router = Router();

// Download Excel Report
router.get('/excel', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });

    try {
        const buffer = await generateExcelReport(groupId);
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        const filename = `BikaSafe_Report_${group?.name.replace(/\s+/g, '_') || 'Report'}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to generate Excel report', details: error.message });
    }
});

// Send Report via Email
router.post('/email', authenticate, async (req: AuthRequest, res) => {
    const groupId = req.user?.groupId;
    const { email } = req.body;

    if (!groupId) return res.status(400).json({ error: 'Group ID not found' });
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    try {
        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: 'Group not found' });

        const buffer = await generateExcelReport(groupId);
        await sendReportEmail(email, group.name, buffer);

        res.json({ message: `Report successfully sent to ${email}` });
    } catch (error: any) {
        console.error('[REPORT ERROR] Email failure:', error.message);
        res.status(500).json({
            error: 'Failed to send email report',
            details: error.message,
            tip: 'Check your SMTP configuration in the backend .env file.'
        });
    }
});

export default router;
