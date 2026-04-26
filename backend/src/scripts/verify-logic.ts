import { prisma } from '../index';
import { applyPenalties } from '../services/penaltyEngine';
import bcrypt from 'bcryptjs';

async function main() {
    console.log('🚀 Starting Business Logic Verification...');

    try {
        // 1. Setup/Find Test Group
        console.log('--- Step 1: Setting up test group ---');
        let group = await prisma.group.findFirst({ where: { name: 'TEST_VERIFICATION_GROUP' } });
        
        if (!group) {
            group = await prisma.group.create({
                data: {
                    name: 'TEST_VERIFICATION_GROUP',
                    registrationId: 'TEST-' + Math.random().toString(36).substring(7).toUpperCase(),
                    contributionAmt: 5000,
                    frequency: 'WEEKLY',
                    penaltyRules: JSON.stringify({ lateFee: 1500 }),
                    startDate: new Date()
                }
            });
            console.log('✅ Created test group');
        } else {
            console.log('✅ Found existing test group');
        }

        // 2. Setup/Find Test Member
        console.log('--- Step 2: Setting up test member ---');
        let member = await prisma.user.findFirst({ where: { phone: '+2500000000' } });
        
        if (!member) {
            const hashedPassword = await bcrypt.hash('TestPass123!', 10);
            member = await prisma.user.create({
                data: {
                    phone: '+2500000000',
                    email: 'tester@bikasafe.test',
                    password: hashedPassword,
                    name: 'Test Member',
                    role: 'MEMBER',
                    groupId: group.id
                }
            });
            console.log('✅ Created test member');
        } else {
            console.log('✅ Found existing test member');
        }

        // 3. Ensure no contributions exist for the lookback period
        console.log('--- Step 3: Clearing existing state ---');
        await prisma.penalty.deleteMany({
            where: { userId: member.id, groupId: group.id }
        });
        await prisma.contribution.deleteMany({
            where: { userId: member.id, groupId: group.id }
        });
        console.log('✅ State cleared');

        // 4. Trigger Penalty Engine
        console.log('--- Step 4: Triggering Penalty Engine ---');
        await applyPenalties(group.id);

        // 5. Verification
        console.log('--- Step 5: Verification ---');
        const penalties = await prisma.penalty.findMany({
            where: { userId: member.id, groupId: group.id }
        });

        if (penalties.length > 0) {
            console.log(`🎉 SUCCESS! Found ${penalties.length} applied penalties.`);
            console.log(`   Amount: RWF ${penalties[0].amount}`);
            console.log(`   Reason: ${penalties[0].reason}`);
        } else {
            console.error('❌ FAILURE: No penalties were applied.');
        }

        const logs = await prisma.auditLog.findMany({
            where: { groupId: group.id, action: 'PENALTY_APPLIED' }
        });

        if (logs.length > 0) {
            console.log('✅ Audit log correctly recorded.');
        } else {
            console.error('❌ Audit log missing.');
        }

    } catch (error) {
        console.error('🚨 Error during verification:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
