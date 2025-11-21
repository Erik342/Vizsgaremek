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

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    const results = await query(
      'SELECT id, nev, tipus, osszeg, letrehozasi_ido FROM kiadasok WHERE felhasznalo_id = ? ORDER BY letrehozasi_ido DESC',
      [decoded.userId]
    );

    return NextResponse.json(
      { expenses: results || [] },
      { status: 200 }
    );
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json(
      { error: 'Hiba a kiadások betöltésekor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs hitelesítés' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    const { nev, tipus, osszeg } = await request.json();

    if (!nev || !tipus || osszeg === undefined || osszeg === null) {
      return NextResponse.json(
        { error: 'Kérjük töltsd ki az összes mezőt' },
        { status: 400 }
      );
    }

    if (typeof osszeg !== 'number' || osszeg <= 0) {
      return NextResponse.json(
        { error: 'Az összeg pozitív szám kell hogy legyen' },
        { status: 400 }
      );
    }

    const insertResult = await query(
      'INSERT INTO kiadasok (felhasznalo_id, nev, tipus, osszeg) VALUES (?, ?, ?, ?)',
      [decoded.userId, nev, tipus, osszeg]
    );

    return NextResponse.json(
      { message: 'Kiadás sikeresen hozzáadva', id: (insertResult as any).insertId },
      { status: 201 }
    );
  } catch (error) {
    console.error('Expense creation error:', error);
    return NextResponse.json(
      { error: 'Hiba a kiadás hozzáadásakor' },
      { status: 500 }
    );
  }
}
