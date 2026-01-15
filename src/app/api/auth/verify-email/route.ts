import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(
        new URL('/verify-email?error=Token szükséges', request.url)
      );
    }

    const results = await query(
      'SELECT id, nev, email FROM felhasznalok WHERE verification_token = ? AND verification_token_expires > NOW()',
      [token]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.redirect(
        new URL('/verify-email?error=Érvénytelen vagy lejárt token', request.url)
      );
    }

    const user = results[0] as any;

    await query(
      'UPDATE felhasznalok SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );

    // Redirect to the verification success page with token so it can display the result
    return NextResponse.redirect(
      new URL(`/verify-email?token=${token}&success=true`, request.url)
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.redirect(
      new URL('/verify-email?error=Hiba az email verifikációnál', request.url)
    );
  }
}
