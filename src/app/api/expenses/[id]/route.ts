import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('auth_token')?.value;

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

    const { id } = await context.params;
    const expenseId = parseInt(id, 10);

    if (isNaN(expenseId)) {
      return NextResponse.json(
        { error: 'Érvénytelen kiadás ID' },
        { status: 400 }
      );
    }

    const expenseResults = await query(
      'SELECT felhasznalo_id FROM kiadasok WHERE id = ?',
      [expenseId]
    );

    if (!Array.isArray(expenseResults) || expenseResults.length === 0) {
      return NextResponse.json(
        { error: 'Kiadás nem található' },
        { status: 404 }
      );
    }

    const expense = expenseResults[0] as any;

    if (expense.felhasznalo_id !== decoded.userId) {
      return NextResponse.json(
        { error: 'Nincs jogosultságod ezt a kiadást törölni' },
        { status: 403 }
      );
    }

    await query('DELETE FROM kiadasok WHERE id = ?', [expenseId]);

    return NextResponse.json(
      { message: 'Kiadás sikeresen törölve' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Expense deletion error:', error);
    return NextResponse.json(
      { error: 'Hiba a kiadás t��rléssekor' },
      { status: 500 }
    );
  }
}
