const RateLimitService = require('../services/RateLimitService');

class SecurityMaintenanceService {
    constructor() {
        this.rateLimitService = new RateLimitService();
        this.cleanupInterval = null;
        this.setupCleanupJobs();
    }

    /**
     * Setup automated cleanup jobs using native setTimeout
     */
    setupCleanupJobs() {
        // Run cleanup every hour (3600000 ms)
        this.cleanupInterval = setInterval(async () => {
            console.log('🧹 Running hourly security cleanup...');
            await this.rateLimitService.cleanupOldRecords();
        }, 60 * 60 * 1000); // 1 hour

        // Run initial cleanup after 5 minutes
        setTimeout(async () => {
            console.log('🧹 Running initial security cleanup...');
            await this.rateLimitService.cleanupOldRecords();
        }, 5 * 60 * 1000); // 5 minutes

        console.log('✅ Security maintenance jobs scheduled:');
        console.log('  - Hourly cleanup: Every hour');
        console.log('  - Initial cleanup: In 5 minutes');
    }

    /**
     * Generate daily security report
     */
    async generateDailySecurityReport() {
        try {
            const stats = await this.rateLimitService.getSecurityStats();
            
            // Get additional statistics
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            yesterday.setHours(0, 0, 0, 0);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const dailyStats = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        COUNT(*) as total_attempts,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_logins,
                        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
                        COUNT(DISTINCT ip_address) as unique_ips,
                        COUNT(DISTINCT identifier) as unique_usernames
                    FROM login_attempts 
                    WHERE attempt_time >= ? AND attempt_time < ?
                `;
                
                this.rateLimitService.db.db.get(query, [
                    yesterday.toISOString(),
                    today.toISOString()
                ], (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {});
                });
            });
            
            // Log the report
            console.log('\n📊 DAILY SECURITY REPORT - ' + yesterday.toDateString());
            console.log('═══════════════════════════════════════════');
            console.log(`📈 Total Login Attempts: ${dailyStats.total_attempts || 0}`);
            console.log(`✅ Successful Logins: ${dailyStats.successful_logins || 0}`);
            console.log(`❌ Failed Attempts: ${dailyStats.failed_attempts || 0}`);
            console.log(`🌐 Unique IP Addresses: ${dailyStats.unique_ips || 0}`);
            console.log(`👤 Unique Usernames: ${dailyStats.unique_usernames || 0}`);
            console.log(`🔒 Currently Locked Accounts: ${stats.activeLockouts}`);
            
            // Calculate success rate
            const totalAttempts = dailyStats.total_attempts || 0;
            const successRate = totalAttempts > 0 ? 
                ((dailyStats.successful_logins || 0) / totalAttempts * 100).toFixed(2) : 
                'N/A';
            console.log(`📊 Success Rate: ${successRate}%`);
            
            // Security alerts
            if (dailyStats.failed_attempts > 100) {
                console.log('🚨 SECURITY ALERT: High number of failed login attempts!');
            }
            
            if (stats.activeLockouts > 5) {
                console.log('🚨 SECURITY ALERT: Multiple accounts currently locked!');
            }
            
            console.log('═══════════════════════════════════════════\n');
            
        } catch (error) {
            console.error('❌ Error generating daily security report:', error);
        }
    }

    /**
     * Manual security report (can be called by admin endpoint)
     */
    async getSecurityReport(hours = 24) {
        try {
            const windowStart = new Date();
            windowStart.setHours(windowStart.getHours() - hours);
            
            const report = await new Promise((resolve, reject) => {
                const query = `
                    SELECT 
                        COUNT(*) as total_attempts,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_logins,
                        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed_attempts,
                        COUNT(DISTINCT ip_address) as unique_ips,
                        COUNT(DISTINCT CASE WHEN identifier_type = 'username' THEN identifier END) as unique_usernames
                    FROM login_attempts 
                    WHERE attempt_time > ?
                `;
                
                this.rateLimitService.db.db.get(query, [windowStart.toISOString()], (err, row) => {
                    if (err) reject(err);
                    else resolve(row || {});
                });
            });
            
            // Get top failed IPs
            const topFailedIPs = await new Promise((resolve, reject) => {
                const query = `
                    SELECT ip_address, COUNT(*) as failed_count
                    FROM login_attempts 
                    WHERE attempt_time > ? AND success = 0
                    GROUP BY ip_address
                    ORDER BY failed_count DESC
                    LIMIT 10
                `;
                
                this.rateLimitService.db.db.all(query, [windowStart.toISOString()], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            // Get top targeted usernames
            const topTargetedUsernames = await new Promise((resolve, reject) => {
                const query = `
                    SELECT identifier as username, COUNT(*) as attempt_count
                    FROM login_attempts 
                    WHERE attempt_time > ? AND identifier_type = 'username' AND success = 0
                    GROUP BY identifier
                    ORDER BY attempt_count DESC
                    LIMIT 10
                `;
                
                this.rateLimitService.db.db.all(query, [windowStart.toISOString()], (err, rows) => {
                    if (err) reject(err);
                    else resolve(rows || []);
                });
            });
            
            const currentStats = await this.rateLimitService.getSecurityStats();
            
            return {
                period: {
                    hours,
                    startTime: windowStart.toISOString(),
                    endTime: new Date().toISOString()
                },
                summary: {
                    totalAttempts: report.total_attempts || 0,
                    successfulLogins: report.successful_logins || 0,
                    failedAttempts: report.failed_attempts || 0,
                    uniqueIPs: report.unique_ips || 0,
                    uniqueUsernames: report.unique_usernames || 0,
                    successRate: report.total_attempts > 0 ? 
                        ((report.successful_logins || 0) / report.total_attempts * 100).toFixed(2) : 
                        0
                },
                current: {
                    activeLockouts: currentStats.activeLockouts,
                    lastHourActivity: currentStats.lastHour
                },
                topThreats: {
                    failedIPs: topFailedIPs,
                    targetedUsernames: topTargetedUsernames
                }
            };
            
        } catch (error) {
            console.error('Error generating security report:', error);
            throw error;
        }
    }

    /**
     * Stop all maintenance jobs
     */
    stop() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        console.log('🛑 Security maintenance service stopped');
    }
}

module.exports = SecurityMaintenanceService;