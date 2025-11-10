const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseManager {
    constructor() {
        // Create database file in the project root
        const dbPath = path.join(__dirname, '..', 'database.sqlite');
        this.db = new sqlite3.Database(dbPath);
        
        // Enable foreign key constraints
        this.db.run('PRAGMA foreign_keys = ON');
    }

    async initializeTables() {
        return new Promise((resolve, reject) => {
            // Create users table
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password TEXT NOT NULL,
                    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'admin_manage_users')),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Create products table
            const createProductsTable = `
                CREATE TABLE IF NOT EXISTS products (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    description TEXT,
                    price REAL NOT NULL,
                    quantity INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            // Create login_attempts table for rate limiting
            const createLoginAttemptsTable = `
                CREATE TABLE IF NOT EXISTS login_attempts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    identifier TEXT,
                    identifier_type TEXT,
                    ip_address TEXT NOT NULL,
                    user_agent TEXT,
                    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
                    success INTEGER NOT NULL DEFAULT 0
                )
            `;

            // Create account_lockouts table for account lockout tracking
            const createAccountLockoutsTable = `
                CREATE TABLE IF NOT EXISTS account_lockouts (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    failed_attempts INTEGER NOT NULL DEFAULT 0,
                    locked_until DATETIME,
                    last_attempt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `;

            this.db.run(createUsersTable, (err) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                this.db.run(createProductsTable, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    this.db.run(createLoginAttemptsTable, (err) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        this.db.run(createAccountLockoutsTable, (err) => {
                            if (err) {
                                reject(err);
                                return;
                            }
                            
                            console.log('Database tables initialized successfully');
                            resolve();
                        });
                    });
                });
            });
        });
    }

    // User operations
    createUser(username, password, role) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
            stmt.run([username, password, role], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastInsertRowid: this.lastID, changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getAllUsers() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT id, username, role, created_at FROM users', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    // Product operations
    createProduct(name, description, price, quantity) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                INSERT INTO products (name, description, price, quantity) 
                VALUES (?, ?, ?, ?)
            `);
            stmt.run([name, description, price, quantity], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastInsertRowid: this.lastID, changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    getAllProducts() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT * FROM products ORDER BY created_at DESC', [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getProductById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM products WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    updateProduct(id, name, description, price, quantity) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare(`
                UPDATE products 
                SET name = ?, description = ?, price = ?, quantity = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `);
            stmt.run([name, description, price, quantity, id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    deleteProduct(id) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('DELETE FROM products WHERE id = ?');
            stmt.run([id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    // Get user by ID
    getUserById(id) {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    // Update user password
    updateUserPassword(userId, hashedPassword) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('UPDATE users SET password = ? WHERE id = ?');
            stmt.run([hashedPassword, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ changes: this.changes });
                }
            });
            stmt.finalize();
        });
    }

    // Update user role
    updateUserRole(userId, role) {
        return new Promise((resolve, reject) => {
            const stmt = this.db.prepare('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
            stmt.run([role, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
            stmt.finalize();
        });
    }

    // Utility method to check if database has users
    hasUsers() {
        return new Promise((resolve, reject) => {
            this.db.get('SELECT COUNT(*) as count FROM users', [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row.count > 0);
                }
            });
        });
    }

    // Close database connection
    close() {
        this.db.close();
    }
}

module.exports = DatabaseManager;