const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const cls = await prisma.class.upsert({
      where: { name: 'LKG' },
      update: {},
      create: { name: 'LKG', defaultFees: 0 }
    });
    console.log(cls);
  } catch (e) {
    console.error("Upsert failed:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
test();
