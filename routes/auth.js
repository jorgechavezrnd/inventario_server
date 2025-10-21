const express = require('express');
const router = express.Router();
const AuthService = require('../services/AuthService');
const { requireAuth, requireRole } = require('../middleware/auth');

const authService = new AuthService();

// POST /auth/login - User login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username and password are required'
            });
        }

        // Authenticate user
        const authResult = await authService.authenticateUser(username, password);

        if (!authResult.success) {
            return res.status(401).json({
                success: false,
                message: authResult.message
            });
        }

        // Store user session (for backward compatibility)
        req.session.user = authResult.user;

        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: authResult.user.id,
                username: authResult.user.username,
                role: authResult.user.role
            },
            tokens: authResult.tokens,
            authType: 'hybrid' // Supports both JWT and session
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
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

module.exports = router;