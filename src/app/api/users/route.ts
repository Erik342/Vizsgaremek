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

export async function PUT(request: NextRequest) {
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

    const { userId, szerep } = await request.json();

    if (!userId || !szerep || !['user', 'admin'].includes(szerep)) {
      return NextResponse.json(
        { error: 'Érvénytelen adatok' },
        { status: 400 }
      );
    }

    const userResults = await query('SELECT szerep FROM felhasznalok WHERE id = ?', [userId]);

    if (!Array.isArray(userResults) || userResults.length === 0) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      );
    }

    const targetUser = userResults[0] as any;
    if (targetUser.szerep === 'admin' && szerep !== 'admin') {
      return NextResponse.json(
        { error: 'Admin felhasználókat nem lehet átállítani' },
        { status: 403 }
      );
    }

    await query('UPDATE felhasznalok SET szerep = ? WHERE id = ?', [szerep, userId]);

    return NextResponse.json(
      { message: 'Szerep sikeresen frissítve' },
      { status: 200 }
    );
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json(
      { error: 'Hiba a felhasználó frissítésekor' },
      { status: 500 }
    );
  }
}
