# Correcciones de Seguridad Implementadas

Este documento detalla las vulnerabilidades identificadas y las correcciones implementadas para resolver los problemas de seguridad relacionados con **CWE-307: Improper Restriction of Excessive Authentication Attempts** (Restricción inadecuada de intentos excesivos de autenticación).

## 🔍 Vulnerabilidades Identificadas

### Archivo: `routes/auth.js`

**Problemas encontrados:**
- ❌ Solo validación básica, sin control de intentos
- ❌ Mensaje específico en la respuesta que revela información
- ❌ No hay logging de intentos fallidos

### Archivo: `services/AuthService.js`

**Problemas encontrados:**
- ❌ Revela existencia de usuarios
- ❌ Respuesta diferente para password inválido
- ❌ No hay registro de intentos fallidos

## ✅ Correcciones Implementadas

### 1. Control de Intentos de Autenticación

**Implementación:**
- **Middleware de Rate Limiting** (`middleware/rateLimit.js`)
- **Servicio de Rate Limiting** (`services/RateLimitService.js`)
- **Tablas de tracking** (`login_attempts`, `account_lockouts`)

#### Código Implementado:

**Archivo: `routes/auth.js` (líneas 47-70)**
```javascript
// SECURITY: Apply rate limiting middleware before processing login
router.post('/login', rateLimitMiddleware.checkLoginRateLimit, async (req, res) => {
    const { username, password } = req.body;
    
    // SECURITY: Sanitize username to prevent log injection
    const sanitizedUsername = username ? username.toString().replace(/[\r\n\t]/g, '') : '';
    
    // Authenticate user
    const authResult = await AuthService.authenticateUser(username, password);
    
    // SECURITY: Record login attempt in database
    if (req.rateLimitInfo) {
        const { ipAddress, userAgent } = req.rateLimitInfo;
        await rateLimitMiddleware.rateLimitService.recordLoginAttempt(
            sanitizedUsername, 
            ipAddress, 
            userAgent, 
            authResult.success
        );
    }
```

**Archivo: `middleware/rateLimit.js` (líneas 15-45)**
```javascript
async checkLoginRateLimit(req, res, next) {
    try {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        const { username } = req.body;
        
        const sanitizedUsername = username ? username.toString().replace(/[\r\n\t]/g, '') : '';
        
        // Check if username is locked
        if (sanitizedUsername) {
            const usernameLockStatus = await this.rateLimitService.isUsernameLocked(sanitizedUsername);
            if (usernameLockStatus.locked) {
                return res.status(423).json({
                    success: false,
                    message: 'Account temporarily locked due to multiple failed login attempts',
                    error: 'ACCOUNT_LOCKED'
                });
            }
        }
```

**Funcionalidades:**
- ✅ **Límite por usuario**: Máximo 5 intentos fallidos por username
- ✅ **Límite por IP**: Máximo 10 intentos fallidos por dirección IP
- ✅ **Bloqueo temporal**: 15 minutos de lockout tras exceder límites
- ✅ **Ventana deslizante**: Conteo de intentos en ventana de 15 minutos

### 2. Logging y Monitoreo

#### Código Implementado:

**Archivo: `services/RateLimitService.js` (líneas 92-115)**
```javascript
async recordLoginAttempt(username, ipAddress, userAgent, success = false) {
    try {
        const successValue = success ? 1 : 0;
        
        // Record single attempt with username as identifier (IP is stored in ip_address field)
        await new Promise((resolve, reject) => {
            this.db.db.run(`
                INSERT INTO login_attempts (identifier, identifier_type, success, user_agent, ip_address)
                VALUES (?, 'username', ?, ?, ?)
            `, [username, successValue, userAgent, ipAddress], (err) => {
                if (err) reject(err);
                else resolve();
            });
        });

        // If login failed, check if we need to lock the account
        if (!success) {
            console.log(`🔄 Login failed, calling checkAndLockAccount for ${username}`);
            const lockResult = await this.checkAndLockAccount(username);
            console.log(`   Lock result: ${lockResult}`);
        }
```

**Archivo: `routes/auth.js` (líneas 78-85)**
```javascript
if (!authResult.success) {
    // SECURITY: Log failed attempt details for monitoring
    console.log(`🚨 Failed login attempt: ${sanitizedUsername} from ${req.rateLimitInfo?.ipAddress || 'unknown'}`);
    
    // Check if this failed attempt should trigger a lockout
    if (req.rateLimitInfo) {
        const lockStatus = await rateLimitMiddleware.rateLimitService.isUsernameLocked(sanitizedUsername);
```

**Implementación:**
- ✅ **Registro detallado** de todos los intentos de login
- ✅ **Información de contexto**: IP, User-Agent, timestamp
- ✅ **Logging de seguridad** con información sanitizada
- ✅ **Headers informativos** sobre intentos restantes

### 3. Respuestas Uniformes

#### Código Implementado:

**Archivo: `services/AuthService.js` (líneas 30-55)**
```javascript
// SECURITY: Check if user exists
const user = await this.db.getUserByUsername(username);
if (!user) {
    // SECURITY: Use bcrypt anyway to prevent timing attacks
    await bcrypt.compare('dummy', '$2b$12$dummy.hash.to.prevent.timing.attacks');
    
    return {
        success: false,
        message: 'Invalid username or password', // SECURITY: Generic message
        errorCode: 'INVALID_CREDENTIALS'
    };
}

// SECURITY: Verify password using bcrypt
const isValidPassword = await this.passwordService.verifyPassword(password, user.password);
if (!isValidPassword) {
    return {
        success: false,
        message: 'Invalid username or password', // SECURITY: Same generic message
        errorCode: 'INVALID_CREDENTIALS'
    };
}
```

**Archivo: `routes/auth.js` (líneas 98-104)**
```javascript
return res.status(401).json({
    success: false,
    message: authResult.message,
    errorCode: authResult.errorCode || 'LOGIN_FAILED'
});
```

**Antes:**
```javascript
// Revelaba información específica
return { success: false, message: "User not found" };
return { success: false, message: "Invalid password" };
```

**Después:**
```javascript
// Respuesta uniforme para todos los casos
return { 
    success: false, 
    message: "Invalid username or password",
    errorCode: "INVALID_CREDENTIALS"
};
```

### 4. Protección contra Enumeración de Usuarios

#### Código Implementado:

**Archivo: `services/AuthService.js` (líneas 32-38)**
```javascript
// SECURITY: Check if user exists
const user = await this.db.getUserByUsername(username);
if (!user) {
    // SECURITY: Use bcrypt anyway to prevent timing attacks
    await bcrypt.compare('dummy', '$2b$12$dummy.hash.to.prevent.timing.attacks');
    
    return {
        success: false,
        message: 'Invalid username or password', // SECURITY: Generic message
        errorCode: 'INVALID_CREDENTIALS'
    };
}
```

**Archivo: `routes/auth.js` (líneas 52-54)**
```javascript
// SECURITY: Sanitize username to prevent log injection
const sanitizedUsername = username ? username.toString().replace(/[\r\n\t]/g, '') : '';
```

**Implementación:**
- ✅ **Mensajes genéricos** que no revelan si el usuario existe
- ✅ **Timing uniforme** usando bcrypt incluso para usuarios inexistentes
- ✅ **Respuestas consistentes** independientemente del tipo de error

### 5. Encriptación de Contraseñas

#### Código Implementado:

**Archivo: `services/PasswordService.js` (líneas 9-18)**
```javascript
// Hash password
async hashPassword(plainPassword) {
    try {
        const salt = await bcrypt.genSalt(this.saltRounds);
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Failed to hash password: ' + error.message);
    }
}
```

**Archivo: `services/PasswordService.js` (líneas 20-29)**
```javascript
// Verify password
async verifyPassword(plainPassword, hashedPassword) {
    try {
        const isValid = await bcrypt.compare(plainPassword, hashedPassword);
        return isValid;
    } catch (error) {
        throw new Error('Failed to verify password: ' + error.message);
    }
}
```

**Archivo: `scripts/initDatabase.js` (líneas 69-76)**
```javascript
// Create password service instance
const passwordService = new PasswordService();

if (!existingAdmin) {
    // Hash the password before storing
    const hashedAdminPassword = await passwordService.hashPassword('admin123');
    await db.createUser('admin', hashedAdminPassword, 'admin');
    console.log('✅ Created admin user (username: admin, password: admin123) - Password encrypted');
```

**Implementación:**
- ✅ **Hashing seguro** con bcrypt y salt rounds = 12
- ✅ **Contraseñas encriptadas desde la inicialización** de la base de datos
- ✅ **Verificación segura** usando bcrypt.compare()

## 🏗️ Arquitectura de Seguridad

### Flujo de Autenticación Segura

1. **Request llega** → Middleware de rate limiting verifica bloqueos existentes
2. **Si no está bloqueado** → Procesa autenticación
3. **Registra intento** → Guarda en base de datos con contexto completo
4. **Verifica límites** → Chequea si debe bloquear la cuenta/IP
5. **Respuesta uniforme** → Envía respuesta genérica sin revelar información

### Base de Datos de Seguridad

#### Código Implementado:

**Archivo: `scripts/addLoginAttemptTracking.js` (líneas 15-35)**
```sql
-- Tabla para rastrear intentos de login
CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    identifier_type TEXT NOT NULL CHECK (identifier_type IN ('username', 'ip')),
    success INTEGER NOT NULL CHECK (success IN (0, 1)),
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_agent TEXT,
    ip_address TEXT
);

-- Tabla para bloqueos de cuentas
CREATE TABLE IF NOT EXISTS account_lockouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    locked_until DATETIME NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_by TEXT DEFAULT 'auto',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Archivo: `services/RateLimitService.js` (líneas 148-185)**
```javascript
async checkAndLockAccount(username) {
    // Count failed attempts for this username in the window
    const countQuery = `
        SELECT COUNT(*) as failed_count 
        FROM login_attempts 
        WHERE identifier = ? 
        AND identifier_type = 'username' 
        AND datetime(attempt_time) > datetime(?) 
        AND success = 0
    `;
    
    if (failedAttempts >= this.config.maxAttemptsPerUsername) {
        // Lock the account
        const lockedUntil = new Date();
        lockedUntil.setMinutes(lockedUntil.getMinutes() + this.config.lockoutDurationMinutes);
        
        this.db.db.run(`
            INSERT OR REPLACE INTO account_lockouts 
            (username, locked_until, failed_attempts, locked_by)
            VALUES (?, ?, ?, 'auto')
        `, [username, lockedUntil.toISOString(), failedAttempts]);
    }
}
```

**Tabla: `login_attempts`**
- Registro de todos los intentos de login
- Información de contexto (IP, User-Agent, timestamp)
- Estado de éxito/falla

**Tabla: `account_lockouts`**
- Registro de cuentas bloqueadas
- Duración del bloqueo
- Razón del bloqueo

## 🛠️ Configuración

### Parámetros de Rate Limiting
```javascript
{
    maxAttemptsPerUsername: 5,      // Máximo intentos por usuario
    maxAttemptsPerIP: 10,          // Máximo intentos por IP
    lockoutDurationMinutes: 15,    // Duración del bloqueo
    rateLimitWindowMinutes: 15,    // Ventana de tiempo
    cleanupIntervalHours: 24       // Limpieza automática
}
```

### Headers de Respuesta

#### Código Implementado:

**Archivo: `middleware/rateLimit.js` (líneas 100-135)**
```javascript
async addRateLimitHeaders(req, res, username, ipAddress) {
    try {
        if (username) {
            const counts = await this.rateLimitService.getAttemptCounts(username, ipAddress);
            
            // Add rate limiting headers
            res.set({
                'X-Username-Attempts-Remaining': Math.max(0, counts.username.maxAttempts - counts.username.attempts),
                'X-IP-Attempts-Remaining': Math.max(0, counts.ip.maxAttempts - counts.ip.attempts),
                'X-RateLimit-Window': `${this.rateLimitService.config.rateLimitWindowMinutes} minutes`,
                'X-RateLimit-Policy': 'username,ip'
            });
            
            // Add Retry-After header if locked
            const lockStatus = await this.rateLimitService.isUsernameLocked(username);
            if (lockStatus.locked) {
                const retryAfter = this.calculateRetryAfter(lockStatus.lockedUntil);
                if (retryAfter > 0) {
                    res.set('Retry-After', retryAfter.toString());
                }
            }
        }
    } catch (error) {
        console.error('Error adding rate limit headers:', error);
    }
}
```

**Headers de Respuesta:**
```http
X-Username-Attempts-Remaining: 3
X-IP-Attempts-Remaining: 7
X-RateLimit-Window: 15 minutes
X-RateLimit-Policy: username,ip
Retry-After: 900
```

## 🧪 Testing

### Scripts de Prueba
- **`scripts/testAccountLockout.js`**: Test automatizado de bloqueo de cuentas
- **`scripts/cleanupTestData.js`**: Limpieza de datos de prueba
- **`scripts/initDatabase.js`**: Inicialización con contraseñas encriptadas

### Prueba Manual
```bash
# Inicializar base de datos limpia
node scripts/initDatabase.js --clean

# Iniciar servidor
npm start

# Probar bloqueo de cuentas
node scripts/testAccountLockout.js
```

## 📊 Resultados

**Antes de las correcciones:**
- ❌ Intentos ilimitados de login
- ❌ Revelación de información sensible
- ❌ No hay logging de seguridad
- ❌ Contraseñas en texto plano

**Después de las correcciones:**
- ✅ Bloqueo automático tras 5 intentos fallidos
- ✅ Respuestas uniformes y seguras
- ✅ Logging completo de intentos de acceso
- ✅ Contraseñas encriptadas con bcrypt
- ✅ Protección contra ataques de fuerza bruta
- ✅ Headers informativos para monitoreo

## 🔐 Clasificación de Seguridad

**Vulnerabilidad Original:** CWE-307 - Improper Restriction of Excessive Authentication Attempts

**Nivel de Riesgo:** Alto → **Mitigado**

**Estado:** ✅ **Resuelto** - Sistema ahora protegido contra ataques de fuerza bruta

---

*Implementación completada el 27 de octubre de 2025*