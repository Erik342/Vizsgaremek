import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

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

    const { profilePicture, currency, location } = await request.json();

    if (!currency) {
      return NextResponse.json(
        { error: 'Pénznem szükséges' },
        { status: 400 }
      );
    }

    // Validate currency
    if (!['USD', 'EUR', 'HUF'].includes(currency)) {
      return NextResponse.json(
        { error: 'Érvénytelen pénznem' },
        { status: 400 }
      );
    }

    // Update user profile
    await query(
      'UPDATE felhasznalok SET currency = ?, location = ?, profile_picture = ?, has_completed_onboarding = true WHERE id = ?',
      [currency, location || null, profilePicture || null, decoded.userId]
    );

    return NextResponse.json(
      { message: 'Onboarding sikeresen befejezve' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Hiba az onboarding mentésekor' },
      { status: 500 }
    );
  }
}
