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
    const originalPdf = await PDFDocument.load(pdfBuffer);

    const copiedPages = await originalPdf.copyPages(originalPdf, [0]);
    const [page] = copiedPages;

    const newPdf = await PDFDocument.create();
    newPdf.addPage(page); // ✅ now properly copied

    const singlePagePdfBytes = await newPdf.save();

    const imageBuffer = await sharp(singlePagePdfBytes)
      .png()
      .toBuffer();

    const base64Image = imageBuffer.toString('base64');
    res.status(200).json({ image: base64Image });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
}
