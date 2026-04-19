const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: { phone: '0788123456' }
        });
        console.log('FULL USER OBJECT:', JSON.stringify(user, null, 2));
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
