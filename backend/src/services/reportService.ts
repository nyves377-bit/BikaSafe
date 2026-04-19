import ExcelJS from 'exceljs';
import { prisma } from '../index';

export const generateExcelReport = async (groupId: string): Promise<Buffer> => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BikaSafe Report');

    // Define Columns with Widths
    sheet.columns = [
        { header: 'A', width: 25 },
        { header: 'B', width: 30 },
        { header: 'C', width: 15 },
        { header: 'D', width: 15 },
        { header: 'E', width: 20 },
        { header: 'F', width: 20 },
    ];

    // Add Group Info
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    const titleRow = sheet.addRow(['BikaSafe Financial Report']);
    titleRow.font = { bold: true, size: 14 };

    sheet.addRow(['Group Name', group?.name || 'N/A']);
    sheet.addRow(['Registration ID', group?.registrationId || 'N/A']);
    sheet.addRow(['Date', new Date().toLocaleDateString()]);
    sheet.addRow([]);

    // Add Contributions
    const contributions = await prisma.contribution.findMany({
        where: { groupId },
        include: { user: { select: { name: true } } }
    });
    const contentHeader1 = sheet.addRow(['Contributions']);
    contentHeader1.font = { bold: true };

    const tableHeader1 = sheet.addRow(['Ref No', 'Member', 'Amount', 'Status', 'Date']);
    tableHeader1.font = { bold: true };
    tableHeader1.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    });

    contributions.forEach(c => {
        sheet.addRow([c.refNo, c.user.name, c.amount, c.status, c.timestamp.toLocaleDateString()]);
    });
    sheet.addRow([]);

    // Add Loans
    const loans = await prisma.loan.findMany({
        where: { groupId },
        include: { user: { select: { name: true } } }
    });
    const contentHeader2 = sheet.addRow(['Loans']);
    contentHeader2.font = { bold: true };

    const tableHeader2 = sheet.addRow(['Ref No', 'Member', 'Amount', 'Interest (%)', 'Status', 'Deadline']);
    tableHeader2.font = { bold: true };
    tableHeader2.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    });

    loans.forEach(l => {
        sheet.addRow([l.refNo, l.user.name, l.amount, l.interestRate, l.status, l.deadline.toLocaleDateString()]);
    });
    sheet.addRow([]);

    // Add Payouts
    const payouts = await prisma.payout.findMany({
        where: { groupId },
        include: { requestedBy: { select: { name: true } } }
    });
    const contentHeader3 = sheet.addRow(['Payouts']);
    contentHeader3.font = { bold: true };

    const tableHeader3 = sheet.addRow(['Ref No', 'Description', 'Amount', 'Status', 'Requested By']);
    tableHeader3.font = { bold: true };
    tableHeader3.eachCell(cell => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F2F2F2' } };
    });

    payouts.forEach(p => {
        sheet.addRow([p.refNo, p.description, p.amount, p.status, p.requestedBy.name]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
};
