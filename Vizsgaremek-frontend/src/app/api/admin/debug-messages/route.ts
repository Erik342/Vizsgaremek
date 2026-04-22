import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { error: 'Nincs autentikáció' },
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

    // Check if user is admin
    const adminCheck = await query(
      'SELECT szerep FROM felhasznalok WHERE id = ?',
      [decoded.userId]
    );

    if (!Array.isArray(adminCheck) || adminCheck.length === 0) {
      return NextResponse.json(
        { error: 'Felhasználó nem található' },
        { status: 404 }
      );
    }

    const user = adminCheck[0] as any;
    if (user.szerep !== 'admin') {
      return NextResponse.json(
        { error: 'Nincs admin jogosultság' },
        { status: 403 }
      );
    }

    // Get all users
    const allUsers = await query('SELECT id, nev, email FROM felhasznalok');
    
    // Get all messages grouped by user
    const allMessages = await query(`
      SELECT 
        im.id,
        im.user_id,
        im.type,
        im.title,
        im.message,
        im.is_read,
        im.created_at,
        f.nev,
        f.email
      FROM inbox_messages im
      LEFT JOIN felhasznalok f ON im.user_id = f.id
      ORDER BY im.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      totalUsers: Array.isArray(allUsers) ? allUsers.length : 0,
      totalMessages: Array.isArray(allMessages) ? allMessages.length : 0,
      users: Array.isArray(allUsers) ? allUsers : [],
      messages: Array.isArray(allMessages) ? allMessages : [],
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Hiba a debug lekérdezéskor', details: String(error) },
      { status: 500 }
    );
  }
}
