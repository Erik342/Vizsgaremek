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

    // Ensure inbox_messages table exists with correct structure
    try {
      // Drop and recreate table to ensure correct structure (for development)
      await query('DROP TABLE IF EXISTS inbox_messages');

      await query(`CREATE TABLE inbox_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        icon VARCHAR(50),
        is_read INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_created_at (created_at)
      )`);

      console.log('inbox_messages table recreated successfully');
    } catch (tableError) {
      console.error('Table creation error:', tableError instanceof Error ? tableError.message : String(tableError));
    }

    // Get all user IDs
    const allUsers = await query('SELECT id FROM felhasznalok');

    if (!Array.isArray(allUsers) || allUsers.length === 0) {
      return NextResponse.json({ success: true, count: 0 });
    }

    let successCount = 0;
    let failedCount = 0;
    const failedUserIds: number[] = [];

    console.log(`Broadcasting message to ${allUsers.length} users. Type: ${type}, Title: ${title}`);

    // Insert message for each user with error handling
    for (const userRow of allUsers) {
      const userData = userRow as any;
      try {
        const result = await query(
          `INSERT INTO inbox_messages (user_id, type, title, message, icon, is_read)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [userData.id, type, title, message, icon || null]
        );

        successCount++;
        console.log(`Message sent to user ${userData.id}`, result);
      } catch (userError) {
        failedCount++;
        failedUserIds.push(userData.id);
        console.error(`Failed to send message to user ${userData.id}:`, userError instanceof Error ? userError.message : String(userError));
      }
    }

    console.log(`Broadcast complete. Success: ${successCount}, Failed: ${failedCount}`);

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
