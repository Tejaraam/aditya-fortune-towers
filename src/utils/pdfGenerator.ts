import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Database } from '../types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Flat = Database['public']['Tables']['flats']['Row'];
type Payment = Database['public']['Tables']['maintenance_payments']['Row'];

export const generateReceiptPDF = (
  payment: Payment,
  flat: Flat,
  profile: Profile | null,
  pendingDues: number,
  totalPayable: number,
  previousPending: number
) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // Indigo-900
  doc.text('ADITYA FORTUNE TOWERS', 105, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text('AFTOWA Registered Society, MVP Colony, Visakhapatnam', 105, 28, { align: 'center' });
  
  // Receipt Title & Details
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('MAINTENANCE PAYMENT RECEIPT', 105, 40, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Receipt No: ${payment.receipt_number || 'N/A'}`, 14, 55);
  doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 140, 55);
  
  doc.line(14, 60, 196, 60); // separator

  // Resident Details
  doc.setFont('helvetica', 'bold');
  doc.text('Resident Details:', 14, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${profile?.name || 'Resident'}`, 14, 78);
  doc.text(`Flat: ${flat.tower} - ${flat.flat_number}`, 14, 86);
  doc.text(`Mobile: ${profile?.phone || 'N/A'}`, 14, 94);

  // Billing Details
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Details:', 120, 70);
  doc.setFont('helvetica', 'normal');
  doc.text(`Billing Month: ${payment.billing_month}/${payment.billing_year}`, 120, 78);
  doc.text(`Payment Mode: ${payment.payment_mode || 'N/A'}`, 120, 86);
  doc.text(`Transaction Ref: ${payment.transaction_reference || 'N/A'}`, 120, 94);

  // Payment Breakdown Table
  autoTable(doc, {
    startY: 105,
    head: [['Description', 'Amount (INR)']],
    body: [
      ['Current Month Charge', `Rs. ${flat.monthly_maintenance_fee.toLocaleString()}`],
      ['Previous Pending Dues', `Rs. ${previousPending.toLocaleString()}`],
      ['Total Payable', `Rs. ${totalPayable.toLocaleString()}`],
      [{ content: 'Amount Paid', styles: { fontStyle: 'bold' } }, { content: `Rs. ${payment.amount.toLocaleString()}`, styles: { fontStyle: 'bold' } }],
      ['Remaining Pending', `Rs. ${pendingDues.toLocaleString()}`]
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  // Remarks
  const finalY = (doc as any).lastAutoTable.finalY || 160;
  if (payment.remarks) {
    doc.setFont('helvetica', 'italic');
    doc.text(`Remarks: ${payment.remarks}`, 14, finalY + 15);
  }

  // Footer & Signatures
  doc.setFont('helvetica', 'bold');
  doc.text('Authorized Signatory', 160, finalY + 40, { align: 'center' });
  doc.line(130, finalY + 35, 190, finalY + 35);
  
  doc.text('Society Seal', 50, finalY + 40, { align: 'center' });
  doc.setLineDashPattern([2, 2], 0);
  doc.line(20, finalY + 35, 80, finalY + 35);
  doc.setLineDashPattern([], 0);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('This is a computer generated receipt and does not require a physical signature.', 105, 280, { align: 'center' });

  // Save the PDF
  const filename = `AFT_Receipt_${payment.receipt_number || payment.id}.pdf`;
  doc.save(filename);
};
