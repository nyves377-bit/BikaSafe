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

    // 1. Background Fill
    doc.setFillColor(248, 250, 252);
    doc.rect(0, 0, 210, 297, 'F');

    // 2. Watermark (Drawn BEFORE text so it's behind)
    doc.setTextColor(235, 239, 245);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('BIKASAFE VERIFIED', 105, 150, { align: 'center', angle: 45 });

    // 3. Main Content Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.5);
    doc.rect(15, 15, 180, 267);

    // Decorative corners
    doc.setLineWidth(0.5);
    doc.line(15, 40, 30, 40);
    doc.line(40, 15, 40, 30);
    doc.line(180, 15, 180, 30);
    doc.line(195, 40, 180, 40);

    // Group Logo/Name Header
    doc.setFontSize(30);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    const headerTitle = groupName.length > 20 ? groupName.substring(0, 20) + '...' : groupName;
    doc.text(headerTitle.toUpperCase(), 105, 50, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL MEMBERSHIP AGREEMENT', 105, 62, { align: 'center' });

    doc.setDrawColor(226, 232, 240);
    doc.line(40, 70, 170, 70);

    // Body Content
    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.text('This formal agreement confirms that', 105, 90, { align: 'center' });

    doc.setFontSize(36);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(userName, 105, 110, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(51, 65, 85);
    doc.setFont('helvetica', 'normal');
    const introText = `is a registered member of ${groupName}, subject to the terms and conditions outlined below.`;
    const splitIntro = doc.splitTextToSize(introText, 140);
    doc.text(splitIntro, 105, 125, { align: 'center' });

    // Terms Selection
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(30, 58, 138);
    doc.rect(35, 155, 140, 75, 'FD');

    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.text('LEGALLY BINDING TERMS:', 45, 170);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const terms = [
        '• Regular contributions as per group rules.',
        '• Absolute adherence to bylaws and penalties.',
        '• Full commitment to transparency.',
        '• Truthful information at all times.',
        '• Authorization of BikaSafe data processing.'
    ];
    terms.forEach((term, i) => {
        doc.text(term, 45, 182 + (i * 8));
    });

    // Signatures Section
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text('MEMBER SIGNATURE', 45, 250);
    doc.text('GROUP SEAL', 135, 250);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(14);
    doc.text(userName, 45, 260);
    doc.line(45, 262, 95, 262);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Digital Verification ID: BKS-${Math.random().toString(36).substring(7).toUpperCase()}`, 45, 268);
    doc.text(`Signed on: ${date}`, 45, 273);

    doc.save(`Agreement_${userName.replace(/ /g, '_')}.pdf`);
};
