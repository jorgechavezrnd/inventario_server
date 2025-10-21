const DatabaseManager = require('../database/DatabaseManager');
const PasswordService = require('../services/PasswordService');

async function migratePasswords() {
    console.log('🔄 Starting password migration to encrypted format...');
    
    const db = new DatabaseManager();
    const passwordService = new PasswordService();
    
    try {
        // Initialize tables first
        await db.initializeTables();
        
        // Get all users
        const users = await db.getAllUsers();
        console.log(`📊 Found ${users.length} users to check`);
        
        let migratedCount = 0;
        let skippedCount = 0;
        
        for (const user of users) {
            // Get full user data including password
            const fullUserData = await db.getUserById(user.id);
            
            if (!passwordService.isPasswordHashed(fullUserData.password)) {
                // Password is plain text, need to hash it
                console.log(`🔐 Migrating password for user: ${user.username}`);
                
                const hashedPassword = await passwordService.hashPassword(fullUserData.password);
                await db.updateUserPassword(user.id, hashedPassword);
                
                migratedCount++;
                console.log(`   ✅ Password updated for ${user.username}`);
            } else {
                console.log(`   ⏭️  Password already hashed for ${user.username}`);
                skippedCount++;
            }
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 Password migration completed!');
        console.log('='.repeat(50));
        console.log(`📈 Migration Summary:`);
        console.log(`   • Users migrated: ${migratedCount}`);
        console.log(`   • Users skipped (already hashed): ${skippedCount}`);
        console.log(`   • Total users: ${users.length}`);
        console.log('');
        console.log('🔒 All passwords are now securely encrypted with bcrypt!');
        console.log('🚀 JWT authentication is now available alongside session auth');
        console.log('='.repeat(50));
        
    } catch (error) {
        console.error('❌ Error during password migration:', error);
        process.exit(1);
    } finally {
        db.close();
    }
}

// Run the migration if this script is called directly
if (require.main === module) {
    migratePasswords().catch(console.error);
}

module.exports = migratePasswords;