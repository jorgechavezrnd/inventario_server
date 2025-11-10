# 🎬 GUIÓN PARA VIDEO DE DEMOSTRACIÓN
## Sistema de Gestión de Inventario - Proyecto Final
## Duración: 8-10 minutos

---

## 📋 PREPARACIÓN ANTES DE GRABAR

### Checklist de Preparación:

- [ ] Servidor iniciado (`npm start`)
- [ ] Base de datos inicializada con datos de ejemplo
- [ ] Postman abierto con colección preparada
- [ ] Navegador con pestañas organizadas
- [ ] Limpiar datos de prueba anteriores (`node scripts/cleanupTestData.js`)
- [ ] Pantalla en resolución clara (1920x1080 recomendado)
- [ ] Audio de micrófono probado
- [ ] Editor de código con archivos clave abiertos

### Archivos a Tener Abiertos en VS Code:

1. `server.js`
2. `services/PasswordService.js`
3. `services/RateLimitService.js`
4. `middleware/auth.js`
5. `routes/auth.js`
6. `database/DatabaseManager.js`

---

## 🎥 SECCIÓN 1: INTRODUCCIÓN (1 minuto)

### [00:00 - 00:15] Presentación

**🎤 Script:**

> "Hola, mi nombre es Jorge Chávez y les presento mi proyecto final del módulo de Seguridad en Aplicaciones Web y Móviles Full Stack. Este es un Sistema de Gestión de Inventario desarrollado con Node.js y Express, implementando los controles de seguridad del OWASP Top 10 2021."

**📹 Mostrar:**
- Pantalla completa del proyecto en VS Code
- README.md abierto mostrando título y descripción

---

### [00:15 - 00:45] Arquitectura del Sistema

**🎤 Script:**

> "El sistema utiliza una arquitectura en capas con Node.js y Express.js en el backend, SQLite como base de datos, y JWT para autenticación. La arquitectura incluye capa de middleware para seguridad, servicios de negocio, y acceso a datos con consultas parametrizadas para prevenir SQL Injection."

**📹 Mostrar:**
- Diagrama de arquitectura (si lo tienes preparado)
- Estructura de carpetas en VS Code
- Archivo `package.json` mostrando dependencias

**💡 Resaltar:**
```json
"dependencies": {
  "bcryptjs": "^2.4.3",      // Encriptación
  "jsonwebtoken": "^9.0.2",  // JWT
  "express-session": "^1.17.3"
}
```

---

### [00:45 - 01:00] Módulos Principales

**🎤 Script:**

> "El sistema incluye cuatro módulos principales: Gestión de Usuarios con ABM completo, Gestión de Inventario con CRUD de productos, Seguridad con rate limiting y bloqueo de cuentas, y Control de Acceso basado en roles."

**📹 Mostrar:**
- Carpeta `routes/` con auth.js y products.js
- Carpeta `services/` con servicios de seguridad
- Carpeta `middleware/` con auth.js y rateLimit.js

---

## 🎥 SECCIÓN 2: GESTIÓN DE USUARIOS Y ROLES (2 minutos)

### [01:00 - 01:30] A07: Gestión de Usuarios

**🎤 Script:**

> "Comenzamos con la gestión de usuarios, implementando el control A07 del OWASP sobre fallas de identificación. El formato de User ID es alfanumérico único entre 3 y 50 caracteres."

**📹 Mostrar:**
- Código en `database/DatabaseManager.js`:

```javascript
const createUsersTable = `
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'viewer',
        ...
    )
`;
```

**🎤 Continuar:**

> "El sistema incluye ABM completo de usuarios. Vamos a crear un usuario nuevo."

**📹 Demostrar en Postman:**
1. POST `/auth/register`
```json
{
    "username": "testuser",
    "password": "SecurePass123",
    "role": "viewer"
}
```

2. Mostrar respuesta exitosa
3. GET `/auth/users` (con token admin) para verificar

---

### [01:30 - 02:00] A01: Roles y RBAC

**🎤 Script:**

> "Implementamos control de acceso basado en roles con dos roles: Admin con permisos completos y Viewer solo con lectura. Aquí está la matriz de permisos."

**📹 Mostrar:**
- Tabla de matriz de roles del documento
- Código en `middleware/auth.js`:

```javascript
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: 'Insufficient permissions'
            });
        }
        next();
    };
};
```

**📹 Demostrar:**
1. Login con viewer
2. Intentar crear producto (debe fallar con 403)
3. Mostrar mensaje de error
4. Login con admin
5. Crear producto exitosamente

---

## 🎥 SECCIÓN 3: POLÍTICAS DE CONTRASEÑAS Y BLOQUEO (2 minutos)

### [02:00 - 02:45] A07: Gestión de Contraseñas

**🎤 Script:**

> "Las contraseñas están protegidas con bcrypt usando 12 salt rounds, que equivale a 4096 iteraciones. Implementamos validación de longitud mínima de 6 caracteres y máxima de 128 para prevenir ataques DoS."

**📹 Mostrar:**
- Código en `services/PasswordService.js`:

```javascript
constructor() {
    this.saltRounds = 12;  // 2^12 = 4096 iteraciones
}

async hashPassword(plainPassword) {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);
    return hashedPassword;
}
```

**📹 Mostrar ejemplo:**
- Contraseña original: `admin123`
- Hash en BD: `$2a$12$LKGhVB5kCq8xZqvYT.nFqe...`

**🎤 Continuar:**

> "También validamos la fortaleza de contraseñas verificando complejidad y patrones comunes."

**📹 Mostrar:**
```javascript
validatePasswordStrength(password) {
    if (password.length < 6) {
        errors.push('Password must be at least 6 characters long');
    }
    // Más validaciones...
}
```

---

### [02:45 - 03:30] Bloqueo por Intentos Fallidos

**🎤 Script:**

> "Una característica clave es el bloqueo automático tras 5 intentos fallidos de login en una ventana de 15 minutos. La cuenta se bloquea por 15 minutos adicionales."

**📹 Mostrar:**
- Código en `services/RateLimitService.js`:

```javascript
this.config = {
    maxAttemptsPerUsername: 5,     // 5 intentos
    lockoutDurationMinutes: 15,    // 15 min bloqueo
    rateLimitWindowMinutes: 15     // Ventana de 15 min
};
```

**🎤 Continuar:**

> "Vamos a demostrarlo intentando login con contraseña incorrecta 5 veces."

**📹 Demostrar en Postman:**
1. Ejecutar 5 veces POST `/auth/login` con contraseña incorrecta
2. Mostrar respuesta de cada intento
3. En el 6to intento, mostrar bloqueo:
```json
{
    "success": false,
    "message": "Account temporarily locked...",
    "error": "ACCOUNT_LOCKED",
    "lockedUntil": "2025-11-06T15:30:00.000Z"
}
```

4. Como admin, ver cuenta bloqueada:
   - GET `/auth/admin/locked-accounts`
5. Desbloquear cuenta:
   - POST `/auth/admin/unlock-account`

---

## 🎥 SECCIÓN 4: CRIPTOGRAFÍA Y PROTECCIÓN DE DATOS (1.5 minutos)

### [03:30 - 04:15] A02: Fallas Criptográficas

**🎤 Script:**

> "Para prevenir fallas criptográficas, implementamos algoritmos fuertes. Bcrypt con 12 rounds para contraseñas, HMAC-SHA256 para firmar tokens JWT, y sesiones con IDs criptográficamente seguros."

**📹 Mostrar:**
- Tabla de algoritmos usados
- Código en `services/JWTService.js`:

```javascript
constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET;
    this.accessTokenExpiry = '15m';  // 15 minutos
    this.refreshTokenExpiry = '7d';  // 7 días
}

generateAccessToken(payload) {
    return jwt.sign(payload, this.accessTokenSecret, {
        expiresIn: this.accessTokenExpiry,
        algorithm: 'HS256'  // HMAC-SHA256
    });
}
```

**📹 Demostrar:**
1. Login exitoso mostrando tokens JWT
2. Copiar accessToken
3. Decodificar en jwt.io para mostrar payload (sin revelar secret)
4. Usar token en request de productos

**🎤 Continuar:**

> "Los tokens expiran automáticamente: access tokens en 15 minutos y refresh tokens en 7 días, minimizando ventanas de ataque."

---

### [04:15 - 04:45] Protección contra Timing Attacks

**🎤 Script:**

> "Implementamos protección contra timing attacks realizando operaciones de hash incluso cuando el usuario no existe, manteniendo tiempos de respuesta consistentes."

**📹 Mostrar:**
- Código en `services/AuthService.js`:

```javascript
async authenticateUser(username, password) {
    const user = await this.db.getUserByUsername(username);
    
    if (!user) {
        // Perform dummy hash to prevent timing attack
        await this.passwordService.hashPassword('dummy_password');
        
        return { 
            success: false, 
            message: 'Invalid username or password'
        };
    }
    // ...
}
```

---

## 🎥 SECCIÓN 5: PROTECCIÓN CONTRA VULNERABILIDADES OWASP (2 minutos)

### [04:45 - 05:30] A03: Injection (SQL Injection)

**🎤 Script:**

> "Para prevenir SQL Injection, usamos consultas parametrizadas en el 100% de las operaciones de base de datos. Nunca concatenamos strings para formar queries."

**📹 Mostrar:**
- Código en `database/DatabaseManager.js`:

```javascript
// ✅ CORRECTO: Parametrizado
this.db.get('SELECT * FROM users WHERE username = ?', [username], ...)

// ❌ INCORRECTO (NO usado)
// this.db.get('SELECT * FROM users WHERE username = "' + username + '"')
```

**📹 Demostrar ataque fallido:**
1. En Postman, intentar login con:
```json
{
    "username": "admin' OR '1'='1",
    "password": "cualquiera"
}
```
2. Mostrar que falla (protección exitosa)
3. Verificar logs del servidor

**🎤 Continuar:**

> "Además, sanitizamos los datos en logs para prevenir log injection."

**📹 Mostrar:**
```javascript
const sanitizedUsername = username.replace(/[\r\n\t]/g, '');
```

---

### [05:30 - 06:15] A05: Security Misconfiguration

**🎤 Script:**

> "Configuramos headers de seguridad HTTP, CORS restrictivo, y cookies con flags httpOnly y secure para producción."

**📹 Mostrar:**
- Código de headers de seguridad:

```javascript
res.setHeader('X-Frame-Options', 'DENY');
res.setHeader('X-Content-Type-Options', 'nosniff');
res.setHeader('X-XSS-Protection', '1; mode=block');
```

- Configuración de sesiones:

```javascript
cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,  // No accesible desde JavaScript
    sameSite: 'strict'  // Protección CSRF
}
```

**📹 Demostrar:**
1. Hacer request y mostrar response headers en Postman
2. Mostrar headers de seguridad configurados

---

### [06:15 - 07:00] A09: Security Logging

**🎤 Script:**

> "Implementamos logging completo de eventos de seguridad: intentos de login, bloqueos de cuenta, accesos no autorizados, y operaciones administrativas."

**📹 Mostrar:**
- Consola del servidor con logs en tiempo real
- GET `/auth/admin/login-attempts/testuser` para ver historial
- Respuesta mostrando tabla de intentos con timestamps, IPs, user agents

**📹 Mostrar:**
- Código del servicio de mantenimiento:

```javascript
// services/SecurityMaintenanceService.js
async generateSecurityReport() {
    console.log('📊 === SECURITY REPORT ===');
    console.log(`Total Attempts: ${stats.totalAttempts}`);
    console.log(`Failed Attempts: ${stats.failedAttempts}`);
    console.log(`Active Lockouts: ${stats.activeLockouts}`);
    // ...
}
```

---

## 🎥 SECCIÓN 6: VALIDACIÓN Y PRINCIPIOS SEGUROS (1.5 minutos)

### [07:00 - 07:45] Validación de Entrada

**🎤 Script:**

> "Validamos todas las entradas del usuario antes de procesarlas. Aquí vemos validación de productos con verificación de tipos de datos, rangos permitidos, y campos requeridos."

**📹 Mostrar:**
- Código de validación en `routes/products.js`:

```javascript
if (!name || !price || !quantity) {
    return res.status(400).json({
        message: 'Name, price, and quantity are required'
    });
}

if (isNaN(price) || price < 0) {
    return res.status(400).json({
        message: 'Price must be a positive number'
    });
}
```

**📹 Demostrar:**
1. Intentar crear producto con precio negativo
2. Mostrar error de validación
3. Intentar con datos correctos
4. Mostrar creación exitosa

---

### [07:45 - 08:15] Principios de Diseño Seguro

**🎤 Script:**

> "Aplicamos principios de diseño seguro: Defensa en profundidad con múltiples capas, principio de mínimo privilegio con usuarios viewer por defecto, y separación de responsabilidades en la arquitectura."

**📹 Mostrar:**
- Arquitectura en capas (diagrama o código)
- Flujo de request a través de múltiples middleware:

```javascript
router.post('/', 
    requireAuth,           // Capa 1: Autenticación
    requireRole(['admin']), // Capa 2: Autorización
    async (req, res) => {   // Capa 3: Validación
        // Capa 4: Lógica de negocio
        // Capa 5: Acceso a datos
    }
);
```

---

## 🎥 SECCIÓN 7: DEMOSTRACIÓN INTEGRADA (1 minuto)

### [08:15 - 09:00] Flujo Completo

**🎤 Script:**

> "Veamos un flujo completo de uso del sistema: Login de admin, creación de producto, consulta de inventario, y revisión de logs de seguridad."

**📹 Demostrar secuencia:**

1. **Login Admin**
   - POST `/auth/login` con admin
   - Guardar token

2. **Ver productos existentes**
   - GET `/products`
   - Mostrar lista

3. **Crear nuevo producto**
   - POST `/products`
   ```json
   {
       "name": "Smart Watch Pro",
       "description": "Smartwatch con monitoreo de salud",
       "price": 299.99,
       "quantity": 15
   }
   ```

4. **Verificar creación**
   - GET `/products`
   - Mostrar nuevo producto en lista

5. **Ver actividad de seguridad**
   - GET `/auth/admin/login-attempts/admin`
   - Mostrar historial

6. **Ver cuentas bloqueadas**
   - GET `/auth/admin/locked-accounts`
   - Mostrar lista (si hay alguna)

---

## 🎥 SECCIÓN 8: CONCLUSIONES (1 minuto)

### [09:00 - 09:45] Resumen de Implementación

**🎤 Script:**

> "En resumen, este sistema implementa controles completos de seguridad del OWASP Top 10: A01 Control de Acceso con RBAC, A02 Criptografía con bcrypt y JWT, A03 prevención de Injection con consultas parametrizadas, A05 configuración segura con headers HTTP, A07 autenticación robusta con bloqueo de cuentas, y A09 logging completo de seguridad."

**📹 Mostrar:**
- Checklist visual de controles implementados
- Estadísticas del proyecto:
  - Líneas de código
  - Número de endpoints
  - Cobertura de seguridad

---

### [09:45 - 10:00] Cierre

**🎤 Script:**

> "El código completo está disponible en GitHub, la documentación incluye guías de instalación y despliegue, y el sistema está listo para uso en producción con las configuraciones apropiadas. Gracias por su atención."

**📹 Mostrar:**
- Pantalla final con información:
  - **Repositorio:** github.com/[usuario]/inventario_server
  - **Documentación:** README.md, PROYECTO_FINAL.md
  - **Contacto:** [tu-email]

---

## 📝 TIPS PARA LA GRABACIÓN

### Técnicos:
- ✅ Resolución mínima: 1280x720 (HD)
- ✅ FPS: 30 fps mínimo
- ✅ Audio claro sin ruido de fondo
- ✅ Cerrar notificaciones y aplicaciones innecesarias
- ✅ Usar modo "No molestar"

### De Presentación:
- ✅ Hablar claro y a ritmo moderado
- ✅ Hacer pausas entre secciones
- ✅ Resaltar puntos importantes con el cursor
- ✅ Usar zoom cuando muestres código
- ✅ Practicar antes de grabar

### De Contenido:
- ✅ No exceder 10 minutos (ideal 8-9 min)
- ✅ Seguir el orden lógico del guión
- ✅ Mostrar código y demostraciones en vivo
- ✅ Evitar leer literalmente, explicar con tus palabras
- ✅ Mostrar errores y cómo se previenen

---

## 🎬 SOFTWARE RECOMENDADO PARA GRABAR

### Windows:
- **OBS Studio** (gratis, profesional)
- **Camtasia** (de pago, muy fácil de usar)
- **Xbox Game Bar** (incluido en Windows 10/11)

### Mac:
- **QuickTime Player** (incluido)
- **ScreenFlow** (de pago)
- **OBS Studio** (gratis)

### Edición (opcional):
- **DaVinci Resolve** (gratis, profesional)
- **Shotcut** (gratis, sencillo)

---

## ✅ CHECKLIST PRE-GRABACIÓN

- [ ] Servidor corriendo sin errores
- [ ] Base de datos inicializada
- [ ] Postman con colección lista
- [ ] Archivos de código abiertos
- [ ] Pantalla limpia y organizada
- [ ] Audio probado
- [ ] Script repasado
- [ ] Timer visible para controlar duración
- [ ] Datos de prueba preparados
- [ ] Plan B si algo falla (tener backup de DB)

---

## 🎯 PUNTOS CLAVE A ENFATIZAR

1. **Seguridad por capas** (Defense in Depth)
2. **Bloqueo automático de cuentas** (demostración en vivo)
3. **Consultas parametrizadas** (prevención SQL Injection)
4. **RBAC funcional** (admin vs viewer)
5. **Logging completo** (auditoría)
6. **Encriptación fuerte** (bcrypt 12 rounds)
7. **JWT con expiración** (minimizar ventanas de ataque)
8. **Validación exhaustiva** (no confiar en el cliente)

---

**¡Buena suerte con la grabación!** 🎬
