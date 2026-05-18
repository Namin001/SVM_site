import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/auth'
import { writeFile } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const teachers = await prisma.$queryRawUnsafe(`
      SELECT id, username, role, name, gender, dob, stream, contactDetails, 
             maritalStatus, ugDegree, ugStream, certificatePath, pgDetails, bedStatus, createdAt
      FROM User
      WHERE role = 'TEACHER'
      ORDER BY createdAt DESC
    `);
    
    return NextResponse.json(teachers)
  } catch (error) {
    console.error('Error fetching teachers:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  
  try {
    const formData = await request.formData()
    
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const name = formData.get('name') as string
    const dob = formData.get('dob') as string
    const gender = formData.get('gender') as string
    const stream = formData.get('stream') as string
    const contactDetails = formData.get('contactDetails') as string
    const maritalStatus = formData.get('maritalStatus') as string
    const ugDegree = formData.get('ugDegree') as string
    const ugStream = formData.get('ugStream') as string
    const pgDetails = formData.get('pgDetails') as string
    const bedStatus = formData.get('bedStatus') as string
    const certificateFile = formData.get('certificate') as File

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    }

    // Check if user exists
    const existing: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM User WHERE username = ? LIMIT 1`, username);
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    const hash = await bcrypt.hash(password, 10)
    
    // Handle Certificate Upload
    let certificatePath = ''
    if (certificateFile && certificateFile.size > 0) {
      const bytes = await certificateFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `cert_${Date.now()}_${certificateFile.name.replace(/\s+/g, '_')}`
      const uploadDir = path.join(process.cwd(), 'public/uploads')
      await writeFile(path.join(uploadDir, filename), buffer)
      certificatePath = `/uploads/${filename}`
    }
    
    const newId = `teacher_${Math.random().toString(36).substring(2, 11)}`;
    const now = new Date();

    // Use Raw SQL for insertion to match existing pattern
    await prisma.$executeRawUnsafe(
        `INSERT INTO User (
            id, username, password, role, name, dob, gender, stream, 
            contactDetails, maritalStatus, ugDegree, ugStream, 
            certificatePath, pgDetails, bedStatus, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        newId, 
        username, 
        hash, 
        'TEACHER', 
        name || null, 
        dob || null, 
        gender || null, 
        stream || null, 
        contactDetails || null, 
        maritalStatus || null, 
        ugDegree || null, 
        ugStream || null, 
        certificatePath || null, 
        pgDetails || null, 
        bedStatus || null, 
        now
    );
    
    return NextResponse.json({ id: newId, username, name });
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
