import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { groupId } = await params;

  try {
    const now = new Date().toISOString();
    
    // Update lastReadAt for this user in this group
    await prisma.$executeRawUnsafe(
        `UPDATE GroupMember SET lastReadAt = ? WHERE groupId = ? AND userId = ?`,
        now, groupId, session.id
    );

    return NextResponse.json({ success: true, lastReadAt: now });
  } catch (error: any) {
    console.error('Mark as read error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
