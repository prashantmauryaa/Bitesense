/**
 * Bite Sense — client-side PDF text extraction via pdf.js (loaded from CDN in index.html).
 * Ported unchanged from the original app.js.
 */
export async function extractPdfText(file) {
  if (!window.pdfjsLib) {
    throw new Error('PDF reader failed to load. Check your internet connection, or paste the menu text instead.');
  }
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const buf = await file.arrayBuffer();
  const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
  let lines = [];
  const pages = Math.min(pdf.numPages, 10);
  for (let i = 1; i <= pages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const rows = new Map();
    for (const item of content.items) {
      const y = Math.round(item.transform[5]);
      if (!rows.has(y)) rows.set(y, []);
      rows.get(y).push(item.str);
    }
    const sorted = [...rows.entries()].sort((a, b) => b[0] - a[0]);
    lines.push(...sorted.map(([, parts]) => parts.join(' ').trim()).filter(Boolean));
  }
  const text = lines.join('\n');
  if (!text.trim()) {
    throw new Error('That PDF has no readable text (it may be a scanned image). Paste the menu text instead.');
  }
  return text;
}
