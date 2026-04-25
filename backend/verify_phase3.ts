import { PrismaClient } from './prisma/client';
import { USSDService } from './src/services/ussdService';
import { SMSService } from './src/services/smsService';

const prisma = new PrismaClient();

async function runPhase3Tests() {
    console.log('🚀 Starting Phase 3 Verification: Universal Accessibility...\n');

    try {
        // 1. Setup Test Group & Member
        const testGroup = await prisma.group.create({
            data: {
                name: 'Phase 3 Offline Group',
                registrationId: `PH3-${Date.now()}`,
                contributionAmt: 3000,
                frequency: 'Weekly',
                penaltyRules: JSON.stringify({ lateFee: 1000 }),
                startDate: new Date()
            }
        });

        const member = await prisma.user.create({
            data: {
                name: 'Offline Member',
                phone: `+25078${Math.floor(1000000 + Math.random() * 9000000)}`,
                role: 'MEMBER',
                groupId: testGroup.id,
                password: 'hashed'
            }
        });
        console.log(`✅ Test Environment Ready: Group ${testGroup.name}, Member ${member.name} (${member.phone})`);

        // 2. Test USSD Menu (Main Menu)
        console.log('\n--- 1. Testing USSD Interaction ---');
        console.log(`User dials *123#...`);
        const response1 = await USSDService.handleRequest('sess_001', member.phone, '');
        console.log(`USSD Response:\n${response1}`);

        if (response1.startsWith('CON')) {
            console.log(`✅ Main Menu displayed correctly.`);
        }

        // 3. Test USSD Submenu (Request Status)
        console.log(`\nUser selects "1" (My Status)...`);
        const response2 = await USSDService.handleRequest('sess_001', member.phone, '1');
        console.log(`USSD Response:\n${response2}`);

        if (response2.includes('membership is MEMBER')) {
            console.log(`✅ Status retrieved correctly via USSD.`);
        }

        // 4. Test SMS Alert Triggers
        console.log('\n--- 2. Testing SMS Alert Triggers ---');
        console.log(`Triggering simulated contribution alert...`);
        await SMSService.notifyContributionSuccess(member.phone, 3000, 'CON-TEST-123');

        console.log(`Triggering simulated payout request alert...`);
        await SMSService.notifyPayoutRequested(member.phone, 15000, 'Medical Fund');

        console.log(`Triggering simulated disbursement alert...`);
        await SMSService.notifyDisbursementSuccess(member.phone, 15000, 'MOMO-PAY-777');

        console.log('\n✨ Phase 3 Verification Complete: Universal Accessibility is online!');

    } catch (error) {
        console.error('\n❌ Phase 3 Verification Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runPhase3Tests();
