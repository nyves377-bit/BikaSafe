const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Verifying DB columns via Raw SQL...');
    const tableInfo = await prisma.$queryRawUnsafe(`PRAGMA table_info("Group")`);
    console.log('📊 Group Table Columns:');
    console.table(tableInfo);

    const hasTier = tableInfo.some(col => col.name === 'tier');
    const hasMaxMembers = tableInfo.some(col => col.name === 'maxMembers');

    if (hasTier && hasMaxMembers) {
        console.log('\n✅ DATABASE SUCCESS: Columns "tier" and "maxMembers" exist in SQLite!');
    } else {
        console.log('\n❌ DATABASE FAILURE: Columns missing.');
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
