const DatabaseManager = require('../database/DatabaseManager');

const db = new DatabaseManager();

// Create tables for login attempt tracking
const createTables = async () => {
    try {
        console.log('Creating login attempt tracking tables...');

        // Use promises to wrap SQLite operations
        const runSQL = (sql) => {
            return new Promise((resolve, reject) => {
                db.db.run(sql, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        };

        // Table for failed login attempts by username/IP
        await runSQL(`
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                identifier TEXT NOT NULL,
                identifier_type TEXT NOT NULL CHECK(identifier_type IN ('username', 'ip')),
                attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                success BOOLEAN DEFAULT FALSE,
                user_agent TEXT,
                ip_address TEXT
            )
        `);

        // Table for account lockouts
        await runSQL(`
            CREATE TABLE IF NOT EXISTS account_lockouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                locked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                locked_until DATETIME NOT NULL,
                failed_attempts INTEGER DEFAULT 0,
                locked_by TEXT DEFAULT 'auto'
            )
        `);

        // Create indexes for better performance
        await runSQL(`
            CREATE INDEX IF NOT EXISTS idx_login_attempts_identifier 
            ON login_attempts(identifier, identifier_type, attempt_time)
        `);

        await runSQL(`
            CREATE INDEX IF NOT EXISTS idx_login_attempts_ip 
            ON login_attempts(ip_address, attempt_time)
        `);

        await runSQL(`
            CREATE INDEX IF NOT EXISTS idx_account_lockouts_username 
            ON account_lockouts(username, locked_until)
        `);

        console.log('✅ Login attempt tracking tables created successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating tables:', error);
        process.exit(1);
    }
};

createTables();