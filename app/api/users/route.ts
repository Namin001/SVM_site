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
  
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: 'desc'
    }
  });

  const groups = await prisma.group.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  });
  
  return NextResponse.json({ users, groups })
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
    const role = (formData.get('role') as string) || 'PARENT'
    const name = formData.get('name') as string
    const admissionNo = formData.get('admissionNo') as string
    const age = parseInt(formData.get('age') as string) || 0
    const gender = formData.get('gender') as string
    const className = formData.get('className') as string
    const section = formData.get('section') as string
    const assignedTeacherIds = formData.get('assignedTeacherIds') as string // JSON string array
    const dob = formData.get('dob') as string
    const joiningDate = formData.get('joiningDate') as string
    const subject = formData.get('subject') as string
    
    // New Fields
    const fatherName = formData.get('fatherName') as string
    const motherName = formData.get('motherName') as string
    const religion = formData.get('religion') as string
    const caste = formData.get('caste') as string
    const fatherPhone = formData.get('fatherPhone') as string
    const motherPhone = formData.get('motherPhone') as string

    const groupIdsRaw = formData.get('groupIds') as string // JSON string array of group IDs
    
    const birthCert = formData.get('birthCert') as File
    const aadhar = formData.get('aadhar') as File
    const transferCert = formData.get('transferCert') as File
    const profilePhoto = formData.get('image') as File
    const certificate = formData.get('certificate') as File // Teacher certificate

    // Teacher specific fields
    const stream = formData.get('stream') as string
    const maritalStatus = formData.get('maritalStatus') as string
    const ugDegree = formData.get('ugDegree') as string
    const ugStream = formData.get('ugStream') as string
    const pgDetails = formData.get('pgDetails') as string
    const bedStatus = formData.get('bedStatus') as string
    const contactDetails = formData.get('contactDetails') as string

    const existing = await prisma.user.findUnique({
      where: { username },
      select: { id: true }
    });
    if (existing) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 400 })
    }

    if (admissionNo) {
      const existingAdm = await prisma.user.findUnique({
        where: { admissionNo },
        select: { id: true }
      });
      if (existingAdm) {
        return NextResponse.json({ error: 'Admission Number already exists' }, { status: 400 })
      }
    }

    const hash = await bcrypt.hash(password, 10)
    
    // Handle File Uploads
    let birthCertPath = ''
    let aadharPath = ''
    let transferCertPath = ''
    let imagePath = ''

    const uploadDir = path.join(process.cwd(), 'public/uploads')

    if (birthCert && birthCert.size > 0) {
      const bytes = await birthCert.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `birth_${Date.now()}_${birthCert.name}`
      await writeFile(path.join(uploadDir, filename), buffer)
      birthCertPath = `/uploads/${filename}`
    }

    if (aadhar && aadhar.size > 0) {
      const bytes = await aadhar.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const filename = `aadhar_${Date.now()}_${aadhar.name}`
      await writeFile(path.join(uploadDir, filename), buffer)
      aadharPath = `/uploads/${filename}`
    }

    if (transferCert && transferCert.size > 0) {
        const bytes = await transferCert.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `tc_${Date.now()}_${transferCert.name}`
        await writeFile(path.join(uploadDir, filename), buffer)
        transferCertPath = `/uploads/${filename}`
    }

    if (profilePhoto && profilePhoto.size > 0) {
        const bytes = await profilePhoto.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `profile_${Date.now()}_${profilePhoto.name}`
        await writeFile(path.join(uploadDir, filename), buffer)
        imagePath = `/uploads/${filename}`
    }

    let certificatePath = ''
    if (certificate && certificate.size > 0) {
        const bytes = await certificate.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const filename = `cert_${Date.now()}_${certificate.name}`
        await writeFile(path.join(uploadDir, filename), buffer)
        certificatePath = `/uploads/${filename}`
    }
    
    // Generate manual ID
    const newId = `cli${Math.random().toString(36).substring(2, 11)}`;

    await prisma.user.create({
      data: {
        id: newId,
        username,
        password: hash,
        role: role || 'PARENT',
        name: name || null,
        admissionNo: admissionNo || null,
        age: age || 0,
        gender: gender || 'Male',
        className: className || null,
        section: section || null,
        assignedTeacherIds: assignedTeacherIds || null,
        birthCertPath: birthCertPath || null,
        aadharPath: aadharPath || null,
        transferCertPath: transferCertPath || null,
        dob: dob || null,
        joiningDate: joiningDate || null,
        imagePath: imagePath || null,
        subject: subject || null,
        fatherName: fatherName || null,
        motherName: motherName || null,
        religion: religion || null,
        caste: caste || null,
        fatherPhone: fatherPhone || null,
        motherPhone: motherPhone || null,
        isActive: true,
        stream: stream || null,
        maritalStatus: maritalStatus || null,
        ugDegree: ugDegree || null,
        ugStream: ugStream || null,
        certificatePath: certificatePath || null,
        pgDetails: pgDetails || null,
        bedStatus: bedStatus || null,
        contactDetails: contactDetails || null
      }
    });

    // Auto-assign to Class Group if className is provided
    if (className) {
      const classGroup = await prisma.group.findFirst({
        where: { name: className },
        select: { id: true }
      });
      let groupId = '';
      
      if (!classGroup) {
        groupId = `clg${Math.random().toString(36).substring(2, 11)}`;
        await prisma.group.create({
          data: {
            id: groupId,
            name: className,
            description: `Official group for ${className}`,
            createdById: session.id
          }
        });
        // Add the admin creator
        try {
          await prisma.groupMember.create({
            data: {
              id: `cl${Math.random().toString(36).substring(2, 11)}`,
              groupId,
              userId: session.id,
              role: 'ADMIN'
            }
          });
        } catch (_) {}
      } else {
        groupId = classGroup.id;
      }
      
      const memberId = `cl${Math.random().toString(36).substring(2, 11)}`;
      try {
        await prisma.groupMember.create({
          data: {
            id: memberId,
            groupId,
            userId: newId,
            role: 'MEMBER'
          }
        });
      } catch (_) {}
    }

    // Auto-assign to selected groups
    const groupIds: string[] = groupIdsRaw ? JSON.parse(groupIdsRaw) : [];
    for (const groupId of groupIds) {
      const memberId = `cl${Math.random().toString(36).substring(2, 11)}`;
      try {
        await prisma.groupMember.create({
          data: {
            id: memberId,
            groupId,
            userId: newId,
            role: 'MEMBER'
          }
        });
      } catch (_) {}
    }
    
    return NextResponse.json({ id: newId, username, role, className });
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { userId, newClassName, feesPaid, newPassword, isActive } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    if (newPassword) {
      const hash = await bcrypt.hash(newPassword, 10)
      await prisma.$executeRawUnsafe(`UPDATE User SET password = ? WHERE id = ?`, hash, userId);
      return NextResponse.json({ success: true, message: 'Password updated' });
    }

    if (feesPaid !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE User SET feesPaid = ? WHERE id = ?`, parseInt(feesPaid) || 0, userId);
      return NextResponse.json({ success: true, feesPaid: parseInt(feesPaid) || 0 });
    }

    if (isActive !== undefined) {
      await prisma.$executeRawUnsafe(`UPDATE User SET isActive = ? WHERE id = ?`, isActive ? 1 : 0, userId);
      return NextResponse.json({ success: true, isActive });
    }

    if (!newClassName) {
      return NextResponse.json({ error: 'new class name required' }, { status: 400 })
    }

    // Identify user's old class
    const users: any[] = await prisma.$queryRawUnsafe(`SELECT className FROM User WHERE id = ?`, userId);
    if (!users || users.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const oldClassName = users[0].className;

    // Remove user from old group
    if (oldClassName && oldClassName !== newClassName) {
      const oldGroups: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "Group" WHERE name = ? LIMIT 1`, oldClassName);
      if (oldGroups.length > 0) {
        await prisma.$executeRawUnsafe(`DELETE FROM GroupMember WHERE userId = ? AND groupId = ?`, userId, oldGroups[0].id);
      }
    }

    // Find or Create New Group
    let classGroup: any[] = await prisma.$queryRawUnsafe(`SELECT id FROM "Group" WHERE name = ? LIMIT 1`, newClassName);
    let groupId = '';
    const now = new Date().toISOString();

    if (classGroup.length === 0) {
        groupId = `clg${Math.random().toString(36).substring(2, 11)}`;
        await prisma.$executeRawUnsafe(
          `INSERT INTO "Group" (id, name, description, createdById, createdAt) VALUES (?, ?, ?, ?, ?)`,
          groupId, newClassName, `Official group for ${newClassName}`, session.id, now
        );
        // Add the admin creator
        try {
            await prisma.$executeRawUnsafe(
              `INSERT INTO GroupMember (id, groupId, userId, role) VALUES (?, ?, ?, ?)`,
              `cl${Math.random().toString(36).substring(2, 11)}`, groupId, session.id, 'ADMIN'
            );
        } catch (_) {}
    } else {
        groupId = classGroup[0].id;
    }

    // Add user to new group
    try {
        await prisma.$executeRawUnsafe(
          `INSERT INTO GroupMember (id, groupId, userId, role) VALUES (?, ?, ?, ?)`,
          `cl${Math.random().toString(36).substring(2, 11)}`, groupId, userId, 'MEMBER'
        );
    } catch (_) {} // Might already be a member

    // Update User record
    await prisma.$executeRawUnsafe(`UPDATE User SET className = ? WHERE id = ?`, newClassName, userId);

    return NextResponse.json({ success: true, className: newClassName });
  } catch (error) {
    console.error('Promotion error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const { userId } = await request.json()
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Safety: Don't delete yourself
    if (userId === session.id) {
        return NextResponse.json({ error: 'Cannot delete your own admin account' }, { status: 400 })
    }

    await prisma.$executeRawUnsafe(`DELETE FROM User WHERE id = ?`, userId);
    // Also clean up memberships
    await prisma.$executeRawUnsafe(`DELETE FROM GroupMember WHERE userId = ?`, userId);

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('User deletion error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
