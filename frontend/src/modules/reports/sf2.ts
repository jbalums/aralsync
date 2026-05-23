import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Sf2Sheet } from './reports.service';

export function generateSf2Pdf(data: Sf2Sheet): void {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pw = doc.internal.pageSize.getWidth();

  // Header
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Republic of the Philippines · Department of Education', pw / 2, 10, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('SF2 — DAILY ATTENDANCE REPORT OF LEARNERS', pw / 2, 17, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  const meta = [
    `School Year: —`,
    `Month: ${data.month}`,
    `Grade / Section: Grade ${data.classLoad.gradeLevel} – ${data.classLoad.section}`,
    `Subject: ${data.classLoad.subject}`,
    `Quarter: ${data.classLoad.quarter}`,
    `Room: ${data.classLoad.roomNumber}`,
  ].join('   ');
  doc.text(meta, pw / 2, 23, { align: 'center' });

  // Build table columns
  const head = [
    ['#', "Learner's Name", ...data.schoolDays.map(String), 'Abs', 'Tar'],
  ];

  const body = data.students.map((s, i) => {
    const name = `${s.lastName}, ${s.firstName}`;
    const dayCells = data.schoolDays.map((d) => {
      const status = s.attendance[d];
      if (!status || status === 'present') return '';
      if (status === 'absent')  return 'A';
      if (status === 'late')    return 'T';
      if (status === 'excused') return 'E';
      return '';
    });
    return [(i + 1).toString(), name, ...dayCells, s.totalAbsent.toString(), s.totalLate.toString()];
  });

  autoTable(doc, {
    head,
    body,
    startY: 27,
    styles: { fontSize: 6, cellPadding: 1 },
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 6 },
      1: { cellWidth: 36 },
    },
  });

  // Footer
  const pageCount = (doc.internal as unknown as { getNumberOfPages: () => number }).getNumberOfPages();
  doc.setFontSize(7);
  doc.text(
    `Prepared by: ${data.classLoad.teacherName}`,
    14,
    doc.internal.pageSize.getHeight() - 8,
  );
  doc.text(
    `Page 1 of ${pageCount}`,
    pw - 14,
    doc.internal.pageSize.getHeight() - 8,
    { align: 'right' },
  );

  doc.save(`SF2_${data.classLoad.section}_${data.month.replace(' ', '_')}.pdf`);
}

export function generateSf2Excel(data: Sf2Sheet): void {
  const header = [
    '#',
    "Learner's Name",
    'LRN',
    ...data.schoolDays.map(d => `Day ${d}`),
    'Total Absent',
    'Total Late',
  ];

  const rows = data.students.map((s, i) => [
    i + 1,
    `${s.lastName}, ${s.firstName}`,
    s.lrn,
    ...data.schoolDays.map(d => {
      const st = s.attendance[d];
      if (!st || st === 'present') return '';
      if (st === 'absent')  return 'A';
      if (st === 'late')    return 'T';
      if (st === 'excused') return 'E';
      return '';
    }),
    s.totalAbsent,
    s.totalLate,
  ]);

  const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'SF2');
  XLSX.writeFile(wb, `SF2_${data.classLoad.section}_${data.month.replace(' ', '_')}.xlsx`);
}
