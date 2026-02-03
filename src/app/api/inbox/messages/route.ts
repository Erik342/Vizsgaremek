import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken, extractTokenFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);

    if (!token) {
      return NextResponse.json(
        { messages: [], success: true },
        { status: 200 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { messages: [], success: true },
        { status: 200 }
      );
    }

    const userId = decoded.userId;

    try {
      const messages = await query(
        `SELECT id, type, title, message, icon, is_read as read, created_at as timestamp
         FROM inbox_messages
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT 100`,
        [userId]
      );

      return NextResponse.json({
        messages: Array.isArray(messages) ? messages : [],
        success: true,
      });
    } catch (dbError) {
      console.error('Database error in inbox fetch:', dbError);
      // Return empty messages if database error
      return NextResponse.json({
        messages: [],
        success: true,
      });
    }
  } catch (error) {
    console.error('Inbox fetch error:', error);
    return NextResponse.json(
      { messages: [], success: true },
      { status: 200 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    const userId = decoded.userId;
    const { messageId, action } = await request.json();

    if (!messageId || !action) {
      return NextResponse.json(
        { error: 'Hiányzó paraméterek' },
        { status: 400 }
      );
    }

    if (action === 'mark-read') {
      await query(
        'UPDATE inbox_messages SET is_read = true WHERE id = ? AND user_id = ?',
        [messageId, userId]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      await query(
        'DELETE FROM inbox_messages WHERE id = ? AND user_id = ?',
        [messageId, userId]
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'mark-all-read') {
      await query(
        'UPDATE inbox_messages SET is_read = true WHERE user_id = ?',
        [userId]
      );
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Ismeretlen akció' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Inbox update error:', error);
    return NextResponse.json(
      { error: 'Hiba az üzenet módosításakor' },
      { status: 500 }
    );
  }
}
