import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.id },
            select: {
                id: true,
                username: true,
                role: true,
                name: true,
                admissionNo: true,
                age: true,
                gender: true,
                className: true,
                section: true,
                imagePath: true,
                dob: true,
                fatherName: true,
                motherName: true,
                religion: true,
                caste: true,
                fatherPhone: true,
                motherPhone: true,
                feesPaid: true,
                createdAt: true,
                birthCertPath: true,
                aadharPath: true,
                transferCertPath: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
