import { readFileSync } from 'fs';
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
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const [page] = await pdfDoc.copyPages(pdfDoc, [0]);
    const newPdf = await PDFDocument.create();
    newPdf.addPage(page);
    const singlePagePdf = await newPdf.save();

    const imageBuffer = await sharp(singlePagePdf)
      .png()
      .toBuffer();

    const base64Image = imageBuffer.toString('base64');
    res.status(200).json({ image: base64Image });
  } catch (err) {
    console.error("Conversion error:", err);
    res.status(500).json({ error: 'Conversion failed', details: err.message });
  }
}