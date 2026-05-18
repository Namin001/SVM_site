import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { writeFile, unlink } from 'fs/promises'
import path from 'path'
import { existsSync, mkdirSync } from 'fs'

const PAGE_ID = 'home_banner_images'

export async function GET(request: NextRequest) {
  // Public endpoint for banners
  
  try {
    const record = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    if (!record) {
      return NextResponse.json([])
    }
    return NextResponse.json(JSON.parse(record.content))
  } catch (error) {
    return NextResponse.json([])
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

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'banner')
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true })
    }

    const filename = `banner_${Date.now()}_${file.name.replace(/\s+/g, '_')}`
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)
    
    const imagePath = `/uploads/banner/${filename}`

    // Update Content record
    let record = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    let images: string[] = []
    
    if (record) {
      images = JSON.parse(record.content)
      images.push(imagePath)
      await prisma.content.update({
        where: { pageId: PAGE_ID },
        data: { content: JSON.stringify(images) }
      })
    } else {
      images = [imagePath]
      await prisma.content.create({
        data: {
          pageId: PAGE_ID,
          content: JSON.stringify(images)
        }
      })
    }
    
    return NextResponse.json(images)
  } catch (error: any) {
    console.error('Home banner upload error:', error)
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const { imagePath } = await request.json()
    if (!imagePath) {
      return NextResponse.json({ error: 'Image path required' }, { status: 400 })
    }

    // Delete file
    const fullPath = path.join(process.cwd(), 'public', imagePath)
    try {
      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }
    } catch (e) {
      console.warn('Could not delete file from disk:', fullPath)
    }

    // Update Content record
    const record = await prisma.content.findUnique({ where: { pageId: PAGE_ID } })
    if (record) {
      let images: string[] = JSON.parse(record.content)
      images = images.filter(img => img !== imagePath)
      await prisma.content.update({
        where: { pageId: PAGE_ID },
        data: { content: JSON.stringify(images) }
      })
      return NextResponse.json(images)
    }
    
    return NextResponse.json([])
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
