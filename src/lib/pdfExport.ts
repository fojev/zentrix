import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: Record<string, unknown>) => jsPDF;
  }
}

export function exportStudentReport(data: {
  name: string; subject: string; marks: number; attendance: number;
  studyHours: number; predictedScore: number; category: string; suggestions: string[];
}) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(100, 80, 200);
  doc.text('Student Performance Report', 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.line(20, 38, 190, 38);

  doc.autoTable({
    startY: 45,
    head: [['Field', 'Value']],
    body: [
      ['Student Name', data.name],
      ['Subject', data.subject],
      ['Marks', `${data.marks}`],
      ['Attendance', `${data.attendance}%`],
      ['Study Hours', `${data.studyHours}h/day`],
      ['Predicted Score', `${data.predictedScore.toFixed(1)}`],
      ['Category', data.category],
    ],
    theme: 'striped',
    headStyles: { fillColor: [100, 80, 200] },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(100, 80, 200);
  doc.text('AI Suggestions', 20, finalY);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  data.suggestions.forEach((s, i) => {
    doc.text(`• ${s}`, 25, finalY + 10 + i * 8, { maxWidth: 160 });
  });

  doc.save('student-performance-report.pdf');
}

export function exportFinanceReport(data: {
  income: number; expenses: Record<string, number>; totalExpenses: number;
  savings: number; savingsRate: number; suggestions: string[];
}) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(40, 160, 120);
  doc.text('Finance Analysis Report', 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.line(20, 38, 190, 38);

  doc.autoTable({
    startY: 45,
    head: [['Metric', 'Value']],
    body: [
      ['Monthly Income', `$${data.income.toLocaleString()}`],
      ['Total Expenses', `$${data.totalExpenses.toLocaleString()}`],
      ['Net Savings', `$${data.savings.toLocaleString()}`],
      ['Savings Rate', `${data.savingsRate.toFixed(1)}%`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [40, 160, 120] },
  });

  const y1 = (doc as any).lastAutoTable.finalY + 10;
  doc.autoTable({
    startY: y1,
    head: [['Category', 'Amount', '% of Income']],
    body: Object.entries(data.expenses).map(([k, v]) => [k, `$${v.toLocaleString()}`, `${(v / data.income * 100).toFixed(1)}%`]),
    theme: 'striped',
    headStyles: { fillColor: [40, 160, 120] },
  });

  const y2 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(40, 160, 120);
  doc.text('AI Suggestions', 20, y2);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  data.suggestions.forEach((s, i) => {
    doc.text(`• ${s}`, 25, y2 + 10 + i * 8, { maxWidth: 160 });
  });

  doc.save('finance-analysis-report.pdf');
}

export function exportDiseaseReport(data: {
  symptoms: string[]; predictedDisease: string;
  dos: string[]; donts: string[];
}) {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.setTextColor(200, 60, 80);
  doc.text('Disease Prediction Report', 20, 25);

  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);
  doc.line(20, 38, 190, 38);

  doc.setFontSize(14);
  doc.text('Selected Symptoms:', 20, 48);
  doc.setFontSize(11);
  data.symptoms.forEach((s, i) => doc.text(`• ${s}`, 25, 56 + i * 7));

  const y1 = 56 + data.symptoms.length * 7 + 10;
  doc.setFontSize(16);
  doc.setTextColor(200, 60, 80);
  doc.text(`Predicted: ${data.predictedDisease}`, 20, y1);

  doc.setFontSize(13);
  doc.setTextColor(40, 160, 120);
  doc.text('What to Do:', 20, y1 + 15);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  data.dos.forEach((s, i) => doc.text(`✓ ${s}`, 25, y1 + 23 + i * 7));

  const y2 = y1 + 23 + data.dos.length * 7 + 8;
  doc.setFontSize(13);
  doc.setTextColor(200, 60, 80);
  doc.text('What to Avoid:', 20, y2);
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  data.donts.forEach((s, i) => doc.text(`✗ ${s}`, 25, y2 + 8 + i * 7));

  const y3 = y2 + 8 + data.donts.length * 7 + 15;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Disclaimer: This prediction is for educational purposes only and is NOT medical advice.', 20, y3, { maxWidth: 170 });

  doc.save('disease-prediction-report.pdf');
}
