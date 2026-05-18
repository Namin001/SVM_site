import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string, messageId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId, messageId } = await params;

  try {
    // 1. Fetch message via RAW SQL to verify ownership
    const rawMessage: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM Message WHERE id = ? AND groupId = ? LIMIT 1`,
        messageId, groupId
    );
    const message = rawMessage[0];

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 })
    }

    // 2. Authorization: Author or Admin
    if (message.authorId !== session.id && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Perform Soft Delete (Unsend) via RAW SQL
    await prisma.$executeRawUnsafe(
        `UPDATE Message SET isDeleted = 1 WHERE id = ?`,
        messageId
    );

    return NextResponse.json({ success: true, messageId });
  } catch (error: any) {
    console.error('Message Unsend error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
