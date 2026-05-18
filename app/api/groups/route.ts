import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    if ((prisma as any).group) {
        const groups = await (prisma as any).group.findMany({
            where: session.role === 'ADMIN' ? {} : {
              members: {
                some: {
                  userId: session.id
                }
              }
            },
            include: {
              _count: {
                select: { members: true }
              },
              members: {
                where: { userId: session.id },
                take: 1
              },
              messages: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                  author: { select: { name: true, username: true } }
                }
              }
            }
          })
          
          // Sort groups by latest message createdAt
          const sortedGroups = groups.map((g: any) => {
            const memberInfo = g.members?.[0];
            const lastReadAt = memberInfo?.lastReadAt;
            let unreadCount = 0;
            if (session.role !== 'ADMIN' && lastReadAt) {
                unreadCount = g.messages.filter((m: any) => new Date(m.createdAt) > new Date(lastReadAt) && m.authorId !== session.id).length;
            }
            
            // Get latest message timestamp for sorting
            const latestMsgDate = g.messages.length > 0 
              ? new Date(g.messages[0].createdAt).getTime() 
              : new Date(g.createdAt).getTime();

            return { ...g, unreadCount, latestMsgDate };
          }).sort((a: any, b: any) => b.latestMsgDate - a.latestMsgDate);

          const processedGroups = sortedGroups.map((g: any) => {
            const messages = g.messages.length > 0 ? [g.messages[0]] : [];
            return { ...g, messages };
          });

          return NextResponse.json(processedGroups)
    } else {
        // Fallback to RAW SQL with proper sorting by latest message
        const groups: any[] = session.role === 'ADMIN' 
            ? await prisma.$queryRawUnsafe(`
                SELECT g.*, 
                (SELECT MAX(createdAt) FROM Message WHERE groupId = g.id) as lastMessageAt
                FROM "Group" g
                ORDER BY COALESCE(lastMessageAt, g.createdAt) DESC
            `)
            : await prisma.$queryRawUnsafe(`
                SELECT g.*, gm.lastReadAt,
                (SELECT MAX(createdAt) FROM Message WHERE groupId = g.id) as lastMessageAt
                FROM "Group" g
                JOIN GroupMember gm ON g.id = gm.groupId
                WHERE gm.userId = ?
                ORDER BY COALESCE(lastMessageAt, g.createdAt) DESC
            `, session.id);
        
        // Enrich with counts (simplified for fallback)
        for (const g of groups) {
            const memberCount: any[] = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM GroupMember WHERE groupId = ?`, g.id);
            g._count = { members: Number(memberCount[0].count) };
            
            // Calculate unread count for non-admins
            if (session.role !== 'ADMIN' && g.lastReadAt) {
                const unread: any[] = await prisma.$queryRawUnsafe(
                    `SELECT COUNT(*) as count FROM Message WHERE groupId = ? AND createdAt > ? AND authorId != ?`,
                    g.id, g.lastReadAt, session.id
                );
                g.unreadCount = Number(unread[0].count);
            } else {
                g.unreadCount = 0;
            }

            const lastMsg: any[] = await prisma.$queryRawUnsafe(`
                SELECT m.*, u.name as authorName, u.username as authorUsername 
                FROM Message m
                JOIN User u ON m.authorId = u.id
                WHERE m.groupId = ?
                ORDER BY m.createdAt DESC
                LIMIT 1
            `, g.id);
            
            if (lastMsg[0]) {
                g.messages = [{
                    ...lastMsg[0],
                    author: { name: lastMsg[0].authorName, username: lastMsg[0].authorUsername }
                }];
            } else {
                g.messages = [];
            }
        }
        return NextResponse.json(groups);
    }
  } catch (err: any) {
    console.error('Group GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch groups', details: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const { name, description, memberIds } = await request.json()
    
    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 })
    }

    // Deduplicate and ensure creator is not added twice
    const uniqueMemberIds = Array.from(new Set([
        ...(memberIds || []).filter((id: string) => id !== session.id)
    ]));

    if ((prisma as any).group) {
        const group = await (prisma as any).group.create({
            data: {
              name,
              description,
              createdById: session.id,
              members: {
                create: [
                  { userId: session.id, role: 'ADMIN' },
                  ...uniqueMemberIds.map((userId: string) => ({ userId }))
                ]
              }
            },
            include: {
              members: true
            }
          })
          return NextResponse.json(group)
    } else {
        // Fallback to RAW SQL
        const groupId = `cl${Math.random().toString(36).substring(2, 11)}`;
        const now = new Date().toISOString();
        
        await prisma.$executeRawUnsafe(
            `INSERT INTO "Group" (id, name, description, createdAt, createdById) VALUES (?, ?, ?, ?, ?)`,
            groupId, name, description || '', now, session.id
        );
        
        // Add creator
        await prisma.$executeRawUnsafe(
            `INSERT INTO GroupMember (id, groupId, userId, role) VALUES (?, ?, ?, ?)`,
            `cl${Math.random().toString(36).substring(2, 11)}`, groupId, session.id, 'ADMIN'
        );
        
        // Add members
        for (const userId of uniqueMemberIds) {
            await prisma.$executeRawUnsafe(
                `INSERT INTO GroupMember (id, groupId, userId, role) VALUES (?, ?, ?, ?)`,
                `cl${Math.random().toString(36).substring(2, 11)}`, groupId, userId, 'MEMBER'
            );
        }
        
        return NextResponse.json({ id: groupId, name, description, members: uniqueMemberIds.length + 1 });
    }
  } catch (error: any) {
    console.error('Error creating group:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
