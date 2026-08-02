import ExcelJS from 'exceljs';
import { prisma } from '../index';

const HEADER_FILL: ExcelJS.Fill = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1E293B' }
};
const HEADER_FONT: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };

function addTableHeader(sheet: ExcelJS.Worksheet, headers: string[]) {
    const row = sheet.addRow(headers);
    row.eachCell(cell => {
        cell.fill = HEADER_FILL;
        cell.font = HEADER_FONT;
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
        cell.border = { bottom: { style: 'thin', color: { argb: 'FF6366F1' } } };
    });
    return row;
}

function statusColor(status: string): string {
    switch (status?.toUpperCase()) {
        case 'PAID': case 'ACTIVE': case 'APPROVED': return 'FF10B981';
        case 'UNPAID': case 'OVERDUE': case 'REJECTED': return 'FFEF4444';
        case 'LATE': case 'PENDING': return 'FFF59E0B';
        case 'WAIVED': case 'REPAID': return 'FF6366F1';
        default: return 'FF64748B';
    }
}

export const generateExcelReport = async (groupId: string): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'BikaSafe';
    workbook.created = new Date();

    const [group, contributions, loans, payouts, penalties] = await Promise.all([
        prisma.group.findUnique({ where: { id: groupId } }),
        prisma.contribution.findMany({
            where: { groupId },
            include: { user: { select: { name: true } } },
            orderBy: { timestamp: 'desc' }
        }),
        prisma.loan.findMany({
            where: { groupId },
            include: { user: { select: { name: true } }, repayments: { select: { amount: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.payout.findMany({
            where: { groupId },
            include: { requestedBy: { select: { name: true } } },
            orderBy: { createdAt: 'desc' }
        }),
        prisma.penalty.findMany({
            where: { groupId },
            include: { user: { select: { name: true } } },
            orderBy: { timestamp: 'desc' }
        })
    ]);

    const addCoverInfo = (sheet: ExcelJS.Worksheet, title: string) => {
        const titleRow = sheet.addRow([title]);
        titleRow.font = { bold: true, size: 14, color: { argb: 'FF6366F1' } };
        sheet.addRow(['Group', group?.name || 'N/A']);
        sheet.addRow(['Registration ID', group?.registrationId || 'N/A']);
        sheet.addRow(['Generated', new Date().toLocaleString()]);
        sheet.addRow([]);
    };

    // Sheet 1: Contributions
    const s1 = workbook.addWorksheet('Contributions');
    s1.columns = [
        { key: 'refNo', width: 22 }, { key: 'member', width: 28 },
        { key: 'amount', width: 16 }, { key: 'fund', width: 12 },
        { key: 'status', width: 12 }, { key: 'date', width: 18 },
    ];
    addCoverInfo(s1, 'Contributions Report');
    addTableHeader(s1, ['Ref No', 'Member', 'Amount (RWF)', 'Fund Type', 'Status', 'Date']);
    contributions.forEach(c => {
        const row = s1.addRow([c.refNo || '-', c.user.name, Number(c.amount), c.fundType, c.status, c.timestamp.toLocaleDateString()]);
        row.getCell(5).font = { color: { argb: statusColor(c.status) }, bold: true };
    });
    s1.addRow([]);
    s1.addRow(['', 'TOTAL PAID', contributions.filter(c => c.status === 'PAID').reduce((s, c) => s + Number(c.amount), 0)]).font = { bold: true };

    // Sheet 2: Loans
    const s2 = workbook.addWorksheet('Loans');
    s2.columns = [
        { key: 'refNo', width: 22 }, { key: 'member', width: 28 },
        { key: 'amount', width: 16 }, { key: 'interest', width: 14 },
        { key: 'repaid', width: 16 }, { key: 'status', width: 12 }, { key: 'deadline', width: 18 },
    ];
    addCoverInfo(s2, 'Loans Report');
    addTableHeader(s2, ['Ref No', 'Member', 'Principal (RWF)', 'Interest (%)', 'Repaid (RWF)', 'Status', 'Deadline']);
    loans.forEach(l => {
        const totalRepaid = l.repayments.reduce((s, r) => s + Number(r.amount), 0);
        const row = s2.addRow([l.refNo || '-', l.user.name, Number(l.amount), Number(l.interestRate), totalRepaid, l.status, l.deadline.toLocaleDateString()]);
        row.getCell(6).font = { color: { argb: statusColor(l.status) }, bold: true };
    });

    // Sheet 3: Payouts
    const s3 = workbook.addWorksheet('Payouts');
    s3.columns = [
        { key: 'refNo', width: 22 }, { key: 'desc', width: 35 },
        { key: 'amount', width: 16 }, { key: 'status', width: 14 }, { key: 'member', width: 28 },
    ];
    addCoverInfo(s3, 'Payouts Report');
    addTableHeader(s3, ['Ref No', 'Description', 'Amount (RWF)', 'Status', 'Requested By']);
    payouts.forEach(p => {
        const row = s3.addRow([p.refNo || '-', p.description, Number(p.amount), p.status, p.requestedBy.name]);
        row.getCell(4).font = { color: { argb: statusColor(p.status) }, bold: true };
    });
    s3.addRow([]);
    s3.addRow(['', 'TOTAL APPROVED', payouts.filter(p => p.status === 'APPROVED').reduce((s, p) => s + Number(p.amount), 0)]).font = { bold: true };

    // Sheet 4: Penalties
    const s4 = workbook.addWorksheet('Penalties');
    s4.columns = [
        { key: 'member', width: 28 }, { key: 'amount', width: 16 },
        { key: 'reason', width: 40 }, { key: 'status', width: 12 }, { key: 'date', width: 18 },
    ];
    addCoverInfo(s4, 'Penalties Report');
    addTableHeader(s4, ['Member', 'Amount (RWF)', 'Reason', 'Status', 'Date']);
    penalties.forEach(p => {
        const row = s4.addRow([p.user.name, Number(p.amount), p.reason, p.status, p.timestamp.toLocaleDateString()]);
        row.getCell(4).font = { color: { argb: statusColor(p.status) }, bold: true };
    });
    s4.addRow([]);
    s4.addRow(['TOTAL UNPAID', penalties.filter(p => p.status === 'UNPAID').reduce((s, p) => s + Number(p.amount), 0)]).font = { bold: true, color: { argb: 'FFEF4444' } };

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};
