import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendInsuranceDocumentEmail } from '@/lib/email';
import { verifyToken } from '@/lib/auth';
import { generateInsurancePDF } from '@/lib/pdf';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Autentikáció szükséges' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    const { insuranceId } = await request.json();

    if (!insuranceId) {
      return NextResponse.json(
        { error: 'Insurance ID szükséges' },
        { status: 400 }
      );
    }

    const userResults = await query(
      'SELECT id, nev, email FROM felhasznalok WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      );
    }

    const user = userResults[0] as any;

    const insuranceResults = await query(
      'SELECT id, tipus, havi_dij FROM biztositasi_szerzodesek WHERE id = ? AND felhasznalo_id = ?',
      [insuranceId, decoded.userId]
    );

    if (!Array.isArray(insuranceResults) || insuranceResults.length === 0) {
      return NextResponse.json(
        { error: 'Biztosítás nem található' },
        { status: 404 }
      );
    }

    const insurance = insuranceResults[0] as any;

    let pdfBuffer: Buffer | undefined;
    try {
      pdfBuffer = await generateInsurancePDF({
        userName: user.nev,
        insuranceName: insurance.tipus,
        policyNumber: `POL-${insurance.id}`,
        monthlyPremium: insurance.havi_dij ? `${insurance.havi_dij} Ft` : undefined,
        documentNumber: `BIZ-${insurance.id}-${Date.now()}`,
      });
    } catch (pdfError) {
      console.error('PDF generation error:', pdfError);
      return NextResponse.json(
        { error: 'Hiba a PDF dokumentum generálásakor' },
        { status: 500 }
      );
    }

    const emailResult = await sendInsuranceDocumentEmail({
      email: user.email,
      userName: user.nev,
      insuranceId: insurance.id,
      insuranceName: insurance.tipus,
      policyNumber: `POL-${insurance.id}`,
      documentPDF: pdfBuffer,
      monthlyPremium: insurance.havi_dij ? `${insurance.havi_dij} Ft` : undefined,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Hiba az email küldésekor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Biztosítási dokumentum email elküldve' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Insurance document email error:', error);
    return NextResponse.json(
      { error: 'Hiba az email küldésekor' },
      { status: 500 }
    );
  }
}
