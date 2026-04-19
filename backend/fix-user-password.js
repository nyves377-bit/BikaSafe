const { PrismaClient } = require('./prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function fixUser() {
    try {
        const phone = '0788123456';
        // findFirst is safer if findUnique is picky about the client version
        const user = await prisma.user.findFirst({ where: { phone } });

        if (user) {
            const hashedPassword = await bcrypt.hash('Pass@123', 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            console.log(`Successfully fixed password for user ${user.name} (${phone})`);
        } else {
            console.log(`User with phone ${phone} not found.`);
        }
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

fixUser();
