const DatabaseManager = require('../database/DatabaseManager');

class RateLimitService {
    constructor() {
        this.db = new DatabaseManager();
        
        // Configuration
        this.config = {
            maxAttemptsPerUsername: 5,     // Max failed attempts per username
            maxAttemptsPerIP: 10,          // Max failed attempts per IP
            lockoutDurationMinutes: 15,    // Account lockout duration
            rateLimitWindowMinutes: 15,    // Time window for counting attempts
            cleanupIntervalHours: 24       // How often to clean old records
        };
    }

    /**
     * Check if username is locked out
     */
    async isUsernameLocked(username) {
        try {
            const query = `
                SELECT locked_until, failed_attempts 
                FROM account_lockouts 
                WHERE username = ? AND locked_until > datetime('now')
            `;
            
            return new Promise((resolve, reject) => {
                this.db.db.get(query, [username], (err, row) => {
                    if (err) {
                        console.error('Error checking username lockout:', err);
                        resolve({ locked: false }); // Fail open for availability
                    } else if (row) {
                        resolve({
                            locked: true,
                            lockedUntil: row.locked_until,
                            failedAttempts: row.failed_attempts
                        });
                    } else {
                        resolve({ locked: false });
                    }
                });
            });
        } catch (error) {
            console.error('Error checking username lockout:', error);
            return { locked: false }; // Fail open for availability
        }
    }

    /**
     * Check rate limit for IP address
     */
    async checkIPRateLimit(ipAddress) {
        try {
            const windowStart = new Date();
            windowStart.setMinutes(windowStart.getMinutes() - this.config.rateLimitWindowMinutes);
            
            const query = `
                SELECT COUNT(*) as attempt_count 
                FROM login_attempts 
                WHERE ip_address = ? 
                AND datetime(attempt_time) > datetime(?) 
                AND success = 0
            `;
            
            return new Promise((resolve, reject) => {
                this.db.db.get(query, [ipAddress, windowStart.toISOString()], (err, row) => {
                    if (err) {
                        console.error('Error checking IP rate limit:', err);
                        resolve({ limited: false, attempts: 0 }); // Fail open
                    } else {
                        const attempts = row?.attempt_count || 0;
                        resolve({
                            limited: attempts >= this.config.maxAttemptsPerIP,
                            attempts: attempts,
                            maxAttempts: this.config.maxAttemptsPerIP,
                            windowMinutes: this.config.rateLimitWindowMinutes
                        });
                    }
                });
            });
        } catch (error) {
            console.error('Error checking IP rate limit:', error);
            return { limited: false, attempts: 0 }; // Fail open
        }
    }

    /**
     * Record login attempt
     */
    async recordLoginAttempt(username, ipAddress, userAgent, success = false) {
        try {
            const successValue = success ? 1 : 0;
            
            // Record single attempt with username as identifier (IP is stored in ip_address field)
            await new Promise((resolve, reject) => {
                this.db.db.run(`
                    INSERT INTO login_attempts (identifier, identifier_type, success, user_agent, ip_address)
                    VALUES (?, 'username', ?, ?, ?)
                `, [username, successValue, userAgent, ipAddress], (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // If login failed, check if we need to lock the account
            if (!success) {
                await this.checkAndLockAccount(username);
            }
        } catch (error) {
            console.error('Error recording login attempt:', error);
        }
    }

    /**
     * Check if account should be locked and lock it if necessary
     */
    async checkAndLockAccount(username) {
        try {
            const windowStart = new Date();
            windowStart.setMinutes(windowStart.getMinutes() - this.config.rateLimitWindowMinutes);
            
            // Count failed attempts for this username in the window
            const countQuery = `
                SELECT COUNT(*) as failed_count 
                FROM login_attempts 
                WHERE identifier = ? 
                AND identifier_type = 'username' 
                AND datetime(attempt_time) > datetime(?) 
                AND success = 0
            `;
            

            
            return new Promise((resolve) => {
                this.db.db.get(countQuery, [username, windowStart.toISOString()], (err, row) => {
                    if (err) {
                        console.error('Error checking failed attempts:', err);
                        resolve(false);
                        return;
                    }
                    
                    const failedAttempts = row?.failed_count || 0;
                    
                    if (failedAttempts >= this.config.maxAttemptsPerUsername) {
                        // Lock the account
                        const lockedUntil = new Date();
                        lockedUntil.setMinutes(lockedUntil.getMinutes() + this.config.lockoutDurationMinutes);
                        
                        this.db.db.run(`
                            INSERT OR REPLACE INTO account_lockouts 
                            (username, locked_until, failed_attempts, last_attempt)
                            VALUES (?, ?, ?, datetime('now'))
                        `, [username, lockedUntil.toISOString(), failedAttempts], (lockErr) => {
                            if (lockErr) {
                                console.error('Error locking account:', lockErr);
                                resolve(false);
                            } else {
                                resolve(true);
                            }
                        });
                    } else {
                        resolve(false);
                    }
                });
            });
        } catch (error) {
            console.error('Error checking/locking account:', error);
            return false;
        }
    }

    /**
     * Get current attempt counts for monitoring
     */
    async getAttemptCounts(username, ipAddress) {
        try {
            const windowStart = new Date();
            windowStart.setMinutes(windowStart.getMinutes() - this.config.rateLimitWindowMinutes);
            
            // Get username attempts
            const usernamePromise = new Promise((resolve) => {
                const query = `
                    SELECT COUNT(*) as count 
                    FROM login_attempts 
                    WHERE identifier = ? AND identifier_type = 'username' 
                    AND datetime(attempt_time) > datetime(?) AND success = 0
                `;
                
                this.db.db.get(query, [username, windowStart.toISOString()], (err, row) => {
                    if (err) {
                        console.error('Error getting username attempts:', err);
                        resolve({ attempts: 0, maxAttempts: this.config.maxAttemptsPerUsername });
                    } else {
                        resolve({
                            attempts: row?.count || 0,
                            maxAttempts: this.config.maxAttemptsPerUsername
                        });
                    }
                });
            });
            
            // Get IP attempts
            const ipPromise = new Promise((resolve) => {
                const query = `
                    SELECT COUNT(*) as count 
                    FROM login_attempts 
                    WHERE ip_address = ? 
                    AND datetime(attempt_time) > datetime(?) AND success = 0
                `;
                
                this.db.db.get(query, [ipAddress, windowStart.toISOString()], (err, row) => {
                    if (err) {
                        console.error('Error getting IP attempts:', err);
                        resolve({ attempts: 0, maxAttempts: this.config.maxAttemptsPerIP });
                    } else {
                        resolve({
                            attempts: row?.count || 0,
                            maxAttempts: this.config.maxAttemptsPerIP
                        });
                    }
                });
            });
            
            const [usernameResult, ipResult] = await Promise.all([usernamePromise, ipPromise]);
            
            return {
                username: usernameResult,
                ip: ipResult
            };
        } catch (error) {
            console.error('Error getting attempt counts:', error);
            return { username: { attempts: 0 }, ip: { attempts: 0 } };
        }
    }

    /**
     * Manually unlock an account (admin function)
     */
    async unlockAccount(username, adminUser = 'system') {
        try {
            return new Promise((resolve) => {
                this.db.db.run(`DELETE FROM account_lockouts WHERE username = ?`, [username], (err) => {
                    if (err) {
                        console.error('Error unlocking account:', err);
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        } catch (error) {
            console.error('Error unlocking account:', error);
            return false;
        }
    }

    /**
     * Clean up old login attempt records
     */
    async cleanupOldRecords() {
        try {
            const cutoffDate = new Date();
            cutoffDate.setHours(cutoffDate.getHours() - this.config.cleanupIntervalHours);
            
            // Clean old login attempts
            const loginPromise = new Promise((resolve) => {
                this.db.db.run(`DELETE FROM login_attempts WHERE attempt_time < ?`, [cutoffDate.toISOString()], function(err) {
                    if (err) {
                        console.error('Error cleaning login attempts:', err);
                        resolve({ changes: 0 });
                    } else {
                        resolve({ changes: this.changes });
                    }
                });
            });
            
            // Clean expired lockouts
            const lockoutPromise = new Promise((resolve) => {
                this.db.db.run(`DELETE FROM account_lockouts WHERE locked_until < datetime('now')`, function(err) {
                    if (err) {
                        console.error('Error cleaning lockouts:', err);
                        resolve({ changes: 0 });
                    } else {
                        resolve({ changes: this.changes });
                    }
                });
            });
            
            const [loginResult, lockoutResult] = await Promise.all([loginPromise, lockoutPromise]);
            
            // Cleanup completed successfully
        } catch (error) {
            console.error('Error cleaning up old records:', error);
        }
    }

    /**
     * Get security statistics for monitoring
     */
    async getSecurityStats() {
        try {
            // Active lockouts
            const lockoutPromise = new Promise((resolve) => {
                const query = `SELECT COUNT(*) as count FROM account_lockouts WHERE locked_until > datetime('now')`;
                this.db.db.get(query, (err, row) => {
                    if (err) {
                        console.error('Error getting lockout stats:', err);
                        resolve(0);
                    } else {
                        resolve(row?.count || 0);
                    }
                });
            });
            
            // Login attempts in last hour
            const hourAgo = new Date();
            hourAgo.setHours(hourAgo.getHours() - 1);
            
            const attemptsPromise = new Promise((resolve) => {
                const query = `
                    SELECT 
                        COUNT(*) as total,
                        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
                        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed
                    FROM login_attempts 
                    WHERE datetime(attempt_time) > datetime(?)
                `;
                
                this.db.db.get(query, [hourAgo.toISOString()], (err, row) => {
                    if (err) {
                        console.error('Error getting attempt stats:', err);
                        resolve({ total: 0, successful: 0, failed: 0 });
                    } else {
                        resolve({
                            total: row?.total || 0,
                            successful: row?.successful || 0,
                            failed: row?.failed || 0
                        });
                    }
                });
            });
            
            const [activeLockouts, lastHour] = await Promise.all([lockoutPromise, attemptsPromise]);
            
            return {
                activeLockouts,
                lastHour
            };
        } catch (error) {
            console.error('Error getting security stats:', error);
            return { activeLockouts: 0, lastHour: { total: 0, successful: 0, failed: 0 } };
        }
    }
}

module.exports = RateLimitService;