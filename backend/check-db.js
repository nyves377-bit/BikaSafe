const { PrismaClient } = require('./prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: { phone: true, email: true, nationalId: true, role: true }
    });
    const groups = await prisma.group.findMany({
        select: { name: true, registrationId: true }
    });
    console.log('--- USERS ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('--- GROUPS ---');
    console.log(JSON.stringify(groups, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
