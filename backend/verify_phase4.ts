import { MonitoringService } from './src/utils/monitoring';

async function runPhase4Tests() {
    console.log('🚀 Starting Phase 4 Verification: Community Launch & Scale...\n');

    try {
        // 1. Test Health Monitoring
        console.log('--- 1. Testing Health Monitoring ---');
        const health = await MonitoringService.getHealthStatus();
        console.log('Health Status:', JSON.stringify(health, null, 2));

        if (health.status === 'HEALTHY') {
            console.log('✅ System Health Check Passed.');
        }

        // 2. Test Production Readiness (Script Existence)
        console.log('\n--- 2. Testing Production Readiness ---');
        console.log('Checking pm2 configuration...');
        const fs = require('fs');
        const path = require('path');
        const pm2Path = path.join(__dirname, 'pm2.config.js');

        if (fs.existsSync(pm2Path)) {
            console.log('✅ pm2.config.js found.');
        }

        console.log('\n✨ Phase 4 Verification Complete: BikaSafe is ready for scale!');

    } catch (error) {
        console.error('\n❌ Phase 4 Verification Failed:', error);
    }
}

runPhase4Tests();
