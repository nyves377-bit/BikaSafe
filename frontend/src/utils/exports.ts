import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const generatePDFStatement = (data: any[], title: string, fileName: string) => {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(30, 58, 138); // BikaSafe Blue
    doc.text('BikaSafe', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Empowering Rwandan Savings Groups', 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text(title, 14, 45);

    // Table
    if (data && data.length > 0) {
        (doc as any).autoTable({
            startY: 55,
            head: [Object.keys(data[0])],
            body: data.map((row: any) => Object.values(row)),
            headStyles: { fillColor: [30, 58, 138] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 10 },
            theme: 'striped'
        });
    } else {
        doc.setFontSize(12);
        doc.setTextColor(150);
        doc.text('No data available for this report.', 14, 60);
    }

    doc.save(`${fileName}.pdf`);
};

export const exportToExcel = (data: any[], fileName: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Statement");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

export const generateAgreementPDF = (userName: string, groupName: string, date: string) => {
    const doc = new jsPDF() as any;

    // Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1);
    doc.rect(10, 10, 190, 277);

    // Header
    doc.setFontSize(30);
    doc.setTextColor(30, 58, 138);
    doc.text('CERTIFICATE', 105, 50, { align: 'center' });
    doc.setFontSize(22);
    doc.text('OF MEMBERSHIP', 105, 62, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('BikaSafe - Rwandan Savings Network', 105, 75, { align: 'center' });

    // Body
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text('This is to certify that', 105, 100, { align: 'center' });

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 105, 120, { align: 'center' });

    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('is a verified member of', 105, 140, { align: 'center' });

    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text(groupName, 105, 160, { align: 'center' });

    // Declaration
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80);
    const rules = [
        '1. I agree to contribute weekly as per group rules.',
        '2. I acknowledge that late payments may attract penalties.',
        '3. I will maintain transparency and trust within the group.',
        '4. I agree to the BikaSafe terms of service.'
    ];
    doc.text('Agreement Terms:', 40, 190);
    rules.forEach((rule, i) => {
        doc.text(rule, 45, 200 + (i * 10));
    });

    // Signature
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Digital Signature:', 40, 250);
    doc.setFont('helvetica', 'italic');
    doc.text(userName, 120, 250);
    doc.setLineWidth(0.5);
    doc.line(115, 252, 175, 252);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Signed on: ${date}`, 120, 258);

    doc.save(`Agreement_${userName.replace(' ', '_')}.pdf`);
};
