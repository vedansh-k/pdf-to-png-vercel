import { PDFDocument } from 'pdf-lib';
import sharp from 'sharp';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Only POST allowed');

  try {
    const pdfBuffer = Buffer.from(req.body.file, 'base64');

    // Load original PDF
    const originalPdf = await PDFDocument.load(pdfBuffer);

    // Create a brand new PDF
    const newPdf = await PDFDocument.create();

    // Copy the first page from the original PDF to the new one
    const [copiedPage] = await newPdf.copyPages(originalPdf, [0]);

    // Add it to the new PDF
    newPdf.addPage(copiedPage);

    // Save to bytes
    const singlePagePdfBytes = await newPdf.save();

    // Convert that single page to PNG
    const imageBuffer = await sharp(singlePagePdfBytes)
      .png()
      .toBuffer();

    const base64Image = imageBuffer.toString('base64');
    res.status(200).json({ image: base64Image });
  } catch (err) {
    console.error("🛑 Conversion error:", err);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
}
