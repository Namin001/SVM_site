import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const PAGE_ID = 'admissions_banner_image'

export async function GET() {
  try {
    const record = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    return NextResponse.json({ url: record ? record.content : '/admission_hero.jpg' })
  } catch (error) {
    return NextResponse.json({ url: '/admission_hero.jpg' })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No image uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'admissions')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    // Clean up old file if it exists
    const oldRecord = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    if (oldRecord && oldRecord.content.startsWith('/uploads/admissions/')) {
        const oldPath = path.join(process.cwd(), 'public', oldRecord.content)
        try {
            if (existsSync(oldPath)) await unlink(oldPath)
        } catch (e) {}
    }

    const filename = `admission_${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    const imagePath = `/uploads/admissions/${filename}`

    await prisma.content.upsert({
      where: { pageId: PAGE_ID },
      update: { content: imagePath },
      create: { pageId: PAGE_ID, content: imagePath }
    })
    
    return NextResponse.json({ url: imagePath })
  } catch (error: any) {
    console.error('Admissions banner upload error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}
