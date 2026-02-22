import { PrismaClient } from '../prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log('--- Database Users ---');
    users.forEach(u => {
        console.log(`Phone: ${u.phone}, Name: ${u.name}, Hash: ${u.password}`);
    });

    if (users.length > 0) {
        const testPass = 'Password@123';
        const isMatch = await bcrypt.compare(testPass, users[0].password);
        console.log(`Test comparison with '${testPass}': ${isMatch}`);
    }
    await prisma.$disconnect();
}

main();
