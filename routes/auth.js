const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { requireAuth, requireRole } = require('../middleware/auth');
const RateLimitMiddleware = require('../middleware/rateLimit');

const authService = new AuthService();
const rateLimitMiddleware = new RateLimitMiddleware();

// POST /auth/login - User login with rate limiting and security logging
router.post('/login', 
    // SECURITY: Rate limiting middleware
    rateLimitMiddleware.checkLoginRateLimit(),
    async (req, res) => {
    try {
        const { username, password } = req.body;

        // SECURITY: Input validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required',
                errorCode: 'MISSING_CREDENTIALS'
            });
        }

        // SECURITY: Get sanitized username from middleware (already processed)
        const sanitizedUsername = req.rateLimitInfo?.username || username.toString().trim().toLowerCase();
        
        // SECURITY: Add security headers
        res.set({
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block'
        });

        // Authenticate user
        const authResult = await authService.authenticateUser(sanitizedUsername, password);

        // SECURITY: Record login attempt in database
        if (req.rateLimitInfo) {
            const { ipAddress, userAgent } = req.rateLimitInfo;
            await rateLimitMiddleware.rateLimitService.recordLoginAttempt(
                sanitizedUsername, 
                ipAddress, 
                userAgent, 
                authResult.success
            );
        }

        if (!authResult.success) {
            // Check if this failed attempt should trigger a lockout
            if (req.rateLimitInfo) {
                const lockStatus = await rateLimitMiddleware.rateLimitService.isUsernameLocked(sanitizedUsername);
                if (lockStatus.locked) {
                    return res.status(423).json({
                        success: false,
                        message: 'Account temporarily locked due to multiple failed login attempts. Please try again later.',
                        error: 'ACCOUNT_LOCKED',
                        lockedUntil: lockStatus.lockedUntil,
                        retryAfter: rateLimitMiddleware.calculateRetryAfter(lockStatus.lockedUntil)
                    });
                }
                
                // Add rate limiting headers for failed attempts
                await rateLimitMiddleware.addRateLimitHeaders(req, res, sanitizedUsername, req.rateLimitInfo.ipAddress);
            }
            
            return res.status(401).json({
                success: false,
                message: authResult.message,
                errorCode: authResult.errorCode || 'LOGIN_FAILED'
            });
        }

        // Store user session (for backward compatibility)
        req.session.user = authResult.user;

        // SECURITY: Remove sensitive data and add security info
        const response = {
            success: true,
            message: 'Login successful',
            user: {
                id: authResult.user.id,
                username: authResult.user.username,
                role: authResult.user.role
            },
            tokens: authResult.tokens,
            authType: 'hybrid', // Supports both JWT and session
            loginTime: new Date().toISOString(),
            sessionExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        };

        res.json(response);
    } catch (error) {
        // SECURITY: Log system errors without exposing details
        console.error('🚨 Login system error:', error);
        
        // SECURITY: Record failed attempt due to system error
        if (req.rateLimitInfo) {
            const { username, ipAddress, userAgent } = req.rateLimitInfo;
            try {
                await rateLimitMiddleware.rateLimitService.recordLoginAttempt(
                    username, 
                    ipAddress, 
                    userAgent, 
                    false
                );
            } catch (logError) {
                console.error('Error logging failed attempt:', logError);
            }
        }
        
        res.status(500).json({
            success: false,
            message: 'Authentication service temporarily unavailable. Please try again later.',
            errorCode: 'SYSTEM_ERROR'
        });
    }
});

// POST /auth/logout - User logout
router.post('/logout', requireAuth, (req, res) => {
    try {
        const username = req.session.user.username;
        
        // Destroy session
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to logout properly'
                });
            }

            res.json({
                success: true,
                message: `User ${username} logged out successfully`
            });
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
});

// GET /auth/profile - Get current user profile
router.get('/profile', requireAuth, (req, res) => {
    try {
        const user = req.session.user;
        
        res.json({
            success: true,
            message: 'Profile retrieved successfully',
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Profile retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve profile'
        });
    }
});

// POST /auth/register - Create new user (admin only)
router.post('/register', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { username, password, role } = req.body;

        // Validation
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'Username, password, and role are required'
            });
        }

        if (username.length < 3) {
            return res.status(400).json({
                success: false,
                message: 'Username must be at least 3 characters long'
            });
        }

        if (password.length < 4) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 4 characters long'
            });
        }

        // Create user
        const createResult = await authService.createUser(username, password, role);

        if (!createResult.success) {
            return res.status(400).json({
                success: false,
                message: createResult.message
            });
        }

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: createResult.userId,
                username,
                role
            }
        });
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during user creation'
        });
    }
});

// GET /auth/users - Get all users (admin only)
router.get('/users', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const usersResult = await authService.getAllUsers();

        if (!usersResult.success) {
            return res.status(500).json({
                success: false,
                message: usersResult.message
            });
        }

        res.json({
            success: true,
            message: 'Users retrieved successfully',
            users: usersResult.users,
            count: usersResult.users.length
        });
    } catch (error) {
        console.error('Users retrieval error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users'
        });
    }
});

// POST /auth/refresh - Refresh JWT tokens
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const refreshResult = await authService.refreshTokens(refreshToken);

        if (!refreshResult.success) {
            const statusCode = refreshResult.expired ? 401 : 400;
            return res.status(statusCode).json({
                success: false,
                message: refreshResult.message,
                code: refreshResult.expired ? 'REFRESH_TOKEN_EXPIRED' : 'INVALID_REFRESH_TOKEN'
            });
        }

        res.json({
            success: true,
            message: 'Tokens refreshed successfully',
            tokens: refreshResult.tokens,
            user: {
                id: refreshResult.user.id,
                username: refreshResult.user.username,
                role: refreshResult.user.role
            }
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during token refresh'
        });
    }
});

// POST /auth/change-password - Change user password
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        // Validation
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        const changeResult = await authService.changePassword(userId, currentPassword, newPassword);

        if (!changeResult.success) {
            return res.status(400).json({
                success: false,
                message: changeResult.message,
                errors: changeResult.errors
            });
        }

        res.json({
            success: true,
            message: 'Password changed successfully',
            passwordStrength: changeResult.passwordStrength
        });
    } catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during password change'
        });
    }
});

// GET /auth/token-info - Get JWT token information (for debugging)
router.get('/token-info', requireAuth, (req, res) => {
    try {
        if (req.authType !== 'jwt') {
            return res.status(400).json({
                success: false,
                message: 'This endpoint is only available for JWT authentication'
            });
        }

        const authHeader = req.headers.authorization;
        const token = authService.jwtService.extractTokenFromHeader(authHeader);
        const tokenInfo = authService.jwtService.decodeToken(token);

        res.json({
            success: true,
            message: 'Token information retrieved successfully',
            tokenInfo: {
                header: tokenInfo.header,
                payload: tokenInfo.payload,
                expiresAt: new Date(tokenInfo.payload.exp * 1000).toISOString(),
                issuedAt: new Date(tokenInfo.payload.iat * 1000).toISOString(),
                issuer: tokenInfo.payload.iss,
                audience: tokenInfo.payload.aud
            },
            user: req.user
        });
    } catch (error) {
        console.error('Token info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve token information'
        });
    }
});

// SECURITY MANAGEMENT ENDPOINTS (Admin only)

// GET /auth/security/stats - Get security statistics
router.get('/security/stats', requireAuth, requireRole(['admin']), rateLimitMiddleware.getRateLimitStats());

// POST /auth/security/unlock - Unlock a locked account
router.post('/security/unlock', requireAuth, requireRole(['admin']), rateLimitMiddleware.unlockAccount());

// GET /auth/security/attempts/:username - Get login attempts for a specific user (admin only)
router.get('/security/attempts/:username', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { username } = req.params;
        const { limit = 50 } = req.query;
        
        // Get recent login attempts for this user
        const rateLimitService = rateLimitMiddleware.rateLimitService;
        const attempts = await new Promise((resolve, reject) => {
            const query = `
                SELECT attempt_time, success, ip_address, user_agent
                FROM login_attempts 
                WHERE identifier = ? AND identifier_type = 'username'
                ORDER BY attempt_time DESC 
                LIMIT ?
            `;
            
            rateLimitService.db.db.all(query, [username, parseInt(limit)], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            message: 'Login attempts retrieved successfully',
            username: username,
            attempts: attempts.map(attempt => ({
                timestamp: attempt.attempt_time,
                success: attempt.success === 1,
                ipAddress: attempt.ip_address,
                userAgent: attempt.user_agent
            })),
            totalAttempts: attempts.length
        });
    } catch (error) {
        console.error('Error getting login attempts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve login attempts'
        });
    }
});

// GET /auth/security/locked-accounts - Get all currently locked accounts
router.get('/security/locked-accounts', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const rateLimitService = rateLimitMiddleware.rateLimitService;
        const lockedAccounts = await new Promise((resolve, reject) => {
            const query = `
                SELECT username, locked_at, locked_until, failed_attempts, locked_by
                FROM account_lockouts 
                WHERE locked_until > datetime('now')
                ORDER BY locked_at DESC
            `;
            
            rateLimitService.db.db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows || []);
            });
        });
        
        res.json({
            success: true,
            message: 'Locked accounts retrieved successfully',
            lockedAccounts: lockedAccounts.map(account => ({
                username: account.username,
                lockedAt: account.locked_at,
                lockedUntil: account.locked_until,
                failedAttempts: account.failed_attempts,
                lockedBy: account.locked_by
            })),
            totalLocked: lockedAccounts.length
        });
    } catch (error) {
        console.error('Error getting locked accounts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve locked accounts'
        });
    }
});

// GET /auth/security/report - Generate comprehensive security report
router.get('/security/report', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { hours = 24 } = req.query;
        const SecurityMaintenanceService = require('../services/SecurityMaintenanceService');
        const maintenanceService = new SecurityMaintenanceService();
        
        const report = await maintenanceService.getSecurityReport(parseInt(hours));
        
        res.json({
            success: true,
            message: 'Security report generated successfully',
            report
        });
    } catch (error) {
        console.error('Error generating security report:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate security report'
        });
    }
});

module.exports = router;