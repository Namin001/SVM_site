import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ groupId: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { groupId } = await params;

  try {
    // Authorization check using RAW SQL for stability
    const rawMembership: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM GroupMember WHERE groupId = ? AND userId = ? LIMIT 1`,
        groupId, session.id
    );
    const membership = rawMembership[0];
    
    if (!membership && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Force RAW SQL for messages to bypass stale Prisma client validation
    const messages: any[] = await prisma.$queryRawUnsafe(`
        SELECT m.*, u.name as authorName, u.role as authorRole, u.username as authorUsername
        FROM Message m
        JOIN User u ON m.authorId = u.id
        WHERE m.groupId = ?
        ORDER BY m.createdAt DESC
    `, groupId);

    const enrichedMessages = messages.map(m => {
        const isDeleted = Boolean(m.isDeleted);
        const isAdmin = session.role === 'ADMIN';

        if (isDeleted && !isAdmin) {
            return {
                id: m.id,
                content: "This message was unsent",
                authorId: m.authorId,
                groupId: m.groupId,
                createdAt: m.createdAt,
                isDeleted: true,
                attachmentPath: null,
                attachmentType: null,
                author: { name: m.authorName, role: m.authorRole, username: m.authorUsername }
            };
        }

        return {
            ...m,
            isDeleted,
            author: { name: m.authorName, role: m.authorRole, username: m.authorUsername }
        };
    });

    return NextResponse.json(enrichedMessages);
  } catch (err: any) {
    console.error('Message GET error:', err);
    return NextResponse.json({ error: 'Failed', details: err.message }, { status: 500 });
  }
}

import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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
    // Authorization check
    const rawMembership: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM GroupMember WHERE groupId = ? AND userId = ? LIMIT 1`,
        groupId, session.id
    );
    const membership = rawMembership[0];
    
    if (!membership && session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') || '';
    let content = '';
    let attachmentPath = '';
    let attachmentType = '';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      content = formData.get('content') as string;
      const file = formData.get('file') as File;

      if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        const uploadDir = path.join(process.cwd(), 'public/uploads/forum');
        try { await mkdir(uploadDir, { recursive: true }); } catch (e) {}

        const filename = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
        await writeFile(path.join(uploadDir, filename), buffer);
        attachmentPath = `/uploads/forum/${filename}`;
        attachmentType = file.type;
      }
    } else {
      const json = await request.json();
      content = json.content;
    }

    if (!content && !attachmentPath) {
      return NextResponse.json({ error: 'Message content or attachment is required' }, { status: 400 })
    }

    // Force RAW SQL for messaging to bypass stale Prisma client validation
    const id = `cl${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date().toISOString();
    
    await prisma.$executeRawUnsafe(
        `INSERT INTO Message (id, content, groupId, authorId, createdAt, attachmentPath, attachmentType, className, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id, content || '', groupId, session.id, now, attachmentPath, attachmentType, null, 0
    );
    
    const author: any[] = await prisma.$queryRawUnsafe(`SELECT name, role, username FROM User WHERE id = ?`, session.id);
    
    return NextResponse.json({
        id, content, groupId, authorId: session.id, createdAt: now,
        attachmentPath, attachmentType,
        author: author[0]
    });
  } catch (error: any) {
    console.error('Message POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
