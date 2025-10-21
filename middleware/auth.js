const JWTService = require('../services/JWTService');
const jwtService = new JWTService();

// Authentication middleware - Support both JWT and session authentication
const requireAuth = (req, res, next) => {
    // First try JWT authentication
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (token) {
        const verification = jwtService.verifyAccessToken(token);
        if (verification.valid) {
            // JWT authentication successful
            req.user = verification.decoded;
            req.authType = 'jwt';
            return next();
        } else if (verification.expired) {
            return res.status(401).json({
                success: false,
                message: 'Access token expired. Please refresh your token.',
                code: 'TOKEN_EXPIRED'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token.',
                code: 'INVALID_TOKEN'
            });
        }
    }
    
    // Fallback to session authentication
    if (req.session && req.session.user) {
        req.user = req.session.user;
        req.authType = 'session';
        return next();
    }
    
    // No valid authentication found
    return res.status(401).json({
        success: false,
        message: 'Authentication required. Please login first or provide a valid access token.',
        code: 'NO_AUTH'
    });
};

// Role-based access control middleware
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // Authentication is handled by requireAuth middleware
        // This middleware should be used after requireAuth
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please login first.'
            });
        }

        const userRole = req.user.role;
        
        // Check if user's role is in the allowed roles array
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}. Your role: ${userRole}`,
                code: 'INSUFFICIENT_PERMISSIONS'
            });
        }

        next();
    };
};

// Specific role middleware functions
const requireAdmin = requireRole(['admin']);
const requireAdminOrViewer = requireRole(['admin', 'viewer']);

// Middleware to attach user info to request (optional, for non-protected routes)
const attachUserInfo = (req, res, next) => {
    // Try JWT first
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (token) {
        const verification = jwtService.verifyAccessToken(token);
        if (verification.valid) {
            req.user = verification.decoded;
            req.authType = 'jwt';
        }
    } else if (req.session && req.session.user) {
        // Fallback to session
        req.user = req.session.user;
        req.authType = 'session';
    }
    
    next();
};

// Middleware for logging requests (enhanced with auth type)
const logRequest = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const user = req.user?.username || 'anonymous';
    const role = req.user?.role || 'none';
    const authType = req.authType || 'none';
    
    console.log(`[${timestamp}] ${req.method} ${req.path} - User: ${user} (${role}) - Auth: ${authType}`);
    next();
};

module.exports = {
    requireAuth,
    requireRole,
    requireAdmin,
    requireAdminOrViewer,
    attachUserInfo,
    logRequest
};