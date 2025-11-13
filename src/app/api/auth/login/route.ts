import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, jelszo } = await request.json();

    if (!email || !jelszo) {
      return NextResponse.json(
        { error: 'Kérjük töltsd ki az összes mezőt' },
        { status: 400 }
      );
    }

    const results = await query('SELECT id, nev, email, jelszo, szerep FROM felhasznalok WHERE email = ?', [email]);

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Helytelen email vagy jelszó' },
        { status: 401 }
      );
    }

    const user = results[0] as any;
    const passwordMatch = await verifyPassword(jelszo, user.jelszo);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: 'Helytelen email vagy jelszó' },
        { status: 401 }
      );
    }

    const token = generateToken(user.id, user.email, user.szerep);

    const response = NextResponse.json(
      {
        message: 'Sikeres bejelentkezés',
        token,
        user: { id: user.id, nev: user.nev, email: user.email, szerep: user.szerep },
      },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Hiba a bejelentkezésnél' },
      { status: 500 }
    );
  }
}
