import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function GET(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const applications = await prisma.$queryRawUnsafe(
            `SELECT * FROM CareerApplication ORDER BY createdAt DESC`
        );
        return NextResponse.json(applications);
    } catch (error) {
        console.error('Error fetching career applications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        
        const fullName = formData.get('fullName') as string;
        const email = formData.get('email') as string;
        const phone = formData.get('phone') as string;
        const domain = formData.get('domain') as string;
        const domainOther = formData.get('domainOther') as string;
        
        // Education fields
        const xMark = formData.get('xMark') as string;
        const xMedium = formData.get('xMedium') as string;
        const xiiMark = formData.get('xiiMark') as string;
        const xiiMedium = formData.get('xiiMedium') as string;
        const ugCgpa = formData.get('ugCgpa') as string;
        const ugStream = formData.get('ugStream') as string;
        const pgCgpa = formData.get('pgCgpa') as string;
        const pgStream = formData.get('pgStream') as string;
        const bedStatus = formData.get('bedStatus') as string;
        
        const resumeFile = formData.get('resume') as File;

        if (!fullName || !email || !phone || !domain || !resumeFile) {
            return NextResponse.json({ error: 'Basic details and resume are required' }, { status: 400 });
        }

        // Handle Resume Upload
        let resumePath = '';
        const uploadDir = path.join(process.cwd(), 'public/uploads/resumes');

        if (resumeFile && resumeFile.size > 0) {
            const bytes = await resumeFile.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const filename = `resume_${Date.now()}_${resumeFile.name.replace(/\s+/g, '_')}`;
            await writeFile(path.join(uploadDir, filename), buffer);
            resumePath = `/uploads/resumes/${filename}`;
        }

        const id = `cap${Math.random().toString(36).substring(2, 11)}`;
        const now = new Date().toISOString();

        await prisma.$executeRawUnsafe(
            `INSERT INTO CareerApplication (id, fullName, email, phone, domain, domainOther, xMark, xMedium, xiiMark, xiiMedium, ugCgpa, ugStream, pgCgpa, pgStream, bedStatus, resumePath, status, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            id, fullName, email, phone, domain, domainOther, xMark, xMedium, xiiMark, xiiMedium, ugCgpa, ugStream, pgCgpa, pgStream, bedStatus, resumePath, 'RESUME_CHECKING', now
        );

        return NextResponse.json({ success: true, id });
    } catch (error) {
        console.error('Error submitting career application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id, status } = await request.json();
        if (!id || !status) {
            return NextResponse.json({ error: 'ID and status required' }, { status: 400 });
        }

        await prisma.$executeRawUnsafe(
            `UPDATE CareerApplication SET status = ? WHERE id = ?`,
            status, id
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating career application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.$executeRawUnsafe(
            `DELETE FROM CareerApplication WHERE id = ?`,
            id
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting career application:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
