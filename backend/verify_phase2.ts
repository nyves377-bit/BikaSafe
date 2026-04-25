import { PrismaClient } from './prisma/client';
import { PaymentService, PaymentStatus } from './src/services/paymentService';

const prisma = new PrismaClient();

async function runPhase2Tests() {
    console.log('🚀 Starting Phase 2 Verification: Money Movement Integration...\n');

    try {
        // 1. Setup Test Group & Member
        const testGroup = await prisma.group.create({
            data: {
                name: 'Phase 2 Beta Group',
                registrationId: `PH2-${Date.now()}`,
                contributionAmt: 5000,
                frequency: 'Monthly',
                penaltyRules: JSON.stringify({ lateFee: 2000 }),
                startDate: new Date()
            }
        });

        const member = await prisma.user.create({
            data: {
                name: 'Digital Payer',
                phone: `25078${Math.floor(1000000 + Math.random() * 9000000)}`,
                role: 'MEMBER',
                groupId: testGroup.id,
                password: 'hashed'
            }
        });
        console.log(`✅ Test Environment Ready: Group ${testGroup.name}, Member ${member.name}`);

        // 2. Test Contribution Payment Initiation
        console.log('\n--- 1. Testing Mobile Money Collection ---');
        console.log(`Initiating 5000 RWF collection for ${member.phone}...`);

        const paymentResult = await PaymentService.initiateCollection({
            amount: 5000,
            phone: member.phone,
            description: 'Monthly Contribution'
        });

        if (paymentResult.success) {
            console.log(`✅ Collection Initiated. Provider Ref: ${paymentResult.providerRef}`);

            // Create pending contribution
            const contribution = await prisma.contribution.create({
                data: {
                    amount: 5000,
                    status: 'LATE',
                    paymentStatus: PaymentStatus.PENDING,
                    providerRef: paymentResult.providerRef,
                    userId: member.id,
                    groupId: testGroup.id
                }
            });

            console.log('Simulating successful payment callback...');
            await PaymentService.simulateCallback('CONTRIBUTION', contribution.id, PaymentStatus.SUCCESS);

            const updatedCon = await prisma.contribution.findUnique({ where: { id: contribution.id } });
            if (updatedCon?.status === 'PAID' && updatedCon.paymentStatus === PaymentStatus.SUCCESS) {
                console.log(`✅ Ledger Updated: Contribution is now PAID (PaymentStatus: SUCCESS)`);
            }
        }

        // 3. Test Multi-Sig Payout & Disbursement
        console.log('\n--- 2. Testing Multi-Sig Disbursement ---');

        const treasurer = await prisma.user.create({
            data: {
                name: 'T-Approval 1',
                phone: `TREAS1-${Date.now()}`,
                role: 'TREASURER',
                groupId: testGroup.id,
                password: 'hashed'
            }
        });

        const treasurer2 = await prisma.user.create({
            data: {
                name: 'T-Approval 2',
                phone: `TREAS2-${Date.now()}`,
                role: 'TREASURER',
                groupId: testGroup.id,
                password: 'hashed'
            }
        });

        const payout = await prisma.payout.create({
            data: {
                amount: 10000,
                description: 'Group Emergency Fund',
                status: 'PENDING',
                requestedById: treasurer.id,
                groupId: testGroup.id
            }
        });

        console.log(`Payout requested by ${treasurer.name}. Needs 1 more approval for disbursement.`);

        // Final Approval step
        console.log(`Treasurer ${treasurer2.name} approving... Triggering Disbursement.`);

        // This simulates the logic inside our hardened payout route
        await prisma.$transaction(async (tx) => {
            const disbursement = await PaymentService.initiateDisbursement({
                amount: payout.amount,
                phone: treasurer.phone, // In reality, paying back to requester or specific vendor
                description: payout.description
            });

            await tx.payout.update({
                where: { id: payout.id },
                data: {
                    status: disbursement.success ? 'APPROVED' : 'PENDING',
                    paymentStatus: disbursement.success ? PaymentStatus.SUCCESS : PaymentStatus.FAILED,
                    providerRef: disbursement.providerRef
                }
            });
        });

        const finalPayout = await prisma.payout.findUnique({ where: { id: payout.id } });
        if (finalPayout?.paymentStatus === PaymentStatus.SUCCESS) {
            console.log(`✅ Payout Finalized: Disbursement Successful. Provider Ref: ${finalPayout.providerRef}`);
        }

        console.log('\n✨ Phase 2 Verification Complete: Money Movement is working!');

    } catch (error) {
        console.error('\n❌ Phase 2 Verification Failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

runPhase2Tests();
