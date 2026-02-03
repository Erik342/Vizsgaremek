import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
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

    const { type, title, message, icon } = await request.json();

    if (!type || !title || !message) {
      return NextResponse.json(
        { error: 'Hiányzó paraméterek: type, title, message szükséges' },
        { status: 400 }
      );
    }

    if (!['welcome', 'feature', 'notification', 'update'].includes(type)) {
      return NextResponse.json(
        { error: 'Érvénytelen type. Lehetséges: welcome, feature, notification, update' },
        { status: 400 }
      );
    }

    // Get all user IDs
    const allUsers = await query('SELECT id FROM felhasznalok');

    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let successCount = 0;
    let failedCount = 0;
    const failedUserIds: number[] = [];

    // Insert message for each user with error handling
    for (const userRow of allUsers) {
      const userData = userRow as any;
      try {
        const result = await query(
          `INSERT INTO inbox_messages (user_id, type, title, message, icon, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, false, NOW())`,
          [userData.id, type, title, message, icon || null]
        );

        if (result) {
          successCount++;
        }
      } catch (userError) {
        failedCount++;
        failedUserIds.push(userData.id);
        console.error(`Failed to send message to user ${userData.id}:`, userError);
      }
    }

    const response = {
      success: true,
      count: successCount,
      total: allUsers.length,
      failed: failedCount,
      message: `Üzenet sikeresen elküldve ${successCount}/${allUsers.length} felhasználónak`,
    };

    if (failedCount > 0) {
      response.message += ` (${failedCount} felhasználó felé nem sikerült)`;
      console.warn(`Broadcast partially failed. Failed user IDs:`, failedUserIds);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Broadcast error:', error);
    return NextResponse.json(
      { error: 'Hiba az üzenet küldésekor', details: String(error) },
      { status: 500 }
    );
  }
}
