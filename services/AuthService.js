const DatabaseManager = require('../database/DatabaseManager');
const PasswordService = require('./PasswordService');
const JWTService = require('./JWTService');

class AuthService {
    constructor() {
        this.db = new DatabaseManager();
        this.passwordService = new PasswordService();
        this.jwtService = new JWTService();
    }

    // Validate password using bcrypt or fallback to plain text for existing users
    async validatePassword(plainPassword, storedPassword) {
        if (this.passwordService.isPasswordHashed(storedPassword)) {
            // Use bcrypt for hashed passwords
            return await this.passwordService.verifyPassword(plainPassword, storedPassword);
        } else {
            // Fallback for existing plain text passwords (for migration)
            return plainPassword === storedPassword;
        }
    }

    // Authenticate user and generate JWT tokens
    async authenticateUser(username, password) {
        try {
            const user = await this.db.getUserByUsername(username);
            
            // SECURITY: Always check password even if user doesn't exist
            // This prevents user enumeration through timing attacks
            if (!user) {
                // Perform dummy hash operation to maintain consistent timing
                await this.passwordService.hashPassword('dummy_password_to_prevent_timing_attack');
                
                // SECURITY: Generic error message to prevent user enumeration
                return { 
                    success: false, 
                    message: 'Invalid username or password',
                    errorCode: 'INVALID_CREDENTIALS'
                };
            }

            const isPasswordValid = await this.validatePassword(password, user.password);
            if (!isPasswordValid) {
                // SECURITY: Same generic message for invalid password
                return { 
                    success: false, 
                    message: 'Invalid username or password',
                    errorCode: 'INVALID_CREDENTIALS'
                };
            }

            // If user has plain text password, update it to hashed version
            if (!this.passwordService.isPasswordHashed(user.password)) {
                const hashedPassword = await this.passwordService.hashPassword(password);
                await this.db.updateUserPassword(user.id, hashedPassword);
                console.log(`🔐 Updated password hash for user: ${username}`);
            }

            // Generate JWT tokens
            const { password: _, ...userWithoutPassword } = user;
            const tokens = this.jwtService.generateTokens(userWithoutPassword);

            return { 
                success: true, 
                user: userWithoutPassword,
                tokens,
                message: 'Authentication successful'
            };
        } catch (error) {
            console.error('Authentication error:', error);
            
            // SECURITY: Generic error message for system errors
            return { 
                success: false, 
                message: 'Invalid username or password',
                errorCode: 'AUTHENTICATION_ERROR'
            };
        }
    }

    // Create new user (for admin use)
    async createUser(username, password, role) {
        try {
            // Check if user already exists
            const existingUser = await this.db.getUserByUsername(username);
            if (existingUser) {
                return { success: false, message: 'User already exists' };
            }

            // Validate role
            if (!['admin', 'viewer'].includes(role)) {
                return { success: false, message: 'Invalid role. Must be admin or viewer' };
            }

            // Validate password strength
            const passwordValidation = this.passwordService.validatePasswordStrength(password);
            if (!passwordValidation.valid) {
                return { 
                    success: false, 
                    message: 'Password validation failed',
                    errors: passwordValidation.errors
                };
            }

            // Hash the password
            const hashedPassword = await this.passwordService.hashPassword(password);

            const result = await this.db.createUser(username, hashedPassword, role);
            return { 
                success: true, 
                message: 'User created successfully',
                userId: result.lastInsertRowid,
                passwordStrength: {
                    score: passwordValidation.strength,
                    description: this.passwordService.getPasswordStrengthDescription(passwordValidation.strength)
                }
            };
        } catch (error) {
            console.error('User creation error:', error);
            return { success: false, message: 'Failed to create user' };
        }
    }

    // Get all users (for admin use)
    async getAllUsers() {
        try {
            const users = await this.db.getAllUsers();
            return { success: true, users };
        } catch (error) {
            console.error('Get users error:', error);
            return { success: false, message: 'Failed to retrieve users' };
        }
    }

    // Refresh JWT tokens
    async refreshTokens(refreshToken) {
        try {
            const verification = this.jwtService.verifyRefreshToken(refreshToken);
            
            if (!verification.valid) {
                return { 
                    success: false, 
                    message: 'Invalid refresh token',
                    expired: verification.expired
                };
            }

            // Get user from database to ensure they still exist
            const user = await this.db.getUserById(verification.decoded.id);
            if (!user) {
                return { success: false, message: 'User no longer exists' };
            }

            // Generate new tokens
            const { password: _, ...userWithoutPassword } = user;
            const tokens = this.jwtService.generateTokens(userWithoutPassword);

            return {
                success: true,
                tokens,
                user: userWithoutPassword,
                message: 'Tokens refreshed successfully'
            };
        } catch (error) {
            console.error('Token refresh error:', error);
            return { success: false, message: 'Failed to refresh tokens' };
        }
    }

    // Verify JWT access token
    verifyAccessToken(token) {
        return this.jwtService.verifyAccessToken(token);
    }

    // Change user password
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await this.db.getUserById(userId);
            if (!user) {
                return { success: false, message: 'User not found' };
            }

            // Verify current password
            const isCurrentPasswordValid = await this.validatePassword(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return { success: false, message: 'Current password is incorrect' };
            }

            // Validate new password strength
            const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
            if (!passwordValidation.valid) {
                return { 
                    success: false, 
                    message: 'New password validation failed',
                    errors: passwordValidation.errors
                };
            }

            // Hash new password
            const hashedPassword = await this.passwordService.hashPassword(newPassword);
            
            // Update password in database
            await this.db.updateUserPassword(userId, hashedPassword);

            return {
                success: true,
                message: 'Password changed successfully',
                passwordStrength: {
                    score: passwordValidation.strength,
                    description: this.passwordService.getPasswordStrengthDescription(passwordValidation.strength)
                }
            };
        } catch (error) {
            console.error('Password change error:', error);
            return { success: false, message: 'Failed to change password' };
        }
    }
}

module.exports = AuthService;