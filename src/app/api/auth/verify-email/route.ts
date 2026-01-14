import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token szükséges' },
        { status: 400 }
      );
    }

    const results = await query(
      'SELECT id, nev, email FROM felhasznalok WHERE verification_token = ? AND verification_token_expires > NOW()',
      [token]
    );

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Érvénytelen vagy lejárt token' },
        { status: 400 }
      );
    }

    const user = results[0] as any;

    await query(
      'UPDATE felhasznalok SET email_verified = true, verification_token = NULL, verification_token_expires = NULL WHERE id = ?',
      [user.id]
    );

    return NextResponse.json(
      { message: 'Email sikeresen verifikálva', user: { id: user.id, nev: user.nev, email: user.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Hiba az email verifikációnál' },
      { status: 500 }
    );
  }
}
