// Lightweight client-side PDF generator.
// Builds a minimal, valid PDF (with a correct xref table) from a title + text lines,
// then triggers a browser download. No external dependencies needed.

const escapePdfText = (s: string): string =>
  s
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)')
    // strip non-ASCII so byte length === char length (keeps xref offsets valid)
    .replace(/[^\x20-\x7E]/g, '');

const wrapLine = (text: string, maxChars = 90): string[] => {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.length ? lines : [''];
};

export interface PdfOptions {
  fileName: string;
  title: string;
  subtitle?: string;
  bodyLines: string[];
  footer?: string;
}

export function generateAndDownloadPdf({ fileName, title, subtitle, bodyLines, footer }: PdfOptions): void {
  // Build the page content stream
  let content = 'BT\n';
  content += '/F2 20 Tf\n';
  content += '0 0 0.55 rg\n'; // navy-ish title color
  content += `72 750 Td\n(${escapePdfText(title)}) Tj\n`;

  let yCursor = 750;

  if (subtitle) {
    content += '/F1 12 Tf\n';
    content += '0.35 0.35 0.4 rg\n';
    content += '0 -24 Td\n';
    yCursor -= 24;
    content += `(${escapePdfText(subtitle)}) Tj\n`;
  }

  // Divider gap
  content += '0.1 0.1 0.1 rg\n';
  content += '/F1 11 Tf\n';
  content += '0 -36 Td\n';
  yCursor -= 36;

  for (const rawLine of bodyLines) {
    const wrapped = rawLine.trim() === '' ? [''] : wrapLine(rawLine, 92);
    for (const line of wrapped) {
      if (yCursor <= 70) break;
      content += `(${escapePdfText(line)}) Tj\n0 -16 Td\n`;
      yCursor -= 16;
    }
  }

  if (footer) {
    content += '/F1 9 Tf\n';
    content += '0.5 0.5 0.55 rg\n';
    content += `1 0 0 1 72 50 Tm\n(${escapePdfText(footer)}) Tj\n`;
  }

  content += 'ET';

  // PDF objects
  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push(
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>'
  );
  objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefStart = pdf.length;
  pdf += 'xref\n';
  pdf += `0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const off of offsets) {
    pdf += String(off).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
