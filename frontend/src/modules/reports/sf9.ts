import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReportCard } from './reports.service';

const QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'] as const;

function classifyLabel(c: string | null): string {
  if (c === 'withHighestHonors') return 'With Highest Honors';
  if (c === 'withHighHonors')    return 'With High Honors';
  if (c === 'withHonors')        return 'With Honors';
  return '—';
}

export function generateSf9Pdf(data: ReportCard): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines · Department of Education', pw / 2, 12, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text("SF9 — LEARNER'S PROGRESS REPORT CARD", pw / 2, 20, { align: 'center' });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`School Year: ${data.schoolYear.label}`, pw / 2, 27, { align: 'center' });

  // Student info
  doc.setFontSize(9);
  doc.text(`Name: ${data.student.lastName}, ${data.student.firstName} ${data.student.middleInitial}.`, 14, 35);
  doc.text(`LRN: ${data.student.lrn}`, 14, 41);
  doc.text(`Grade / Section: Grade ${data.student.gradeLevel} – ${data.student.sectionName}`, 14, 47);

  // Grade table
  const head = [['Learning Areas', 'Q1', 'Q2', 'Q3', 'Q4', 'Final Grade', 'Remarks']];
  const body = data.subjects.map(s => [
    s.subjectName,
    ...QUARTERS.map(q => s.grades[q] !== null ? String(s.grades[q]) : '—'),
    s.finalGrade > 0 ? String(s.finalGrade) : '—',
    s.finalGrade >= 75 ? 'Passed' : s.finalGrade > 0 ? 'Failed' : '—',
  ]);

  // General average row
  const qAvgs = QUARTERS.map(q => {
    const vals = data.subjects.map(s => s.grades[q]).filter((v): v is number => v !== null);
    return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : '—';
  });

  body.push([
    'General Average',
    ...qAvgs,
    data.generalAverage > 0 ? data.generalAverage.toFixed(2) : '—',
    data.generalAverage >= 75 ? 'Passed' : '—',
  ]);

  autoTable(doc, {
    head,
    body,
    startY: 53,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    bodyStyles: { textColor: [30, 41, 59] },
    didParseCell: (hookData) => {
      if (hookData.row.index === body.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [236, 254, 255];
      }
    },
  });

  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

  if (data.classification) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Honors: ${classifyLabel(data.classification)}`, 14, finalY);
  }

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`General Average: ${data.generalAverage.toFixed(2)}`, pw - 14, finalY, { align: 'right' });

  doc.save(`SF9_${data.student.lastName}_${data.student.firstName}_${data.schoolYear.label}.pdf`);
}
