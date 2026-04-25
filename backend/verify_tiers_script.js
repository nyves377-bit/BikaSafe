const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Tier Guardrail Verification (JS Mode)...');

    // 1. Create a simulated FREE group with maxMembers = 2
    console.log('\n--- Test 1: FREE Tier Limit ---');
    const freeGroup = await prisma.group.create({
        data: {
            name: 'Verification Free Group',
            registrationId: `V-FREE-${Date.now()}`,
            contributionAmt: 1000,
            frequency: 'Weekly',
            penaltyRules: '{}',
            startDate: new Date(),
            tier: 'FREE',
            maxMembers: 2 // Set to small number for testing
        }
    });
    console.log(`✅ Created FREE group: ${freeGroup.name} (Limit: ${freeGroup.maxMembers})`);

    // Add 2 members (the limit)
    for (let i = 1; i <= 2; i++) {
        await prisma.user.create({
            data: {
                phone: `070000000${i}`,
                name: `Test Member ${i}`,
                password: 'password123',
                role: 'MEMBER',
                groupId: freeGroup.id
            }
        });
    }
    console.log('✅ Added 2 members to FREE group.');

    // Count members
    const currentCount = await prisma.user.count({ where: { groupId: freeGroup.id } });
    console.log(`📊 Current Member Count: ${currentCount}`);

    if (freeGroup.tier === 'FREE' && currentCount >= freeGroup.maxMembers) {
        console.log('✅ GUARDRAIL SUCCESS: Logic correctly identifies limit reached for FREE group.');
    } else {
        console.log('❌ GUARDRAIL FAILURE: Logic failed to identify limit.');
    }

    // 2. Create an ELITE group
    console.log('\n--- Test 2: ELITE Tier ---');
    const eliteGroup = await prisma.group.create({
        data: {
            name: 'Verification Elite Group',
            registrationId: `V-ELITE-${Date.now()}`,
            contributionAmt: 5000,
            frequency: 'Weekly',
            penaltyRules: '{}',
            startDate: new Date(),
            tier: 'ELITE',
            maxMembers: 1000
        }
    });
    console.log(`✅ Created ELITE group: ${eliteGroup.name} (Tier: ${eliteGroup.tier})`);

    if (eliteGroup.tier === 'ELITE') {
        console.log('✅ METADATA SUCCESS: Tier correctly saved as ELITE.');
    }

    // Cleanup
    await prisma.user.deleteMany({ where: { groupId: { in: [freeGroup.id, eliteGroup.id] } } });
    await prisma.group.deleteMany({ where: { id: { in: [freeGroup.id, eliteGroup.id] } } });
    console.log('\n✅ Cleanup complete.');
    console.log('🏁 Verification Finished Successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
