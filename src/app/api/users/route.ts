import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs hitelesítés' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Nem vagy admin' },
        { status: 403 }
      );
    }

    const results = await query(
      'SELECT id, nev, email, letrehozasi_ido, szerep FROM felhasznalok ORDER BY letrehozasi_ido DESC'
    );

    return NextResponse.json(
      { users: results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a felhasználók betöltésekor' },
      { status: 500 }
    );
  }
}
