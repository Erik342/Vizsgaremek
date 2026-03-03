import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword, generateToken, generateVerificationToken } from '@/lib/auth';
import { sendRegistrationEmail, sendWelcomeEmail } from '@/lib/email';

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
    const verificationToken = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const insertResult = await query(
      'INSERT INTO felhasznalok (nev, email, jelszo, szerep, verification_token, verification_token_expires, email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nev, email, hashedPassword, 'user', verificationToken, expiresAt, false]
    );

    const insertedUser = insertResult as any;
    const userId = insertedUser.insertId;

    const token = generateToken(userId, email, 'user');

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${verificationToken}`;

    const emailResult = await sendRegistrationEmail({
      email,
      userName: nev,
      verificationLink,
    });

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
    }

    // Send welcome email
    const welcomeResult = await sendWelcomeEmail({
      email,
      userName: nev,
    });

    if (!welcomeResult.success) {
      console.error('Failed to send welcome email:', welcomeResult.error);
    }

    const response = NextResponse.json(
      {
        message: 'Sikeres regisztráció. Ellenőrizd az emailedet a fiók aktiválásához.',
        token,
        user: {
          id: userId,
          nev,
          email,
          szerep: 'user',
          currency: 'HUF',
          location: null,
          profile_picture: null,
          has_completed_onboarding: false,
        },
        emailSent: emailResult.success,
        welcomeEmailSent: welcomeResult.success,
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
