import { prisma } from '../index';

/**
 * Monitoring Utility for BikaSafe
 * Provides health checks and basic performance telemetry.
 */
export class MonitoringService {
    static async getHealthStatus() {
        const start = Date.now();
        let dbStatus = 'OFFLINE';
        let dbLatency = 0;

        try {
            await prisma.$queryRaw`SELECT 1`;
            dbStatus = 'ONLINE';
            dbLatency = Date.now() - start;
        } catch (error) {
            console.error('[Health Check] DB Error:', error);
        }

        return {
            status: dbStatus === 'ONLINE' ? 'HEALTHY' : 'DEGRADED',
            timestamp: new Date().toISOString(),
            components: {
                database: {
                    status: dbStatus,
                    latency: `${dbLatency}ms`
                },
                paymentGateway: {
                    status: 'ONLINE', // In real app, check MoMo API heartbeat
                    provider: 'Simulated MOMO Engine'
                }
            },
            system: {
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage()
            }
        };
    }
}
