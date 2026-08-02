import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Helper for colors
const COLORS = {
    BRAND: [59, 130, 246] as [number, number, number], // #3B82F6
    SLATE_900: [15, 23, 42] as [number, number, number],
    SLATE_500: [100, 116, 139] as [number, number, number],
    EMERALD: [16, 185, 129] as [number, number, number],
    AMBER: [245, 158, 11] as [number, number, number],
    WHITE: [255, 255, 255] as [number, number, number]
};

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
            headStyles: { fillColor: [30, 58, 138], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { top: 10 },
            theme: 'striped',
            styles: { fontSize: 9 }
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

    // 2. Watermark
    doc.setTextColor(235, 239, 245);
    doc.setFontSize(60);
    doc.setFont('helvetica', 'bold');
    doc.text('BIKASAFE VERIFIED', 105, 150, { align: 'center', angle: 45 });

    // 3. Main Content Border
    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(1.5);
    doc.rect(15, 15, 180, 267);

    // Header
    doc.setFontSize(30);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    const headerTitle = groupName.length > 20 ? groupName.substring(0, 20) + '...' : groupName;
    doc.text(headerTitle.toUpperCase(), 105, 50, { align: 'center' });

    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL MEMBERSHIP AGREEMENT', 105, 62, { align: 'center' });

    // Body
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

    // Terms
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(30, 58, 138);
    doc.rect(35, 155, 140, 75, 'FD');

    doc.setFontSize(12);
    doc.setTextColor(30, 58, 138);
    doc.setFont('helvetica', 'bold');
    doc.text('LEGALLY BINDING TERMS:', 45, 170);

    doc.setFont('helvetica', 'normal');
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

    // Signatures
    doc.text('MEMBER SIGNATURE', 45, 250);
    doc.text('GROUP SEAL', 135, 250);
    doc.line(45, 262, 95, 262);
    doc.text(`Signed on: ${date}`, 45, 273);

    doc.save(`Agreement_${userName.replace(/ /g, '_')}.pdf`);
};

export const generateMemberStatement = (
    member: { name: string; phone: string; role: string },
    group: { name: string; currency: string },
    period: { month: string; year: string },
    summary: { totalSavings: number; totalSocial: number; totalLoans: number; totalPenalties: number },
    transactions: any[]
) => {
    const doc = new jsPDF() as any;
    const margin = 14;

    // 1. Branding Header
    doc.setFillColor(...COLORS.BRAND);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(...COLORS.WHITE);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('BikaSafe', margin, 25);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL MONTHLY STATEMENT', margin, 32);

    // 2. Member & Group Details
    doc.setTextColor(...COLORS.SLATE_900);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(group.name.toUpperCase(), margin, 55);
    
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.SLATE_500);
    doc.text('Statement For:', margin, 65);
    doc.setTextColor(...COLORS.SLATE_900);
    doc.setFontSize(12);
    doc.text(member.name, margin, 70);
    doc.setFontSize(9);
    doc.text(`Phone: ${member.phone}`, margin, 75);
    doc.text(`Role: ${member.role}`, margin, 80);

    // Period (Top Right)
    doc.setTextColor(...COLORS.SLATE_500);
    doc.setFontSize(10);
    doc.text('Statement Period:', 150, 65);
    doc.setTextColor(...COLORS.BRAND);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`${period.month} ${period.year}`, 150, 72);

    // 3. Summary Section (Horizontal Cards)
    const cardWidth = 43;
    const cardY = 90;
    const cardHeight = 25;

    const drawCard = (label: string, value: string, x: number, color: [number, number, number]) => {
        doc.setFillColor(248, 250, 252);
        doc.setDrawColor(226, 232, 240);
        doc.roundedRect(x, cardY, cardWidth, cardHeight, 3, 3, 'FD');
        
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.SLATE_500);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), x + 5, cardY + 8);
        
        doc.setFontSize(11);
        doc.setTextColor(...color);
        doc.text(value, x + 5, cardY + 18);
    };

    drawCard('Savings', `${group.currency} ${summary.totalSavings.toLocaleString()}`, margin, COLORS.EMERALD);
    drawCard('Social Fund', `${group.currency} ${summary.totalSocial.toLocaleString()}`, margin + cardWidth + 5, COLORS.BRAND);
    drawCard('Loans', `${group.currency} ${summary.totalLoans.toLocaleString()}`, margin + (cardWidth + 5) * 2, COLORS.AMBER);
    drawCard('Fines/Penalties', `${group.currency} ${summary.totalPenalties.toLocaleString()}`, margin + (cardWidth + 5) * 3, [220, 38, 38]);

    // 4. Transaction Table
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.SLATE_900);
    doc.setFont('helvetica', 'bold');
    doc.text('Transaction History', margin, 130);

    (doc as any).autoTable({
        startY: 135,
        head: [['Date', 'Description', 'Type', 'Status', 'Amount']],
        body: transactions.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.description || t.type,
            t.type,
            t.status,
            { content: `${t.amount > 0 ? '+' : ''}${t.amount.toLocaleString()} ${group.currency}`, styles: { fontStyle: 'bold', halign: 'right' } }
        ]),
        headStyles: { fillColor: COLORS.SLATE_900, fontSize: 10, fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            4: { halign: 'right' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    // 5. Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        const footerY = 285;
        
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, footerY - 5, 210 - margin, footerY - 5);
        
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.SLATE_500);
        doc.text('BikaSafe Verified Statement - This is a computer-generated document and requires no physical signature.', margin, footerY);
        doc.text(`Page ${i} of ${pageCount}`, 180, footerY);
    }

    doc.save(`BikaSafe_Statement_${member.name.replace(/ /g, '_')}_${period.month}_${period.year}.pdf`);
};

