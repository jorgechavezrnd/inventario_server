const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

// Import middleware
const { attachUserInfo, logRequest } = require('./middleware/auth');

// Import database manager to initialize database
const DatabaseManager = require('./database/DatabaseManager');
const SecurityMaintenanceService = require('./services/SecurityMaintenanceService');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database and security services
const db = new DatabaseManager();
let securityMaintenanceService;

// Middleware setup
app.use(cors({
    origin: true,
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'inventory-server-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Custom middleware
app.use(attachUserInfo);
app.use(logRequest);

// Root endpoint
app.get('/', (req, res) => {
    const user = req.session?.user;
    res.json({
        success: true,
        message: 'Inventory Server API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        authenticated: !!user,
        user: user ? {
            username: user.username,
            role: user.role
        } : null,
        endpoints: {
            auth: {
                login: 'POST /auth/login',
                logout: 'POST /auth/logout',
                profile: 'GET /auth/profile',
                register: 'POST /auth/register (admin only)',
                users: 'GET /auth/users (admin only)'
            },
            products: {
                list: 'GET /products (admin/viewer)',
                get: 'GET /products/:id (admin/viewer)',
                create: 'POST /products (admin only)',
                update: 'PUT /products/:id (admin only)',
                delete: 'DELETE /products/:id (admin only)'
            }
        }
    });
});

// API routes
app.use('/auth', authRoutes);
app.use('/products', productRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        timestamp: new Date().toISOString(),
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down server gracefully...');
    
    // Stop security maintenance service
    if (securityMaintenanceService) {
        securityMaintenanceService.stop();
        console.log('Security maintenance service stopped');
    }
    
    // Close database connection
    if (db) {
        db.close();
        console.log('Database connection closed');
    }
    
    process.exit(0);
});

// Start server
app.listen(PORT, async () => {
    console.log('='.repeat(50));
    console.log('🚀 Inventory Server Started');
    console.log('='.repeat(50));
    console.log(`🌐 Server running on: http://localhost:${PORT}`);
    console.log(`📱 API endpoints available at: http://localhost:${PORT}/`);
    console.log(`💾 Database: SQLite (database.sqlite)`);
    console.log(`🔒 Authentication: Session-based`);
    console.log(`👥 Roles: admin (full access), viewer (read-only)`);
    console.log('='.repeat(50));
    
    // Check if there are any users in the database
    try {
        const hasUsers = await db.hasUsers();
        if (!hasUsers) {
            console.log('⚠️  No users found in database!');
            console.log('💡 Run "npm run init-db" to create sample users');
            console.log('   Default users:');
            console.log('   - admin/admin123 (admin role)');
            console.log('   - viewer/viewer123 (viewer role)');
            console.log('='.repeat(50));
        }
    } catch (error) {
        console.log('⚠️  Could not check database for users');
        console.log('💡 Run "npm run init-db" to initialize the database');
        console.log('='.repeat(50));
    }
    
    // Initialize security maintenance service
    try {
        securityMaintenanceService = new SecurityMaintenanceService();
        console.log('🛡️  Security maintenance service initialized');
    } catch (error) {
        console.error('❌ Failed to initialize security maintenance service:', error);
    }
});

module.exports = app;