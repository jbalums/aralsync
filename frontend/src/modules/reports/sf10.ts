import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportCard } from './reports.service';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

export function generateSf10Pdf(data: ReportCard): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines · Department of Education', pw / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("SF10 — LEARNER'S PERMANENT ACADEMIC RECORD", pw / 2, 20, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`School Year: ${data.schoolYear.label}`, pw / 2, 27, { align: 'center' });

  // Student info
  doc.setFontSize(9);
  doc.text(`Name: ${data.student.lastName}, ${data.student.firstName} ${data.student.middleInitial}.`, 14, 35);
  doc.text(`LRN: ${data.student.lrn}`, 14, 41);
  doc.text(`Grade Level: Grade ${data.student.gradeLevel}`, 14, 47);
  doc.text(`Section: ${data.student.sectionName}`, pw / 2 + 10, 47);

  // Permanent record table — all quarters + final
  const head = [
    ['Learning Areas', 'Q1', 'Q2', 'Q3', 'Q4', 'Final Grade', 'Remarks'],
  ];

  const body = data.subjects.map(s => [
    s.subjectName,
    ...QUARTERS.map(q => s.grades[q] !== null ? String(s.grades[q]) : '—'),
    s.finalGrade > 0 ? s.finalGrade.toFixed(0) : '—',
    s.finalGrade >= 75 ? 'P' : s.finalGrade > 0 ? 'F' : '—',
  ]);

  const qAvgs = QUARTERS.map(q => {
    const vals = data.subjects.map(s => s.grades[q]).filter((v): v is number => v !== null);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  });

  body.push([
    'General Average',
    ...qAvgs,
    data.generalAverage > 0 ? data.generalAverage.toFixed(2) : '—',
    data.generalAverage >= 75 ? 'P' : '—',
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 53,
    styles:     { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: [30, 41, 59] },
    didParseCell: (hookData) => {
      if (hookData.row.index === body.length - 1) {
        hookData.cell.styles.fontStyle  = 'bold';
        hookData.cell.styles.fillColor  = [236, 254, 255];
      }
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  // Certification block
  doc.setFontSize(8);
  doc.text('Certified True and Correct:', 14, finalY);
  doc.line(14, finalY + 12, 80, finalY + 12);
  doc.setFontSize(7);
  doc.text('Signature of Adviser / Registrar over Printed Name', 14, finalY + 15);

  doc.save(`SF10_${data.student.lastName}_${data.student.firstName}_${data.schoolYear.label}.pdf`);
}
