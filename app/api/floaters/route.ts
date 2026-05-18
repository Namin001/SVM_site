import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

const PAGE_ID = 'home_floaters'

export async function GET(request: NextRequest) {
  try {
    const record = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    if (!record) {
      // Default settings
      return NextResponse.json({
        enabled: false,
        message: 'Welcome to SVM! admissions are open.',
        link: '/admissions',
        type: 'info' // 'info', 'warning', 'success'
      })
    }
    return NextResponse.json(JSON.parse(record.content))
  } catch (error) {
    return NextResponse.json({ enabled: false, message: '' })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const data = await request.json()
    
    const record = await prisma.content.upsert({
      where: { pageId: PAGE_ID },
      update: { content: JSON.stringify(data) },
      create: {
        pageId: PAGE_ID,
        content: JSON.stringify(data)
      }
    })
    
    return NextResponse.json({ success: true, data: JSON.parse(record.content) })
  } catch (error) {
    console.error('Floater update error:', error)
    return NextResponse.json({ error: 'Failed to update floater settings' }, { status: 500 })
  }
}
