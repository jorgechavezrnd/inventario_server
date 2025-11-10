const DatabaseManager = require('../database/DatabaseManager');
const PasswordService = require('../services/PasswordService');

async function initializeDatabase(cleanFirst = false) {
    console.log('Initializing database with sample data...');
    
    if (cleanFirst) {
        console.log('🧹 Clean mode enabled - will clear existing data first');
    }
    
    const db = new DatabaseManager();
    
    try {
        // Clean existing data first (if requested)
        if (cleanFirst) {
            console.log('🧹 Cleaning existing data...');
        
        // Clear all tables
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM login_attempts', (err) => {
                if (err && !err.message.includes('no such table')) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM account_lockouts', (err) => {
                if (err && !err.message.includes('no such table')) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM products', (err) => {
                if (err && !err.message.includes('no such table')) reject(err);
                else resolve();
            });
        });
        
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM users', (err) => {
                if (err && !err.message.includes('no such table')) reject(err);
                else resolve();
            });
        });
        
        // Reset auto-increment counters
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM sqlite_sequence', (err) => {
                if (err && !err.message.includes('no such table')) reject(err);
                else resolve();
            });
        });
        
            console.log('✅ Existing data cleaned');
        }
        
        // Initialize tables first
        await db.initializeTables();
        
        // Create sample users
        console.log('Creating sample users...');
        
        // Check if users already exist
        const existingAdmin = await db.getUserByUsername('admin');
        const existingViewer = await db.getUserByUsername('viewer');
        const existingAdminUsers = await db.getUserByUsername('adminusers');
        
        // Create password service instance
        const passwordService = new PasswordService();
        
        if (!existingAdmin) {
            // Hash the password before storing
            const hashedAdminPassword = await passwordService.hashPassword('admin123');
            await db.createUser('admin', hashedAdminPassword, 'admin');
            console.log('✅ Created admin user (username: admin, password: admin123) - Password encrypted');
        } else {
            console.log('ℹ️  Admin user already exists');
        }
        
        if (!existingViewer) {
            // Hash the password before storing
            const hashedViewerPassword = await passwordService.hashPassword('viewer123');
            await db.createUser('viewer', hashedViewerPassword, 'viewer');
            console.log('✅ Created viewer user (username: viewer, password: viewer123) - Password encrypted');
        } else {
            console.log('ℹ️  Viewer user already exists');
        }
        
        if (!existingAdminUsers) {
            // Hash the password before storing
            const hashedAdminUsersPassword = await passwordService.hashPassword('adminusers123');
            await db.createUser('adminusers', hashedAdminUsersPassword, 'admin_manage_users');
            console.log('✅ Created admin_manage_users user (username: adminusers, password: adminusers123) - Password encrypted');
        } else {
            console.log('ℹ️  Admin users manager already exists');
        }
        
        // Create sample products
        console.log('Creating sample products...');
        
        const sampleProducts = [
            {
                name: 'Laptop Dell XPS 13',
                description: 'High-performance ultrabook with Intel Core i7 processor',
                price: 1299.99,
                quantity: 5
            },
            {
                name: 'Wireless Mouse',
                description: 'Ergonomic wireless mouse with USB receiver',
                price: 29.99,
                quantity: 25
            },
            {
                name: 'USB-C Hub',
                description: 'Multi-port USB-C hub with HDMI, USB 3.0, and ethernet',
                price: 79.99,
                quantity: 15
            },
            {
                name: 'Mechanical Keyboard',
                description: 'RGB backlit mechanical keyboard with blue switches',
                price: 149.99,
                quantity: 8
            },
            {
                name: 'Monitor 27" 4K',
                description: '27-inch 4K UHD monitor with IPS panel',
                price: 399.99,
                quantity: 3
            },
            {
                name: 'Webcam HD',
                description: '1080p HD webcam with built-in microphone',
                price: 89.99,
                quantity: 12
            },
            {
                name: 'External SSD 1TB',
                description: 'Portable external SSD with USB 3.2 Gen 2',
                price: 129.99,
                quantity: 10
            },
            {
                name: 'Bluetooth Headphones',
                description: 'Noise-cancelling over-ear bluetooth headphones',
                price: 199.99,
                quantity: 7
            }
        ];
        
        // Check how many products already exist
        const existingProducts = await db.getAllProducts();
        
        if (existingProducts.length === 0) {
            for (const product of sampleProducts) {
                await db.createProduct(product.name, product.description, product.price, product.quantity);
                console.log(`✅ Created product: ${product.name}`);
            }
        } else {
            console.log(`ℹ️  Database already contains ${existingProducts.length} products`);
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Database initialization completed!');
        console.log('='.repeat(50));
        console.log('📝 Sample Users Created:');
        console.log('   👤 Admin User:');
        console.log('      Username: admin');
        console.log('      Password: admin123');
        console.log('      Role: admin (can create, read, update, delete inventory)');
        console.log('');
        console.log('   👤 Viewer User:');
        console.log('      Username: viewer');
        console.log('      Password: viewer123');
        console.log('      Role: viewer (can only read inventory)');
        console.log('');
        console.log('   👤 User Management Admin:');
        console.log('      Username: adminusers');
        console.log('      Password: adminusers123');
        console.log('      Role: admin_manage_users (can manage users and roles)');
        console.log('');
        console.log('📦 Sample Products:');
        console.log(`   ${sampleProducts.length} products added to inventory`);
        console.log('');
        console.log('🚀 You can now start the server with: npm start');
        console.log('🌐 Server will be available at: http://localhost:3000');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        db.close();
    }
}

// Run the initialization if this script is called directly
if (require.main === module) {
    // Check if --clean parameter was passed
    const shouldClean = process.argv.includes('--clean');
    initializeDatabase(shouldClean).catch(console.error);
}

module.exports = initializeDatabase;