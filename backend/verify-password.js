const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function checkPassword() {
    try {
        const phone = '0788123456';
        const user = await prisma.user.findUnique({
            where: { phone }
        });

        if (user) {
            console.log('User found:', user.name);
            console.log('Role:', user.role);
            console.log('Phone:', user.phone);
            console.log('Password hash in DB:', user.password);

            const checks = [
                'Pass@123',
                'Pass@123!',
                '0788123456',
                'password123',
                'defaultPassword123!'
            ];

            for (const pass of checks) {
                const match = await bcrypt.compare(pass, user.password);
                console.log(`Matches "${pass}"?`, match);
            }

            console.log('Last password change:', user.lastPasswordChange);
        } else {
            console.log('User not found');
        }
    } catch (err) {
        console.error('ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkPassword();
