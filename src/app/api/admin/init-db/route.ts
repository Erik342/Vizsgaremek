import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function initializeDatabase() {
  try {
    // Note: This endpoint is intentionally public to allow initial database setup.
    // In production, you should protect this endpoint or run it manually during deployment.

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

    // Add new columns to felhasznalok table if they don't exist
    try {
      await query(`ALTER TABLE felhasznalok ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'HUF'`);
    } catch (e) {
      console.warn('Currency column might already exist');
    }

    try {
      await query(`ALTER TABLE felhasznalok ADD COLUMN IF NOT EXISTS location VARCHAR(255) DEFAULT NULL`);
    } catch (e) {
      console.warn('Location column might already exist');
    }

    try {
      await query(`ALTER TABLE felhasznalok ADD COLUMN IF NOT EXISTS profile_picture LONGTEXT DEFAULT NULL`);
    } catch (e) {
      console.warn('Profile picture column might already exist');
    }


    return {
      success: true,
      message: 'Adatbázis inicializálása kész'
    };
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const result = await initializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Hiba az adatbázis inicializálásakor', details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await initializeDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json(
      { error: 'Hiba az adatbázis inicializálásakor', details: String(error) },
      { status: 500 }
    );
  }
}
