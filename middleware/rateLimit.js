const RateLimitService = require('../services/RateLimitService');

class RateLimitMiddleware {
    constructor() {
        this.rateLimitService = new RateLimitService();
    }

    /**
     * Middleware para verificar rate limiting en login
     */
    checkLoginRateLimit() {
        return async (req, res, next) => {
            try {
                const { username } = req.body;
                const ipAddress = this.getClientIP(req);
                const userAgent = req.get('User-Agent') || 'Unknown';

                // Skip if no username provided (will be handled by validation)
                if (!username) {
                    return next();
                }

                // SECURITY: Sanitize username for consistent tracking
                const sanitizedUsername = username.toString().trim().toLowerCase();

                // Check if account is locked
                const lockStatus = await this.rateLimitService.isUsernameLocked(sanitizedUsername);
                if (lockStatus.locked) {
                    // Log the blocked attempt
                    await this.rateLimitService.recordLoginAttempt(sanitizedUsername, ipAddress, userAgent, false);
                    
                    return res.status(423).json({
                        success: false,
                        message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
                        error: 'ACCOUNT_LOCKED',
                        lockedUntil: lockStatus.lockedUntil,
                        retryAfter: this.calculateRetryAfter(lockStatus.lockedUntil)
                    });
                }

                // Check IP rate limit
                const ipLimit = await this.rateLimitService.checkIPRateLimit(ipAddress);
                if (ipLimit.limited) {
                    // Log the blocked attempt
                    await this.rateLimitService.recordLoginAttempt(sanitizedUsername, ipAddress, userAgent, false);
                    
                    return res.status(429).json({
                        success: false,
                        message: 'Too many login attempts from this IP address. Please try again later.',
                        error: 'IP_RATE_LIMITED',
                        attempts: ipLimit.attempts,
                        maxAttempts: ipLimit.maxAttempts,
                        windowMinutes: ipLimit.windowMinutes
                    });
                }

                // Store rate limit info in request for later use
                req.rateLimitInfo = {
                    username: sanitizedUsername,
                    ipAddress,
                    userAgent
                };

                next();
            } catch (error) {
                console.error('Rate limit middleware error:', error);
                // Fail open - don't block login if rate limiting fails
                next();
            }
        };
    }

    /**
     * Add rate limit headers to response (helper method)
     */
    async addRateLimitHeaders(req, res, username, ipAddress) {
        try {
            const counts = await this.rateLimitService.getAttemptCounts(username, ipAddress);
            
            res.set({
                'X-RateLimit-Username-Remaining': Math.max(0, counts.username.maxAttempts - counts.username.attempts - 1),
                'X-RateLimit-IP-Remaining': Math.max(0, counts.ip.maxAttempts - counts.ip.attempts - 1),
                'X-RateLimit-Reset': new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes
            });
        } catch (error) {
            console.error('Error adding rate limit headers:', error);
        }
    }

    /**
     * Get client IP address from request
     */
    getClientIP(req) {
        return req.ip || 
               req.connection?.remoteAddress || 
               req.socket?.remoteAddress ||
               req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
               req.headers['x-real-ip'] ||
               '127.0.0.1';
    }

    /**
     * Calculate retry after time in seconds
     */
    calculateRetryAfter(lockedUntil) {
        const now = new Date();
        const lockExpiry = new Date(lockedUntil);
        const diffMs = lockExpiry - now;
        return Math.max(0, Math.ceil(diffMs / 1000));
    }

    /**
     * Admin endpoint to get rate limit stats
     */
    getRateLimitStats() {
        return async (req, res) => {
            try {
                const stats = await this.rateLimitService.getSecurityStats();
                res.json({
                    success: true,
                    message: 'Rate limit statistics retrieved successfully',
                    stats
                });
            } catch (error) {
                console.error('Error getting rate limit stats:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to retrieve rate limit statistics'
                });
            }
        };
    }

    /**
     * Admin endpoint to unlock an account
     */
    unlockAccount() {
        return async (req, res) => {
            try {
                const { username } = req.body;
                const adminUser = req.user?.username || 'unknown';
                
                if (!username) {
                    return res.status(400).json({
                        success: false,
                        message: 'Username is required'
                    });
                }
                
                const unlocked = await this.rateLimitService.unlockAccount(username, adminUser);
                
                if (unlocked) {
                    res.json({
                        success: true,
                        message: `Account ${username} has been unlocked successfully`
                    });
                } else {
                    res.status(500).json({
                        success: false,
                        message: 'Failed to unlock account'
                    });
                }
            } catch (error) {
                console.error('Error unlocking account:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error'
                });
            }
        };
    }

    /**
     * Calculate retry-after seconds from a locked until timestamp
     * @param {string} lockedUntil - ISO timestamp string
     * @returns {number} Seconds until unlock
     */
    calculateRetryAfter(lockedUntil) {
        if (!lockedUntil) return 0;
        
        const now = new Date();
        const unlock = new Date(lockedUntil);
        const secondsRemaining = Math.ceil((unlock - now) / 1000);
        
        return Math.max(0, secondsRemaining);
    }
}

module.exports = RateLimitMiddleware;