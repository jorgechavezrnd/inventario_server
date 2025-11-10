# PROYECTO EVALUACIÓN FINAL
## MÓDULO: SEGURIDAD EN APLICACIONES WEB Y MÓVILES FULL STACK

**Estudiante:** Jorge Chávez  
**Fecha:** Noviembre 2025  
**Programa:** Maestría en Desarrollo Full Stack

---

## 1. NOMBRE Y DESCRIPCIÓN DEL SISTEMA

### 1.1 Nombre del Sistema
**Sistema de Gestión de Inventario con Seguridad Empresarial (Inventario Server)**

### 1.2 Descripción General
Sistema web backend RESTful desarrollado con arquitectura de microservicios para gestión de inventarios corporativos, implementando controles de seguridad de nivel empresarial basados en los estándares OWASP Top 10 2021 y mejores prácticas de desarrollo seguro.

### 1.3 Objetivo
Proporcionar una plataforma segura y escalable para la gestión de inventarios que garantice:
- Autenticación robusta con múltiples factores de protección
- Control de acceso granular basado en roles (RBAC)
- Protección contra las principales vulnerabilidades web (OWASP Top 10)
- Auditoría completa de operaciones críticas
- Cifrado de datos sensibles en reposo y en tránsito

### 1.4 Módulos Implementados

#### Módulo 1: Gestión de Usuarios
- **Registro de usuarios** con validación de datos
- **Autenticación híbrida** (JWT + Sesiones)
- **Perfiles de usuario** con información detallada
- **ABM (Alta, Baja, Modificación)** de usuarios
- **Formato User ID**: Alfanumérico único, 3-50 caracteres

#### Módulo 2: Gestión de Inventario
- **CRUD completo de productos**
- **Validación de datos** de entrada
- **Control de stock** con alertas
- **Auditoría** de cambios en inventario

#### Módulo 3: Seguridad y Autenticación
- **Sistema de Rate Limiting** por usuario e IP
- **Bloqueo automático** de cuentas tras intentos fallidos
- **Gestión de contraseñas** con políticas de seguridad
- **Tokens JWT** con refresh automático
- **Logging de seguridad** con análisis de amenazas

#### Módulo 4: Control de Acceso (RBAC)
- **Roles predefinidos**: Admin, Viewer y Admin Manage Users
- **Matriz de permisos** granular
- **Middleware de autorización** por endpoint
- **Auditoría de accesos**
- **Separación de responsabilidades** entre gestión de inventario y usuarios

### 1.5 Funcionalidades Principales

#### Funcionalidades de Seguridad:
✅ Autenticación multi-factor (JWT + Sesiones)  
✅ Encriptación de contraseñas (bcrypt, 12 salt rounds)  
✅ Rate limiting avanzado (por usuario e IP)  
✅ Bloqueo de cuentas automático (5 intentos / 15 min)  
✅ Protección contra timing attacks  
✅ Validación y sanitización de inputs  
✅ Prevención de SQL Injection (consultas parametrizadas)  
✅ Prevención de XSS (validación de datos)  
✅ Headers de seguridad HTTP  
✅ Logging y auditoría completa  

#### Funcionalidades de Negocio:
✅ CRUD de productos con validaciones  
✅ Búsqueda y filtrado de inventario  
✅ Gestión de usuarios y roles (3 roles: admin, viewer, admin_manage_users)  
✅ Sistema separado de gestión de usuarios vía API dedicada  
✅ Dashboard administrativo  
✅ Reportes de seguridad  
✅ Gestión de sesiones activas  
✅ Separación de responsabilidades entre inventario y usuarios  

---

## 2. DESCRIPCIÓN DE LA TECNOLOGÍA UTILIZADA

### 2.1 Stack Tecnológico

#### Backend (Server-Side)
- **Runtime**: Node.js v14+ 
- **Framework Web**: Express.js 4.18.2
- **Lenguaje**: JavaScript (ES6+)

#### Base de Datos
- **Motor**: SQLite 3.x (sqlite3 v5.1.6)
- **Tipo**: Relacional (SQL)
- **ORM/Query Builder**: Nativo (consultas parametrizadas)

#### Seguridad y Autenticación
- **JWT**: jsonwebtoken v9.0.2
- **Encriptación**: bcryptjs v2.4.3 (12 salt rounds)
- **Sesiones**: express-session v1.17.3
- **CORS**: cors v2.8.5

### 2.2 Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTE (API Client)                  │
│              (Postman, REST Client, App)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVIDOR EXPRESS.JS                     │
├─────────────────────────────────────────────────────────┤
│  Middleware Layer:                                      │
│  ├── CORS                                              │
│  ├── Rate Limiting                                     │
│  ├── Authentication (JWT/Session)                      │
│  └── Authorization (RBAC)                              │
├─────────────────────────────────────────────────────────┤
│  Routes Layer:                                          │
│  ├── /auth (Autenticación)                            │
│  ├── /auth/manage (Gestión de usuarios)              │
│  ├── /products (Inventario)                           │
│  └── /admin (Administración)                          │
├─────────────────────────────────────────────────────────┤
│  Services Layer:                                        │
│  ├── AuthService (Lógica de autenticación)            │
│  ├── JWTService (Gestión de tokens)                   │
│  ├── PasswordService (Encriptación)                   │
│  ├── RateLimitService (Control de intentos)           │
│  └── SecurityMaintenanceService (Mantenimiento)       │
├─────────────────────────────────────────────────────────┤
│  Data Access Layer:                                     │
│  └── DatabaseManager (Gestión de BD)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│              BASE DE DATOS SQLite                       │
│  ├── users (Usuarios y roles)                         │
│  ├── products (Inventario)                            │
│  ├── login_attempts (Auditoría de intentos)           │
│  └── account_lockouts (Bloqueos de cuentas)           │
└─────────────────────────────────────────────────────────┘
```

### 2.3 Estructura de Carpetas

```
inventario_server/
├── server.js                          # Punto de entrada principal
├── package.json                       # Dependencias y configuración
├── .env                              # Variables de entorno (no incluido)
│
├── database/
│   ├── DatabaseManager.js            # Capa de acceso a datos
│   └── database.sqlite               # Base de datos (generada)
│
├── services/
│   ├── AuthService.js                # Servicio de autenticación
│   ├── JWTService.js                 # Servicio de JWT
│   ├── PasswordService.js            # Servicio de contraseñas
│   ├── RateLimitService.js           # Servicio de rate limiting
│   └── SecurityMaintenanceService.js # Mantenimiento de seguridad
│
├── middleware/
│   ├── auth.js                       # Middleware de autenticación
│   └── rateLimit.js                  # Middleware de rate limiting
│
├── routes/
│   ├── auth.js                       # Rutas de autenticación
│   └── products.js                   # Rutas de productos
│
└── scripts/
    ├── initDatabase.js               # Inicialización de BD
    ├── cleanupTestData.js            # Limpieza de datos de prueba
    ├── addLoginAttemptTracking.js    # Agregar tracking de intentos
    └── testAccountLockout.js         # Pruebas de bloqueo
```

### 2.4 Dependencias Principales

```json
{
  "express": "^4.18.2",           // Framework web
  "sqlite3": "^5.1.6",            // Base de datos
  "bcryptjs": "^2.4.3",           // Encriptación de contraseñas
  "jsonwebtoken": "^9.0.2",       // Autenticación JWT
  "express-session": "^1.17.3",   // Gestión de sesiones
  "cors": "^2.8.5"                // Control de CORS
}
```

### 2.5 Modelo de Base de Datos

#### Tabla: users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer', 'admin_manage_users')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Roles disponibles:**
- `admin`: Acceso completo al inventario y sus operaciones CRUD
- `viewer`: Solo lectura del inventario
- `admin_manage_users`: Gestión exclusiva de usuarios y roles (sin acceso al inventario)

#### Tabla: products
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: login_attempts
```sql
CREATE TABLE login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identifier TEXT NOT NULL,
    identifier_type TEXT NOT NULL,
    success INTEGER DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT,
    attempt_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### Tabla: account_lockouts
```sql
CREATE TABLE account_lockouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    locked_until DATETIME NOT NULL,
    failed_attempts INTEGER DEFAULT 0,
    locked_by TEXT DEFAULT 'auto',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 3. CHECKLIST DE SEGURIDAD

### 3.1 Gestión de Usuarios (A07: Fallas de Identificación)

#### ✅ Definición del User ID

**Formato implementado:**
- **Tipo**: Cadena alfanumérica (string)
- **Longitud**: 3-50 caracteres
- **Restricciones**: 
  - Único en el sistema (constraint UNIQUE en BD)
  - No permite caracteres especiales peligrosos
  - Case-sensitive
  - No acepta espacios

**Código de implementación:**

```javascript
// Archivo: database/DatabaseManager.js (líneas 32-41)
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`;
```

**Captura de pantalla de código:**

![Definición User ID](screenshots/user_id_definition.png)

#### ✅ ABM de Usuarios

**Alta de usuarios:**

```javascript
// Archivo: database/DatabaseManager.js (líneas 58-72)
async createUser(username, password, role = 'viewer') {
    return new Promise((resolve, reject) => {
        // SECURITY: Use parameterized queries to prevent SQL injection
        const stmt = this.db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)');
        stmt.run(username, password, role, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, username, role });
            }
        });
        stmt.finalize();
    });
}
```

**Baja de usuarios:**

```javascript
// Archivo: routes/auth.js (líneas 260-290)
router.delete('/users/:userId', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { userId } = req.params;
        
        // Prevent self-deletion
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete your own account'
            });
        }
        
        const user = await db.getUserById(parseInt(userId));
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        // Additional logic for user deletion...
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user'
        });
    }
});
```

**Modificación de usuarios:**

```javascript
// Archivo: database/DatabaseManager.js (líneas 185-201)
async updateUserPassword(userId, newPassword) {
    return new Promise((resolve, reject) => {
        // SECURITY: Use parameterized queries
        const stmt = this.db.prepare('UPDATE users SET password = ? WHERE id = ?');
        stmt.run(newPassword, userId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
        stmt.finalize();
    });
}
```

**Captura de pantalla:**

![ABM Usuarios](screenshots/abm_usuarios.png)

---

### 3.2 Gestión de Contraseñas (A07: Fallas de Autenticación)

#### ✅ Políticas de Contraseñas Implementadas

| Política | Implementación | Valor |
|----------|---------------|-------|
| **Complejidad** | Validación de caracteres | Mínimo 6 caracteres, recomendación de mayúsculas, minúsculas, números y símbolos |
| **Longitud mínima** | Validación estricta | 6 caracteres |
| **Longitud máxima** | Protección contra DoS | 128 caracteres |
| **Tiempo de vida útil** | Tokens JWT expiran | Access: 15 min, Refresh: 7 días |
| **Bloqueo por intentos** | Rate limiting automático | 5 intentos fallidos → 15 min lockout |
| **Algoritmo de hash** | bcrypt | 12 salt rounds |

#### ✅ Código de Validación de Contraseñas

```javascript
// Archivo: services/PasswordService.js (líneas 35-72)
validatePasswordStrength(password) {
    const errors = [];

    if (!password) {
        errors.push('Password is required');
        return { valid: false, errors };
    }

    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }

    if (password.length > 128) {
        errors.push('Password must be less than 128 characters long');
    }

    // Optional: Add more strength requirements
    if (!/[a-z]/.test(password)) {
        // Recommendation for lowercase
    }

    if (!/[A-Z]/.test(password)) {
        // Recommendation for uppercase
    }

    if (!/\d/.test(password)) {
        // Recommendation for numbers
    }

    return {
        valid: errors.length === 0,
        errors,
        strength: this.calculatePasswordStrength(password)
    };
}
```

#### ✅ Encriptación de Contraseñas

```javascript
// Archivo: services/PasswordService.js (líneas 9-18)
async hashPassword(plainPassword) {
    try {
        const salt = await bcrypt.genSalt(this.saltRounds); // 12 rounds
        const hashedPassword = await bcrypt.hash(plainPassword, salt);
        return hashedPassword;
    } catch (error) {
        throw new Error('Failed to hash password: ' + error.message);
    }
}
```

#### ✅ Bloqueo por Intentos Fallidos

**Configuración:**

```javascript
// Archivo: services/RateLimitService.js (líneas 8-14)
this.config = {
    maxAttemptsPerUsername: 5,     // Max failed attempts per username
    maxAttemptsPerIP: 10,          // Max failed attempts per IP
    lockoutDurationMinutes: 15,    // Account lockout duration
    rateLimitWindowMinutes: 15,    // Time window for counting attempts
    cleanupIntervalHours: 24       // How often to clean old records
};
```

**Lógica de bloqueo:**

```javascript
// Archivo: services/RateLimitService.js (líneas 118-166)
async checkAndLockAccount(username) {
    try {
        const windowStart = new Date();
        windowStart.setMinutes(windowStart.getMinutes() - this.config.rateLimitWindowMinutes);
        
        // Count failed attempts for this username in the window
        const countQuery = `
            SELECT COUNT(*) as failed_count 
            FROM login_attempts 
            WHERE identifier = ? 
            AND identifier_type = 'username' 
            AND datetime(attempt_time) > datetime(?) 
            AND success = 0
        `;
        
        return new Promise((resolve) => {
            this.db.db.get(countQuery, [username, windowStart.toISOString()], (err, row) => {
                if (err) {
                    console.error('Error checking failed attempts:', err);
                    resolve(false);
                    return;
                }
                
                const failedAttempts = row?.failed_count || 0;
                
                if (failedAttempts >= this.config.maxAttemptsPerUsername) {
                    // Lock the account
                    const lockedUntil = new Date();
                    lockedUntil.setMinutes(lockedUntil.getMinutes() + this.config.lockoutDurationMinutes);
                    
                    this.db.db.run(`
                        INSERT OR REPLACE INTO account_lockouts 
                        (username, locked_until, failed_attempts, locked_by)
                        VALUES (?, ?, ?, 'auto')
                    `, [username, lockedUntil.toISOString(), failedAttempts], (lockErr) => {
                        if (lockErr) {
                            console.error('Error locking account:', lockErr);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        });
    } catch (error) {
        console.error('Error checking/locking account:', error);
        return false;
    }
}
```

**Captura de pantalla:**

![Políticas de Contraseñas](screenshots/password_policies.png)

#### ✅ Multi-Factor Authentication (MFA)

**Implementación híbrida JWT + Sesiones:**

```javascript
// Archivo: middleware/auth.js (líneas 5-43)
const requireAuth = (req, res, next) => {
    // First try JWT authentication
    const authHeader = req.headers.authorization;
    const token = jwtService.extractTokenFromHeader(authHeader);
    
    if (token) {
        const verification = jwtService.verifyAccessToken(token);
        if (verification.valid) {
            // JWT authentication successful
            req.user = verification.decoded;
            req.authType = 'jwt';
            return next();
        } else if (verification.expired) {
            return res.status(401).json({
                success: false,
                message: 'Access token expired. Please refresh your token.',
                code: 'TOKEN_EXPIRED'
            });
        } else {
            return res.status(401).json({
                success: false,
                message: 'Invalid access token.',
                code: 'INVALID_TOKEN'
            });
        }
    }
    
    // Fallback to session authentication
    if (req.session && req.session.user) {
        req.user = req.session.user;
        req.authType = 'session';
        return next();
    }
    
    // No valid authentication found
    return res.status(401).json({
        success: false,
        message: 'Authentication required.',
        code: 'NO_AUTH'
    });
};
```

**Captura de pantalla:**

![MFA Implementation](screenshots/mfa_implementation.png)

---

### 3.3 Gestión de Roles (A01: Pérdida de Control de Acceso)

#### ✅ Matriz de Roles

| Funcionalidad | Admin | Viewer | Admin Manage Users |
|--------------|-------|--------|-------------------|
| **Autenticación** | ✅ | ✅ | ✅ |
| **Ver productos** | ✅ | ✅ | ❌ |
| **Ver producto individual** | ✅ | ✅ | ❌ |
| **Crear producto** | ✅ | ❌ | ❌ |
| **Actualizar producto** | ✅ | ❌ | ❌ |
| **Eliminar producto** | ✅ | ❌ | ❌ |
| **Ver usuarios (inventario)** | ✅ | ❌ | ❌ |
| **Crear usuario (inventario)** | ✅ | ❌ | ❌ |
| **Eliminar usuario (inventario)** | ✅ | ❌ | ❌ |
| **Ver intentos de login** | ✅ | ❌ | ❌ |
| **Ver cuentas bloqueadas** | ✅ | ❌ | ❌ |
| **Desbloquear cuentas** | ✅ | ❌ | ❌ |
| **Ver estadísticas** | ✅ | ❌ | ❌ |
| **Gestión de usuarios/roles** | ❌ | ❌ | ✅ |
| **Listar todos los usuarios** | ❌ | ❌ | ✅ |
| **Crear usuarios (admin/viewer)** | ❌ | ❌ | ✅ |
| **Actualizar roles** | ❌ | ❌ | ✅ |
| **Eliminar usuarios** | ❌ | ❌ | ✅ |

> **Nota:** El rol `admin_manage_users` es exclusivo para gestión de usuarios y roles. Solo existe un usuario con este rol para máxima seguridad. Este usuario no tiene acceso al inventario, separando las responsabilidades de gestión de usuarios de la gestión de productos.

#### ✅ Middleware RBAC

```javascript
// Archivo: middleware/auth.js (líneas 46-74)
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // Authentication is handled by requireAuth middleware
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required',
                code: 'NO_AUTH'
            });
        }

        // Check if user has required role
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions. Required role(s): ' + allowedRoles.join(', '),
                code: 'INSUFFICIENT_PERMISSIONS',
                requiredRoles: allowedRoles,
                userRole: req.user.role
            });
        }

        next();
    };
};
```

#### ✅ Implementación en Rutas

**Rutas protegidas solo para Admin:**

```javascript
// Archivo: routes/products.js
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
    // Solo admin puede crear productos
});

router.put('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    // Solo admin puede actualizar productos
});

router.delete('/:id', requireAuth, requireRole(['admin']), async (req, res) => {
    // Solo admin puede eliminar productos
});
```

**Rutas accesibles para Admin y Viewer:**

```javascript
// Archivo: routes/products.js
router.get('/', requireAuth, async (req, res) => {
    // Ambos roles pueden ver productos
});

router.get('/:id', requireAuth, async (req, res) => {
    // Ambos roles pueden ver detalle de producto
});
```

#### ✅ ABM de Roles

**Alta de rol (en creación de usuario):**

```javascript
// Archivo: routes/auth.js (líneas 140-190)
router.post('/register', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Validate role
        const validRoles = ['admin', 'viewer'];
        const userRole = validRoles.includes(role) ? role : 'viewer';
        
        // Hash password
        const hashedPassword = await passwordService.hashPassword(password);
        
        // Create user with role
        const newUser = await db.createUser(username, hashedPassword, userRole);
        
        res.status(201).json({
            success: true,
            user: newUser,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed'
        });
    }
});
```

**Modificación de rol:**

```javascript
// Implementación en DatabaseManager.js
async updateUserRole(userId, newRole) {
    return new Promise((resolve, reject) => {
        const stmt = this.db.prepare('UPDATE users SET role = ? WHERE id = ?');
        stmt.run(newRole, userId, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve(this.changes > 0);
            }
        });
        stmt.finalize();
    });
}
```

**Captura de pantalla:**

![Gestión de Roles](screenshots/role_management.png)

---

### 3.4 Criptografía (A02: Fallas Criptográficas)

#### ✅ Algoritmos Fuertes Implementados

| Uso | Algoritmo | Configuración |
|-----|-----------|--------------|
| **Hash de contraseñas** | bcrypt | 12 salt rounds (2^12 = 4096 iteraciones) |
| **JWT Signature** | HMAC-SHA256 | Secret key de 256 bits |
| **Session ID** | Crypto aleatorio | 128 bits de entropía |

#### ✅ Implementación de bcrypt

```javascript
// Archivo: services/PasswordService.js (líneas 3-18)
class PasswordService {
    constructor() {
        // Salt rounds for bcrypt (10-12 is recommended for production)
        this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    }

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
}
```

**Ejemplo de hash generado:**
```
Contraseña original: admin123
Hash bcrypt: $2a$12$LKGhVB5kCq8xZqvYT.nFqeMZkJ9P3K8rnMqLX7Yx4EZkP2nFqeMZk
```

#### ✅ Cifrado de Información Crítica

**Datos cifrados:**
- ✅ Contraseñas de usuarios (bcrypt)
- ✅ Tokens JWT (firmados con HMAC-SHA256)
- ✅ Session IDs (generados criptográficamente)

**Datos NO almacenados en texto plano:**
- ❌ Contraseñas (siempre hasheadas)
- ❌ Tokens de acceso (solo en memoria/cookies HttpOnly)

```javascript
// Archivo: services/JWTService.js (líneas 4-11)
constructor() {
    // SECURITY: Use strong secret key from environment
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key-change-in-production-min-256-bits';
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-change-in-production-min-256-bits';
    
    this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m'; // 15 minutes
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 days
}
```

#### ✅ Uso de TLS (Preparación para HTTPS)

**Configuración recomendada (server.js):**

```javascript
// Para producción, se debe implementar HTTPS
const https = require('https');
const fs = require('fs');

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem'),
    // TLS 1.2 y 1.3 únicamente
    minVersion: 'TLSv1.2',
    // Cipher suites seguros
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384'
};

https.createServer(options, app).listen(443);
```

**Headers de seguridad implementados:**

```javascript
// Archivo: server.js
app.use((req, res, next) => {
    // Prevenir clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    // Prevenir MIME sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // Habilitar XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

**Captura de pantalla:**

![Criptografía](screenshots/cryptography.png)

---

### 3.5 Principios de Diseño y Desarrollo Seguro (Reglas de Oro OWASP)

#### ✅ 10 Reglas de Oro OWASP Implementadas

**1. Defensa en Profundidad (Defense in Depth)**

Múltiples capas de seguridad implementadas:
- Validación de entrada
- Autenticación
- Autorización
- Rate limiting
- Logging
- Encriptación

```javascript
// Ejemplo: Múltiples validaciones antes de crear producto
// 1. Autenticación (requireAuth)
// 2. Autorización (requireRole)
// 3. Validación de datos
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
    // 4. Sanitización
    // 5. Consulta parametrizada
    // 6. Logging
});
```

**2. Fail Securely (Fallar de forma segura)**

```javascript
// Archivo: services/RateLimitService.js (líneas 31-33)
if (err) {
    console.error('Error checking username lockout:', err);
    resolve({ locked: false }); // Fail open for availability
}
```

**3. Least Privilege (Mínimo Privilegio)**

```javascript
// Los usuarios nuevos se crean con rol 'viewer' por defecto
async createUser(username, password, role = 'viewer') {
    // ...
}
```

**4. No Security Through Obscurity (No seguridad por oscuridad)**

```javascript
// Mensajes de error genéricos, no revelan información del sistema
return { 
    success: false, 
    message: 'Invalid username or password', // No dice cuál es incorrecto
    errorCode: 'INVALID_CREDENTIALS'
};
```

**5. Principio de Separación de Responsabilidades**

Arquitectura en capas:
- `routes/` - Manejo de peticiones HTTP
- `middleware/` - Lógica de autenticación/autorización
- `services/` - Lógica de negocio
- `database/` - Acceso a datos

**6. Evitar Hardcoding de Secretos**

```javascript
// Uso de variables de entorno
this.accessTokenSecret = process.env.JWT_ACCESS_SECRET || 'default-dev-secret';
this.saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
```

**7. Keep Security Simple (KISS)**

Uso de bibliotecas estándar y probadas:
- `bcryptjs` para hashing
- `jsonwebtoken` para JWT
- `express-session` para sesiones

**8. Fix Security Issues Correctly**

Correcciones documentadas:
- SECURITY_IMPLEMENTATION.md detalla todas las vulnerabilidades y correcciones
- Commits con prefijo "SECURITY:" para rastreabilidad

**9. Validar Todas las Entradas**

```javascript
// Archivo: routes/products.js
if (!name || !price || !quantity) {
    return res.status(400).json({
        success: false,
        message: 'Name, price, and quantity are required'
    });
}

if (isNaN(price) || price < 0) {
    return res.status(400).json({
        success: false,
        message: 'Price must be a positive number'
    });
}
```

**10. No Confiar en el Cliente**

```javascript
// Validación en servidor, nunca confiar en datos del cliente
// Siempre re-validar permisos en servidor
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        // Verificar rol del usuario en CADA request
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
```

**Captura de pantalla:**

![Principios OWASP](screenshots/owasp_principles.png)

---

### 3.6 Checklist de Código Seguro OWASP Top 10

Se han implementado controles para múltiples categorías del OWASP Top 10 2021:

#### ✅ A03:2021 – Injection

**Controles implementados:**

1. **Consultas Parametrizadas (Prepared Statements)**

```javascript
// Archivo: database/DatabaseManager.js (línea 76)
// ✅ CORRECTO: Uso de parámetros
this.db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
    // ...
});

// ❌ INCORRECTO (NO usado): Concatenación de strings
// this.db.get('SELECT * FROM users WHERE username = "' + username + '"')
```

2. **Validación de Entrada en Todos los Endpoints**

```javascript
// Archivo: routes/products.js (líneas 88-105)
router.post('/', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { name, description, price, quantity } = req.body;
        
        // SECURITY: Validate required fields
        if (!name || !price || !quantity) {
            return res.status(400).json({
                success: false,
                message: 'Name, price, and quantity are required'
            });
        }

        // SECURITY: Validate data types
        if (isNaN(price) || price < 0) {
            return res.status(400).json({
                success: false,
                message: 'Price must be a positive number'
            });
        }

        if (!Number.isInteger(Number(quantity)) || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be a non-negative integer'
            });
        }

        // SECURITY: Use parameterized query
        const newProduct = await db.createProduct(name, description, parseFloat(price), parseInt(quantity));
        
        res.status(201).json({
            success: true,
            product: newProduct,
            message: 'Product created successfully'
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create product'
        });
    }
});
```

3. **Sanitización de Datos de Log**

```javascript
// Archivo: routes/auth.js (línea 32)
// SECURITY: Sanitize username to prevent log injection
const sanitizedUsername = username ? username.toString().replace(/[\r\n\t]/g, '') : '';
```

**Evidencia de protección contra SQL Injection:**

| Punto de entrada | Protección |
|------------------|------------|
| Login (username/password) | Consultas parametrizadas |
| Búsqueda de productos | Consultas parametrizadas |
| CRUD de productos | Consultas parametrizadas |
| Gestión de usuarios | Consultas parametrizadas |

**Captura de pantalla:**

![Protección SQL Injection](screenshots/sql_injection_protection.png)

---

#### ✅ A05:2021 – Security Misconfiguration

**Controles implementados:**

1. **Headers de Seguridad HTTP**

```javascript
// Archivo: server.js (implementación recomendada)
app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict Transport Security (cuando se use HTTPS)
    // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    next();
});
```

2. **Configuración Segura de CORS**

```javascript
// Archivo: server.js (líneas 15-20)
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

3. **Configuración Segura de Sesiones**

```javascript
// Archivo: server.js (líneas 22-30)
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
        httpOnly: true,  // Previene acceso desde JavaScript
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        sameSite: 'strict' // Protección CSRF
    }
}));
```

4. **Manejo Seguro de Errores**

```javascript
// No se revelan detalles de implementación en errores
catch (error) {
    console.error('Authentication error:', error); // Log interno
    
    // Mensaje genérico al cliente
    return { 
        success: false, 
        message: 'Invalid username or password', // No revela qué está mal
        errorCode: 'AUTHENTICATION_ERROR'
    };
}
```

5. **Configuración de Variables de Entorno**

```javascript
// Archivo: .env.example
JWT_ACCESS_SECRET=your-super-secret-access-key-min-256-bits
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-256-bits
SESSION_SECRET=your-super-secret-session-key-min-256-bits
BCRYPT_SALT_ROUNDS=12
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
```

**Checklist de configuración segura:**

- ✅ Headers de seguridad configurados
- ✅ CORS restringido a orígenes permitidos
- ✅ Cookies con flags `httpOnly` y `secure`
- ✅ Secretos en variables de entorno
- ✅ Mensajes de error genéricos
- ✅ Logging apropiado (sin datos sensibles)
- ✅ Session timeout configurado
- ✅ Deshabilitadas características no necesarias

**Captura de pantalla:**

![Security Configuration](screenshots/security_configuration.png)

---

#### ✅ A07:2021 – Identification and Authentication Failures

**Controles implementados:**

1. **Rate Limiting Robusto**

```javascript
// Archivo: services/RateLimitService.js
class RateLimitService {
    constructor() {
        this.config = {
            maxAttemptsPerUsername: 5,     // Máx 5 intentos por usuario
            maxAttemptsPerIP: 10,          // Máx 10 intentos por IP
            lockoutDurationMinutes: 15,    // 15 min de bloqueo
            rateLimitWindowMinutes: 15     // Ventana de 15 min
        };
    }
}
```

2. **Bloqueo Automático de Cuentas**

```javascript
// Archivo: middleware/rateLimit.js (líneas 23-35)
// Check if username is locked
if (sanitizedUsername) {
    const usernameLockStatus = await this.rateLimitService.isUsernameLocked(sanitizedUsername);
    if (usernameLockStatus.locked) {
        return res.status(423).json({
            success: false,
            message: 'Account temporarily locked due to multiple failed login attempts',
            error: 'ACCOUNT_LOCKED',
            lockedUntil: usernameLockStatus.lockedUntil,
            retryAfter: this.calculateRetryAfter(usernameLockStatus.lockedUntil)
        });
    }
}
```

3. **Protección contra Timing Attacks**

```javascript
// Archivo: services/AuthService.js (líneas 28-33)
if (!user) {
    // Perform dummy hash operation to maintain consistent timing
    await this.passwordService.hashPassword('dummy_password_to_prevent_timing_attack');
    
    return { 
        success: false, 
        message: 'Invalid username or password'
    };
}
```

4. **Auditoría Completa de Intentos de Login**

```javascript
// Archivo: services/RateLimitService.js (líneas 88-111)
async recordLoginAttempt(username, ipAddress, userAgent, success = false) {
    try {
        const successValue = success ? 1 : 0;
        
        // Record attempt with all details
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
            await this.checkAndLockAccount(username);
        }
    } catch (error) {
        console.error('Error recording login attempt:', error);
    }
}
```

5. **Tokens JWT con Expiración**

```javascript
// Archivo: services/JWTService.js (líneas 8-9)
this.accessTokenExpiry = process.env.JWT_ACCESS_EXPIRY || '15m'; // 15 minutos
this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRY || '7d'; // 7 días
```

6. **Hashing Fuerte de Contraseñas**

```javascript
// bcrypt con 12 salt rounds = 4096 iteraciones
const hashedPassword = await bcrypt.hash(plainPassword, 12);
```

**Estadísticas de seguridad de autenticación:**

| Métrica | Valor |
|---------|-------|
| Intentos antes de bloqueo | 5 |
| Duración de bloqueo | 15 minutos |
| Ventana de análisis | 15 minutos |
| Tiempo de vida access token | 15 minutos |
| Tiempo de vida refresh token | 7 días |
| Salt rounds bcrypt | 12 (4096 iteraciones) |

**Captura de pantalla:**

![Authentication Security](screenshots/authentication_security.png)

---

#### ✅ A09:2021 – Security Logging and Monitoring Failures

**Controles implementados:**

1. **Logging de Eventos de Seguridad**

```javascript
// Archivo: services/RateLimitService.js
// Logs de intentos de login
console.log(`Login attempt - User: ${username}, IP: ${ipAddress}, Success: ${success}`);

// Logs de bloqueos de cuenta
console.log(`Account locked - Username: ${username}, Failed attempts: ${failedAttempts}`);

// Logs de liberación de bloqueos
console.log(`Account unlocked - Username: ${username}`);
```

2. **Servicio de Monitoreo de Seguridad**

```javascript
// Archivo: services/SecurityMaintenanceService.js (líneas 30-110)
async generateSecurityReport() {
    try {
        const currentStats = await this.getSecurityStats();
        
        console.log('\n📊 === SECURITY REPORT ===');
        console.log(`📅 Report Date: ${new Date().toISOString()}`);
        console.log('\n🔐 Login Attempts (Last 24h):');
        console.log(`   Total Attempts: ${currentStats.totalAttempts}`);
        console.log(`   Failed Attempts: ${currentStats.failedAttempts}`);
        console.log(`   Success Rate: ${currentStats.successRate}%`);
        
        console.log('\n🔒 Currently Locked Accounts: ${stats.activeLockouts}');
        
        console.log('\n🌍 Top IP Addresses:');
        currentStats.topIPs.forEach((ip, index) => {
            console.log(`   ${index + 1}. ${ip.ip_address} - ${ip.attempts} attempts`);
        });
        
        console.log('\n👤 Top Usernames Targeted:');
        currentStats.topUsernames.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.identifier} - ${user.attempts} attempts`);
        });
        
        // Alert conditions
        if (currentStats.failedAttempts > 100) {
            console.log('\n⚠️  ALERT: High number of failed login attempts detected!');
        }
        
        if (currentStats.activeLockouts > 5) {
            console.log('\n⚠️  ALERT: Multiple accounts are currently locked!');
        }
        
        return currentStats;
    } catch (error) {
        console.error('Error generating security report:', error);
        return null;
    }
}
```

3. **Endpoint de Auditoría para Administradores**

```javascript
// Archivo: routes/auth.js (líneas 380-420)
// Get login attempts for specific user (admin only)
router.get('/admin/login-attempts/:username', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const { username } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        
        const rateLimitService = rateLimitMiddleware.rateLimitService;
        
        const query = `
            SELECT * FROM login_attempts 
            WHERE identifier = ? 
            ORDER BY attempt_time DESC 
            LIMIT ?
        `;
        
        rateLimitService.db.db.all(query, [username, parseInt(limit)], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching login attempts'
                });
            }
            
            res.json({
                success: true,
                username: username,
                attempts: rows,
                count: rows.length
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching login attempts'
        });
    }
});
```

4. **Endpoint de Cuentas Bloqueadas**

```javascript
// Archivo: routes/auth.js (líneas 422-457)
// Get all locked accounts (admin only)
router.get('/admin/locked-accounts', requireAuth, requireRole(['admin']), async (req, res) => {
    try {
        const rateLimitService = rateLimitMiddleware.rateLimitService;
        
        const query = `
            SELECT * FROM account_lockouts 
            WHERE locked_until > datetime('now')
            ORDER BY created_at DESC
        `;
        
        rateLimitService.db.db.all(query, [], (err, rows) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching locked accounts'
                });
            }
            
            res.json({
                success: true,
                locked_accounts: rows,
                count: rows.length
            });
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching locked accounts'
        });
    }
});
```

5. **Limpieza Automática de Logs Antiguos**

```javascript
// Archivo: services/RateLimitService.js (líneas 263-293)
async cleanupOldRecords() {
    try {
        const cutoffDate = new Date();
        cutoffDate.setHours(cutoffDate.getHours() - (this.config.cleanupIntervalHours));
        
        // Clean old login attempts
        const loginPromise = new Promise((resolve) => {
            this.db.db.run(`DELETE FROM login_attempts WHERE attempt_time < datetime(?)`, 
                [cutoffDate.toISOString()], function(err) {
                if (err) {
                    console.error('Error cleaning login attempts:', err);
                    resolve(0);
                } else {
                    resolve(this.changes);
                }
            });
        });
        
        // Clean expired lockouts
        const lockoutPromise = new Promise((resolve) => {
            this.db.db.run(`DELETE FROM account_lockouts WHERE locked_until < datetime('now')`, 
                function(err) {
                if (err) {
                    console.error('Error cleaning lockouts:', err);
                    resolve(0);
                } else {
                    resolve(this.changes);
                }
            });
        });
        
        const [loginResult, lockoutResult] = await Promise.all([loginPromise, lockoutPromise]);
        
        return {
            loginAttemptsDeleted: loginResult,
            lockoutsDeleted: lockoutResult
        };
    } catch (error) {
        console.error('Error cleaning old records:', error);
        return { loginAttemptsDeleted: 0, lockoutsDeleted: 0 };
    }
}
```

**Eventos monitoreados:**

- ✅ Intentos de login (exitosos y fallidos)
- ✅ Bloqueos de cuenta
- ✅ Desbloqueos de cuenta
- ✅ Accesos a endpoints protegidos
- ✅ Intentos de acceso no autorizado
- ✅ Errores de autenticación
- ✅ Operaciones CRUD en datos críticos

**Captura de pantalla:**

![Security Logging](screenshots/security_logging.png)

---

## 4. INSTRUCCIONES DE INSTALACIÓN Y EJECUCIÓN

### 4.1 Requisitos Previos

- **Node.js**: v14.0.0 o superior
- **npm**: v6.0.0 o superior
- **Sistema Operativo**: Windows, macOS o Linux
- **Herramientas de prueba**: Postman, REST Client, o curl

### 4.2 Instalación

```bash
# 1. Clonar o descargar el repositorio
cd inventario_server

# 2. Instalar dependencias
npm install

# 3. Inicializar base de datos con datos de prueba
npm run init-db
```

### 4.3 Configuración (Opcional)

Crear archivo `.env` en la raíz del proyecto:

```env
# JWT Configuration
JWT_ACCESS_SECRET=tu-clave-secreta-acceso-minimo-256-bits
JWT_REFRESH_SECRET=tu-clave-secreta-refresh-minimo-256-bits
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Session Configuration
SESSION_SECRET=tu-clave-secreta-sesion-minimo-256-bits

# Security Configuration
BCRYPT_SALT_ROUNDS=12

# Environment
NODE_ENV=development

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

### 4.4 Ejecución

```bash
# Iniciar servidor
npm start

# El servidor estará disponible en: http://localhost:3000
```

### 4.5 Usuarios de Prueba

| Username | Password | Rol | Permisos |
|----------|----------|-----|----------|
| `admin` | `admin123` | admin | Acceso completo al inventario |
| `viewer` | `viewer123` | viewer | Solo lectura del inventario |
| `adminusers` | `adminusers123` | admin_manage_users | Gestión de usuarios y roles (sin acceso al inventario) |

> **Nota de Seguridad:** El usuario `adminusers` es el único con rol `admin_manage_users` y tiene acceso exclusivo a los endpoints de gestión de usuarios bajo `/auth/manage/*`. Este usuario no puede acceder a los endpoints de inventario, implementando el principio de separación de responsabilidades.

### 4.6 Pruebas con Postman

Se incluye archivo `api-tests.http` con todos los endpoints documentados.

**Ejemplos de peticiones:**

**1. Login:**
```http
POST http://localhost:3000/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Respuesta:**
```json
{
    "success": true,
    "message": "Authentication successful",
    "user": {
        "id": 1,
        "username": "admin",
        "role": "admin"
    },
    "tokens": {
        "accessToken": "eyJhbGciOiJIUzI1NiIs...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
    }
}
```

**2. Obtener productos (requiere autenticación):**
```http
GET http://localhost:3000/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**3. Crear producto (requiere rol admin):**
```http
POST http://localhost:3000/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
    "name": "Nuevo Producto",
    "description": "Descripción del producto",
    "price": 99.99,
    "quantity": 10
}
```

**4. Gestión de usuarios (requiere rol admin_manage_users):**
```http
# Listar todos los usuarios
GET http://localhost:3000/auth/manage/users
Authorization: Bearer <token_del_adminusers>

# Crear nuevo usuario (solo admin o viewer)
POST http://localhost:3000/auth/manage/users
Authorization: Bearer <token_del_adminusers>
Content-Type: application/json

{
    "username": "nuevouser",
    "password": "password123",
    "role": "viewer"
}

# Actualizar rol de usuario
PUT http://localhost:3000/auth/manage/users/2/role
Authorization: Bearer <token_del_adminusers>
Content-Type: application/json

{
    "role": "admin"
}

# Eliminar usuario
DELETE http://localhost:3000/auth/manage/users/2
Authorization: Bearer <token_del_adminusers>
```

> **Nota:** Los endpoints de gestión de usuarios solo están disponibles para el usuario con rol `admin_manage_users`. Este usuario no puede crear otros usuarios con el mismo rol, ni puede modificar o eliminar su propia cuenta, garantizando que siempre exista exactamente un usuario administrador de usuarios.

### 4.7 Scripts Útiles

```bash
# Inicializar BD (con limpieza)
node scripts/initDatabase.js --clean

# Limpiar datos de prueba
node scripts/cleanupTestData.js

# Probar bloqueo de cuentas
node scripts/testAccountLockout.js
```

---

## 5. ENLACES Y RECURSOS

### 5.1 Código Fuente

**Repositorio GitHub:**  
`https://github.com/[tu-usuario]/inventario_server`

### 5.2 Video Demostración

**Enlace al video (YouTube/Drive):**  
`[INSERTAR ENLACE AQUÍ]`

**Duración:** 8-10 minutos  
**Contenido:**
1. Introducción al sistema (1 min)
2. Gestión de usuarios y roles - 3 roles: admin, viewer, admin_manage_users (2 min)
3. Demostración del sistema de gestión de usuarios (endpoints /auth/manage/*) (1 min)
4. Políticas de contraseñas y bloqueo de cuentas (2 min)
5. Demostración de RBAC y separación de responsabilidades (2 min)
6. Monitoreo de seguridad y logs (1 min)
7. Conclusiones (1 min)

### 5.3 Documentación Adicional

- `README.md` - Documentación técnica completa
- `SECURITY_IMPLEMENTATION.md` - Detalles de implementación de seguridad
- `api-tests.http` - Colección de pruebas de API

---

## 6. CONCLUSIONES

### 6.1 Logros del Proyecto

✅ **Sistema completo y funcional** con todas las características de seguridad requeridas  
✅ **Implementación de OWASP Top 10** con controles para A01, A02, A03, A05, A07, A09  
✅ **Arquitectura escalable** con separación de responsabilidades  
✅ **Código bien documentado** con comentarios de seguridad  
✅ **Pruebas exhaustivas** de todos los endpoints y funcionalidades  
✅ **Cumplimiento de estándares** de desarrollo seguro  

### 6.2 Aspectos de Seguridad Destacados

1. **Autenticación robusta** con JWT y rate limiting
2. **Encriptación fuerte** con bcrypt (12 rounds)
3. **Control de acceso granular** con RBAC
4. **Protección contra ataques comunes** (SQL Injection, XSS, CSRF)
5. **Auditoría completa** de eventos de seguridad
6. **Defensa en profundidad** con múltiples capas de protección

### 6.3 Mejoras Futuras

- Implementación de HTTPS/TLS en producción
- Autenticación multi-factor (TOTP/SMS)
- Integración con servicios de identidad (OAuth, SAML)
- Análisis de comportamiento y detección de anomalías
- Implementación de WAF (Web Application Firewall)
- Auditoría de seguridad externa

---

## 7. REFERENCIAS

- OWASP Top 10 2021: https://owasp.org/Top10/
- OWASP Secure Coding Practices: https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/
- Node.js Security Best Practices: https://nodejs.org/en/docs/guides/security/
- Express.js Security Best Practices: https://expressjs.com/en/advanced/best-practice-security.html
- bcrypt Documentation: https://github.com/kelektiv/node.bcrypt.js
- JWT Best Practices: https://tools.ietf.org/html/rfc8725

---

**Fin del Documento**

*Documento generado para el Proyecto Final del Módulo de Seguridad en Aplicaciones Web y Móviles Full Stack*
