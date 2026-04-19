const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dumpData() {
    const users = await prisma.user.findMany({
        select: { name: true, agreementUrl: true }
    });
    console.log(JSON.stringify(users, null, 2));
    await prisma.$disconnect();
}

dumpData();
