import PDFDocument from 'pdfkit';

export interface InsurancePDFData {
  userName: string;
  insuranceName: string;
  policyNumber: string;
  startDate?: string;
  endDate?: string;
  provider?: string;
  coverageType?: string;
  monthlyPremium?: string;
  documentNumber?: string;
}

export async function generateInsurancePDF(data: InsurancePDFData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 40,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', (err) => {
        reject(err);
      });

      doc.fontSize(24).font('Helvetica-Bold').text('BIZTOSÍTÁSI DOKUMENTUM', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(11).font('Helvetica').fillColor('#999').text('Kiadás Figyelő', { align: 'center' });
      doc.moveDown(1.5);

      doc.fontSize(14).font('Helvetica-Bold').fillColor('#000').text('Szerződés Összegzése');
      doc.moveDown(0.5);

      doc.rect(doc.x, doc.y, 500, 180).stroke('#ddd');
      doc.moveDown(0.5);

      const tableX = 60;
      const labelWidth = 150;
      const valueX = tableX + labelWidth;

      doc.fontSize(10).font('Helvetica').fillColor('#333');

      doc.text('Biztosított név:', tableX, doc.y);
      doc.fontSize(10).font('Helvetica-Bold').text(data.userName, valueX, doc.y - 15);

      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').text('Biztosítás típusa:', tableX, doc.y);
      doc.font('Helvetica-Bold').text(data.insuranceName, valueX, doc.y - 15);

      doc.moveDown(1);
      doc.fontSize(10).font('Helvetica').text('Szerződésszám:', tableX, doc.y);
      doc.font('Helvetica-Bold').text(data.policyNumber, valueX, doc.y - 15);

      if (data.provider) {
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica').text('Biztosító:', tableX, doc.y);
        doc.font('Helvetica-Bold').text(data.provider, valueX, doc.y - 15);
      }

      if (data.coverageType) {
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica').text('Fedezet típusa:', tableX, doc.y);
        doc.font('Helvetica-Bold').text(data.coverageType, valueX, doc.y - 15);
      }

      if (data.monthlyPremium) {
        doc.moveDown(1);
        doc.fontSize(10).font('Helvetica').text('Havi díj:', tableX, doc.y);
        doc.font('Helvetica-Bold').text(data.monthlyPremium, valueX, doc.y - 15);
      }

      doc.moveDown(2);

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('Hatályossági Időszak');
      doc.moveDown(0.5);

      doc.rect(doc.x, doc.y, 500, 70).stroke('#ddd');
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica').text('Kezdő dátum:', tableX, doc.y);
      doc.font('Helvetica-Bold').text(data.startDate || 'Nem meghatározott', valueX, doc.y - 15);

      doc.moveDown(1.5);
      doc.fontSize(10).font('Helvetica').text('Végzési dátum:', tableX, doc.y);
      doc.font('Helvetica-Bold').text(data.endDate || 'Nem meghatározott', valueX, doc.y - 15);

      doc.moveDown(2);

      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000').text('Fontos Információk');
      doc.moveDown(0.5);

      doc.fontSize(9).font('Helvetica').fillColor('#555').text(
        'Ez a dokumentum a biztosítási szerződés összegzése. A teljes feltételeket és jogokat a biztosítási szabályzatban találja meg. Ez a dokumentum kizárólag személyes használatra van szánt. Kérjük, őrizze meg biztonságosan.',
        { align: 'left', width: 520 }
      );

      doc.moveDown(1);

      doc.fontSize(8).font('Helvetica').fillColor('#999').text('Ez az e-mail automatikusan generálódott. Kérjük, ne válaszoljon erre az e-mailre.', {
        align: 'center',
        width: 520,
      });

      doc.moveDown(1);

      doc.fontSize(8).fillColor('#ccc').text('---', { align: 'center' });
      doc.moveDown(0.3);
      doc.text('Kiadás Figyelő | © 2024 | Minden jog fenntartva', { align: 'center' });

      if (data.documentNumber) {
        doc.fontSize(7).fillColor('#ddd').text(`Dokumentum szám: ${data.documentNumber}`, { align: 'right' });
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
