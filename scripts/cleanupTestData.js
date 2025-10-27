/**
 * Script to clean up test data from security tables
 */

const DatabaseManager = require('../database/DatabaseManager');

async function cleanupTestData() {
    const db = new DatabaseManager();
    
    try {
        console.log('🧹 Cleaning up test data...');
        
        // Clear login_attempts table
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM login_attempts', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Clear account_lockouts table
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM account_lockouts', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        // Reset auto-increment counters
        await new Promise((resolve, reject) => {
            db.db.run('DELETE FROM sqlite_sequence WHERE name IN ("login_attempts", "account_lockouts")', (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        
        console.log('✅ Test data cleaned successfully');
        console.log('   - login_attempts table cleared');
        console.log('   - account_lockouts table cleared');
        console.log('   - Auto-increment counters reset');
        
        // Show current counts
        const loginAttempts = await new Promise((resolve) => {
            db.db.get('SELECT COUNT(*) as count FROM login_attempts', (err, row) => {
                resolve(err ? 0 : row.count);
            });
        });
        
        const accountLockouts = await new Promise((resolve) => {
            db.db.get('SELECT COUNT(*) as count FROM account_lockouts', (err, row) => {
                resolve(err ? 0 : row.count);
            });
        });
        
        console.log(`📊 Current record counts:`);
        console.log(`   - login_attempts: ${loginAttempts}`);
        console.log(`   - account_lockouts: ${accountLockouts}`);
        
    } catch (error) {
        console.error('❌ Error cleaning test data:', error);
        process.exit(1);
    } finally {
        db.close();
        console.log('🔒 Database connection closed');
        process.exit(0);
    }
}

// Run cleanup
cleanupTestData();