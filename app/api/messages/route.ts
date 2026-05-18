import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const className = searchParams.get('className')

  // Authorization check: 
  // Admin can see any class.
  // Parents/Teachers can only see their own assigned class.
  if (session.role !== 'ADMIN' && session.className !== className) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!className) {
    return NextResponse.json({ error: 'Class Name is required' }, { status: 400 })
  }

  const messages = await prisma.message.findMany({
    where: { className },
    orderBy: { createdAt: 'asc' },
    include: {
      author: {
        select: { name: true, role: true, username: true }
      }
    }
  })

  return NextResponse.json(messages)
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { content, className } = await request.json()

    if (!content || !className) {
      return NextResponse.json({ error: 'Message and Class Name required' }, { status: 400 })
    }

    // Role check: Admin can message anywhere. Others only their assigned class.
    if (session.role !== 'ADMIN' && session.className !== className) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const newMessage = await prisma.message.create({
      data: {
        content,
        className,
        authorId: session.id
      },
      include: {
        author: {
          select: { name: true, role: true, username: true }
        }
      }
    })

    return NextResponse.json(newMessage)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
