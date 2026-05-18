import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const application = await prisma.application.create({
            data: {
                studentName: data.studentName,
                dob: data.dob,
                gender: data.gender,
                grade: data.grade,
                parentName: data.parentName,
                phone: data.phone,
                email: data.email,
                address: data.address
            }
        });
        return NextResponse.json(application);
    } catch (error: any) {
        console.error('Application submission error:', error);
        return NextResponse.json({ error: 'Failed to submit application', details: error.message }, { status: 500 });
    }
}

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const applications = await prisma.application.findMany({
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(applications);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.application.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
