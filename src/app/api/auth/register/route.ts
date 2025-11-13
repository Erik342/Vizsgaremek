import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { nev, email, jelszo } = await request.json();

    if (!nev || !email || !jelszo) {
      return NextResponse.json(
        { error: 'Kérjük töltsd ki az összes mezőt' },
        { status: 400 }
      );
    }

    if (jelszo.length < 6) {
      return NextResponse.json(
        { error: 'A jelszó legalább 6 karakter hosszú legyen' },
        { status: 400 }
      );
    }

    const results = await query('SELECT id FROM felhasznalok WHERE email = ?', [email]);
    
    if (Array.isArray(results) && results.length > 0) {
      return NextResponse.json(
        { error: 'Ez az email már regisztrálva van' },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPassword(jelszo);

    const insertResult = await query(
      'INSERT INTO felhasznalok (nev, email, jelszo, szerep) VALUES (?, ?, ?, ?)',
      [nev, email, hashedPassword, 'user']
    );

    const insertedUser = insertResult as any;
    const userId = insertedUser.insertId;

    const token = generateToken(userId, email, 'user');

    const response = NextResponse.json(
      {
        message: 'Sikeres regisztráció',
        token,
        user: { id: userId, nev, email, szerep: 'user' },
      },
      { status: 201 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Hiba a regisztrációnál' },
      { status: 500 }
    );
  }
}
