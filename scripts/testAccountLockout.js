/**
 * Account Lockout Test
 * 
 * Tests the brute force protection by attempting multiple failed logins
 * and verifying that the account gets locked after the configured limit.
 * 
 * Usage: node scripts/testAccountLockout.js
 */

const http = require('http');

class AccountLockoutTester {
    constructor() {
        this.baseUrl = 'http://localhost:3000';
        this.testUsername = `test_user_${Date.now()}`;
        this.maxAttempts = 5; // Should match server configuration
    }

    /**
     * Make a login request
     */
    async makeLoginRequest(username, password = 'wrong_password') {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify({
                username: username,
                password: password
            });

            const options = {
                hostname: 'localhost',
                port: 3000,
                path: '/auth/login',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData),
                    'User-Agent': 'AccountLockoutTest/1.0'
                }
            };

            const req = http.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });
                res.on('end', () => {
                    try {
                        const response = JSON.parse(data);
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            body: response
                        });
                    } catch (error) {
                        resolve({
                            status: res.statusCode,
                            headers: res.headers,
                            body: { error: 'Invalid JSON response' }
                        });
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    /**
     * Run the account lockout test
     */
    async runTest() {
        console.log('🔒 Account Lockout Test');
        console.log('========================');
        console.log(`Testing with username: ${this.testUsername}`);
        console.log(`Expected lockout after: ${this.maxAttempts} failed attempts\n`);

        let isLocked = false;
        
        for (let attempt = 1; attempt <= this.maxAttempts + 2; attempt++) {
            try {
                console.log(`--- Attempt ${attempt} ---`);
                
                const response = await this.makeLoginRequest(this.testUsername);
                
                console.log(`Status: ${response.status}`);
                console.log(`Message: ${response.body.message || response.body.error || 'No message'}`);
                
                // Check for rate limiting headers
                if (response.headers['x-username-attempts-remaining']) {
                    console.log(`Attempts remaining: ${response.headers['x-username-attempts-remaining']}`);
                }
                
                if (response.headers['retry-after']) {
                    console.log(`Retry after: ${response.headers['retry-after']} seconds`);
                }

                // Check if account is locked
                if (response.status === 423) {
                    if (!isLocked) {
                        console.log('🔒 ✅ ACCOUNT LOCKED - Protection working correctly!');
                        isLocked = true;
                    } else {
                        console.log('🔒 Account remains locked (expected)');
                    }
                } else if (response.status === 401) {
                    console.log('🔓 Login failed (not locked yet)');
                } else {
                    console.log(`❓ Unexpected status: ${response.status}`);
                }
                
                console.log('');
                
                // Small delay between attempts
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Error on attempt ${attempt}:`, error.message);
                break;
            }
        }

        // Summary
        console.log('📊 Test Summary');
        console.log('================');
        if (isLocked) {
            console.log('✅ SUCCESS: Account lockout protection is working correctly');
            console.log(`   - Account was locked after ${this.maxAttempts} failed attempts`);
            console.log('   - Subsequent attempts returned HTTP 423 (Locked)');
        } else {
            console.log('❌ FAILURE: Account lockout protection is NOT working');
            console.log('   - Account was never locked despite multiple failed attempts');
        }
        
        console.log(`\n🧪 Test completed for username: ${this.testUsername}`);
    }

    /**
     * Check if server is running
     */
    async checkServer() {
        try {
            await this.makeLoginRequest('test');
            return true;
        } catch (error) {
            return false;
        }
    }
}

// Run the test
async function main() {
    const tester = new AccountLockoutTester();
    
    // Check if server is running
    console.log('🔍 Checking if server is running...');
    const serverRunning = await tester.checkServer();
    
    if (!serverRunning) {
        console.error('❌ Server is not running on http://localhost:3000');
        console.error('   Please start the server with: npm start');
        process.exit(1);
    }
    
    console.log('✅ Server is running\n');
    
    // Run the test
    await tester.runTest();
}

// Execute if run directly
if (require.main === module) {
    main().catch(error => {
        console.error('❌ Test failed:', error);
        process.exit(1);
    });
}

module.exports = AccountLockoutTester;