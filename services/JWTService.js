const jwt = require('jsonwebtoken');

class JWTService {
    constructor() {
        // In production, use environment variables for these secrets
        this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'inventory-access-secret-change-in-production';
        this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'inventory-refresh-secret-change-in-production';
        this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m'; // 15 minutes
        this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 days
    }

    // Generate access token
    generateAccessToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            role: user.role,
            type: 'access'
        };

        return jwt.sign(payload, this.accessTokenSecret, {
            expiresIn: this.accessTokenExpiry,
            issuer: 'inventory-server',
            audience: 'inventory-client'
        });
    }

    // Generate refresh token
    generateRefreshToken(user) {
        const payload = {
            id: user.id,
            username: user.username,
            type: 'refresh'
        };

        return jwt.sign(payload, this.refreshTokenSecret, {
            expiresIn: this.refreshTokenExpiry,
            issuer: 'inventory-server',
            audience: 'inventory-client'
        });
    }

    // Generate both tokens
    generateTokens(user) {
        return {
            accessToken: this.generateAccessToken(user),
            refreshToken: this.generateRefreshToken(user),
            expiresIn: this.accessTokenExpiry
        };
    }

    // Verify access token
    verifyAccessToken(token) {
        try {
            const decoded = jwt.verify(token, this.accessTokenSecret, {
                issuer: 'inventory-server',
                audience: 'inventory-client'
            });
            
            if (decoded.type !== 'access') {
                throw new Error('Invalid token type');
            }
            
            return { valid: true, decoded };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message,
                expired: error.name === 'TokenExpiredError'
            };
        }
    }

    // Verify refresh token
    verifyRefreshToken(token) {
        try {
            const decoded = jwt.verify(token, this.refreshTokenSecret, {
                issuer: 'inventory-server',
                audience: 'inventory-client'
            });
            
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid token type');
            }
            
            return { valid: true, decoded };
        } catch (error) {
            return { 
                valid: false, 
                error: error.message,
                expired: error.name === 'TokenExpiredError'
            };
        }
    }

    // Extract token from Authorization header
    extractTokenFromHeader(authHeader) {
        if (!authHeader) {
            return null;
        }

        const parts = authHeader.split(' ');
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return null;
        }

        return parts[1];
    }

    // Get token info without verification (for debugging)
    decodeToken(token) {
        try {
            return jwt.decode(token, { complete: true });
        } catch (error) {
            return null;
        }
    }
}

module.exports = JWTService;