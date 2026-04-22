import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendRegistrationEmail } from '@/lib/email';
import { generateVerificationToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email szükséges' },
        { status: 400 }
      );
    }

    const results = await query('SELECT id, nev FROM felhasznalok WHERE email = ?', [email]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      );
    }

    const user = results[0] as any;
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await query(
      'UPDATE felhasznalok SET verification_token = ?, verification_token_expires = ? WHERE id = ?',
      [verificationToken, expiresAt, user.id]
    );

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

    const emailResult = await sendRegistrationEmail({
      email,
      userName: user.nev,
      verificationLink,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || 'Hiba az email küldésekor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Verifikációs email elküldve' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Hiba a verifikációs email küldésekor' },
      { status: 500 }
    );
  }
}
