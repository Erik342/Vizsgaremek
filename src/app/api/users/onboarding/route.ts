import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    console.debug('onboarding token extracted', token ? 'present' : 'missing');

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs hitelesítés' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    console.debug('onboarding token decoded', decoded);

    if (!decoded) {
      return NextResponse.json(
        { error: 'Érvénytelen token' },
        { status: 401 }
      );
    }

    // Validate decoded token has userId
    if (!decoded.userId) {
      console.error('Token decoded but userId is missing:', decoded);
      return NextResponse.json(
        { error: 'Érvénytelen token adatok' },
        { status: 401 }
      );
    }

    let requestBody;
    try {
      requestBody = await request.json();
      // log the incoming body for debugging - remove in production
      console.debug('onboarding request body', requestBody);
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: 'Érvénytelen kérés formátuma' },
        { status: 400 }
      );
    }

    const { profilePicture, currency, location } = requestBody;

    if (!currency) {
      console.warn('onboarding request missing currency', { requestBody, decoded });
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
    try {
      await query(
        'UPDATE felhasznalok SET currency = ?, location = ?, profile_picture = ?, has_completed_onboarding = true WHERE id = ?',
        [currency, location || null, profilePicture || null, decoded.userId]
      );
    } catch (dbError) {
      console.error('Database update failed:', {
        error: dbError instanceof Error ? dbError.message : String(dbError),
        userId: decoded.userId,
        currency,
      });
      return NextResponse.json(
        { error: 'Adatbázis frissítési hiba' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Onboarding sikeresen befejezva' },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Onboarding error:', {
      message: errorMessage,
      type: error instanceof Error ? error.constructor.name : typeof error,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Hiba az onboarding mentésekor' },
      { status: 500 }
    );
  }
}
