import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Public endpoint for content
  
  const searchParams = request.nextUrl.searchParams
  const pageId = searchParams.get('pageId')
  
  if (pageId) {
    const content = await prisma.content.findUnique({ where: { pageId } })
    return NextResponse.json(content)
  }
  
  const contents = await prisma.content.findMany()
  return NextResponse.json(contents)
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const { pageId, content } = await request.json()
    
    const updated = await prisma.content.upsert({
      where: { pageId },
      update: { content },
      create: { pageId, content }
    })
    
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
