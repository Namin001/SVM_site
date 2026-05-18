const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const users = await prisma.$queryRawUnsafe(`SELECT id, name, className, feesPaid FROM User LIMIT 5`);
    console.log("Users:", users);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
test();
