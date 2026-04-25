const { PrismaClient } = require('./prisma/client');
const prisma = new PrismaClient();

async function fix() {
    const payoutId = '6fbb952f-cc10-4bd8-b1fb-5cfb5e13ebe1';
    const loanId = 'd8e21d78-50fb-4d68-ace4-04ed1435493c';

    try {
        await prisma.$transaction([
            prisma.payout.update({
                where: { id: payoutId },
                data: { status: 'APPROVED' }
            }),
            prisma.loan.update({
                where: { id: loanId },
                data: { status: 'ACTIVE' }
            })
        ]);
        console.log('Successfully activated loan and approved payout');
    } catch (error) {
        console.error('Failed to fix loan:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fix();
