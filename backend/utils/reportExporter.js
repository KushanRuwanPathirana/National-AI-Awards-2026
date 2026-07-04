const escapeCsvValue = (value) => {
  const stringValue = value == null ? '' : String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const buildApplicationsCsv = (applications) => {
  const headers = [
    'Reference Number',
    'Project Title',
    'Category',
    'Candidate',
    'Organization',
    'Status',
    'Eligibility',
    'Average Score',
    'Published Finalist',
    'Published Winner',
    'Certificate Number',
  ];

  const rows = applications.map((app) => [
    app.referenceNumber || '',
    app.projectTitle || '',
    app.category?.name || '',
    `${app.candidate?.firstName || ''} ${app.candidate?.lastName || ''}`.trim(),
    app.candidate?.organization || '',
    app.status || '',
    app.isEligible === null ? 'Pending' : app.isEligible ? 'Eligible' : 'Ineligible',
    app.averageScore ?? '',
    app.publishedAsFinalist ? 'Yes' : 'No',
    app.publishedAsWinner ? 'Yes' : 'No',
    app.certificateNumber || '',
  ]);

  const csvLines = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(','));
  return `${csvLines.join('\n')}\n`;
};

const escapePdfText = (value) => String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');

const buildSimplePdf = (title, lines) => {
  const contentLines = [
    'BT',
    '/F1 12 Tf',
    '72 760 Td',
    `(${escapePdfText(title)}) Tj`,
    '0 -18 Td',
  ];

  lines.forEach((line) => {
    contentLines.push(`(${escapePdfText(line)}) Tj`);
    contentLines.push('0 -14 Td');
  });

  contentLines.push('ET');
  const content = contentLines.join('\n');
  const contentLength = Buffer.byteLength(content, 'utf8');

  const objects = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
  objects.push(`<< /Length ${contentLength} >>\nstream\n${content}\nendstream`);
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');

  const pdfParts = ['%PDF-1.4'];
  const offsets = [];
  let pdf = '';

  objects.forEach((obj, index) => {
    const objectNumber = index + 1;
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += `${objectNumber} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdfParts.join('\n'), 'utf8');
  pdf = `${pdfParts.join('\n')}\n${pdf}`;

  const xref = ['xref', `0 ${objects.length + 1}`, '0000000000 65535 f '];
  offsets.forEach((offset) => {
    xref.push(`${String(offset).padStart(10, '0')} 00000 n `);
  });

  const trailer = [`trailer`, `<< /Size ${objects.length + 1} /Root 1 0 R >>`, `startxref`, `${xrefOffset}`, '%%EOF'];
  return `${pdf}${xref.join('\n')}\n${trailer.join('\n')}\n`;
};

module.exports = {
  buildApplicationsCsv,
  buildSimplePdf,
};
