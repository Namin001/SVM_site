const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tableInfo = await prisma.$queryRawUnsafe('PRAGMA table_info(User)');
    console.log(JSON.stringify(tableInfo, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
