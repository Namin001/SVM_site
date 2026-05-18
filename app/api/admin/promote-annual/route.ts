import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';

const CLASS_PROGRESSION: { [key: string]: string } = {
    'LKG': 'UKG',
    'UKG': 'I- std A',
    'I- std A': 'II- std A',
    'I-std B': 'II-std B',
    'II- std A': 'III- std A',
    'II-std B': 'III-std B',
    'III- std A': 'IV- std A',
    'III-std B': 'IV-std B',
    'IV- std A': 'V- std A',
    'IV-std B': 'V-std B',
    'V- std A': 'VI- std A',
    'V-std B': 'VI-std B',
    'VI- std A': 'VII- std A',
    'VI-std B': 'VII-std B',
    'VII- std A': 'VIII- std A',
    'VII-std B': 'VIII-std B',
    'VIII- std A': 'IX- std A',
    'VIII-std B': 'IX-std B',
    'IX- std A': 'X- std A',
    'IX-std B': 'X-std B',
    'X- std A': 'XI- 1st',
    'X-std B': 'XI- 1st',
    'XI- 1st': 'XII- 1st',
    'XI-2nd': 'XII-2nd',
    'XI-3rd': 'XII-3rd',
    'XI-4th': 'XII-4th',
    'XII- 1st': 'GRADUATED',
    'XII-2nd': 'GRADUATED',
    'XII-3rd': 'GRADUATED',
    'XII-4th': 'GRADUATED',
};

export async function POST() {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const students = await prisma.user.findMany({
            where: {
                role: 'PARENT', // In this system PARENT represents Student/Parent
            }
        });

        const promotedCount = [];
        
        for (const student of students) {


            const nextClass = CLASS_PROGRESSION[student.className || ''];
            if (nextClass) {
                await prisma.user.update({
                    where: { id: student.id },
                    data: {
                        className: nextClass,
                        lastPromotedYear: new Date().getFullYear()
                    }
                });
                promotedCount.push(student.id);
            }
        }

        return NextResponse.json({ 
            success: true, 
            promoted: promotedCount.length,
            message: `${promotedCount.length} students promoted to their next classes.`
        });
    } catch (error) {
        console.error('Annual promotion error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
