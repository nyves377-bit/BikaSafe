const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPaths() {
    const users = await prisma.user.findMany({
        where: {
            agreementUrl: {
                startsWith: 'uploads/'
            }
        }
    });

    console.log(`Found ${users.length} users with incorrect paths.`);

    for (const user of users) {
        const newPath = user.agreementUrl.substring(8);
        await prisma.user.update({
            where: { id: user.id },
            data: { agreementUrl: newPath }
        });
        console.log(`Updated user ${user.name}: ${user.agreementUrl} -> ${newPath}`);
    }

    await prisma.$disconnect();
}

fixPaths().catch(err => console.error(err));
