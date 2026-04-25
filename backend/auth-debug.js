const { PrismaClient } = require('./prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function debugAuth() {
    const phone = '0788123456';
    const rawPassword = 'Pass@123';

    try {
        console.log(`[DEBUG] Searching for user: ${phone}`);
        const user = await prisma.user.findFirst({ where: { phone } });

        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log(`[DEBUG] User found: ${user.name}`);
        console.log(`[DEBUG] Stored Hash: ${user.password}`);

        const isMatch = await bcrypt.compare(rawPassword, user.password);
        console.log(`[DEBUG] Does 'Pass@123' match stored hash? ${isMatch ? '✅ YES' : '❌ NO'}`);

        if (!isMatch) {
            console.log('[DEBUG] Re-hashing and updating...');
            const newHash = await bcrypt.hash(rawPassword, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: { password: newHash }
            });
            console.log('[DEBUG] Password updated. Verifying again...');
            const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
            const isMatchNow = await bcrypt.compare(rawPassword, updatedUser.password);
            console.log(`[DEBUG] Verification after update: ${isMatchNow ? '✅ SUCCESS' : '❌ FAILED'}`);
        }

    } catch (err) {
        console.error('DEBUG ERROR:', err);
    } finally {
        await prisma.$disconnect();
    }
}

debugAuth();
