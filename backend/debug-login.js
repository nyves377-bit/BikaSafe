const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUser() {
    const phone = '0788123456';
    const user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, name: true, phone: true, role: true }
    });

    if (user) {
        console.log('User found:', JSON.stringify(user, null, 2));
    } else {
        console.log('User NOT found with phone:', phone);
        // List a few users to see the phone format
        const someUsers = await prisma.user.findMany({
            take: 5,
            select: { name: true, phone: true }
        });
        console.log('Sample users in DB:', JSON.stringify(someUsers, null, 2));
    }

    await prisma.$disconnect();
}

checkUser();
