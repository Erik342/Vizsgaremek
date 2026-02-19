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

    // Try to create inbox_messages table if it doesn't exist
    try {
      await query(`CREATE TABLE IF NOT EXISTS inbox_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message LONGTEXT NOT NULL,
        icon VARCHAR(50),
        is_read BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        KEY idx_user_id (user_id),
        KEY idx_created_at (created_at),
        CONSTRAINT fk_inbox_messages_user FOREIGN KEY (user_id) REFERENCES felhasznalok(id) ON DELETE CASCADE
      )`);
    } catch (tableError) {
      // Table might already exist, that's fine
      console.warn('Table creation skipped or already exists:', tableError instanceof Error ? tableError.message : String(tableError));
    }

    return NextResponse.json({
      success: true,
      message: 'Adatbázis inicializálása kész'
    });
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Hiba az adatbázis inicializálásakor', details: String(error) },
      { status: 500 }
    );
  }
}
