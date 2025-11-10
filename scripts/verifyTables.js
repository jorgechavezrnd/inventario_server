const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking database table structures...\n');

// Check users table
db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
        db.close();
        return;
    }
    
    console.log('users columns:');
    rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
    });
    
    console.log('\nChecking login_attempts table structure...\n');
    
    // Check login_attempts table
    db.all("PRAGMA table_info(login_attempts)", (err, rows) => {
        if (err) {
            console.error('Error:', err);
            db.close();
            return;
        }
        
        console.log('login_attempts columns:');
        rows.forEach(row => {
            console.log(`  - ${row.name} (${row.type})`);
        });
        
        console.log('\nChecking account_lockouts table structure...\n');
        
        db.all("PRAGMA table_info(account_lockouts)", (err, rows) => {
            if (err) {
                console.error('Error:', err);
                db.close();
                return;
            }
            
            console.log('account_lockouts columns:');
            rows.forEach(row => {
                console.log(`  - ${row.name} (${row.type})`);
            });
            
            db.close();
        });
    });
});
