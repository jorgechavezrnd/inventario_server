# 🔐 Inventario Server - Sistema de Gestión de Inventario con Seguridad JWT

Un servidor Express.js completo para gestión de inventario con autenticación JWT avanzada, control de acceso basado en roles (RBAC), y seguridad empresarial.

## ⚡ Características Principales

### 🛡️ Seguridad Empresarial
- **Autenticación Híbrida**: JWT + Sesiones para máxima compatibilidad
- **JWT Tokens**: Access tokens (15 min) y refresh tokens (7 días)
- **Encriptación**: Contraseñas protegidas con bcrypt (12 salt rounds)
- **RBAC**: Control de acceso granular por roles (admin/viewer)
- **Validación**: Contraseñas seguras y validación de entrada robusta

### 🏗️ Arquitectura Técnica
- **Framework**: Express.js 4.18.2 con Node.js
- **Base de datos**: SQLite con gestión asíncrona
- **Autenticación**: JWT con rotación automática de tokens
- **Middleware**: Sistema de middleware modular y reutilizable
- **API RESTful**: Endpoints completamente documentados

### 📋 Funcionalidades del Sistema
- **Gestión de Productos**: CRUD completo con validaciones
- **Gestión de Usuarios**: Registro, autenticación, perfiles
- **Administración**: Panel de control para usuarios admin
- **Auditoría**: Logs de seguridad y rastreo de acciones

## 📁 Estructura del Proyecto

```
inventario_server/
├── server.js                      # Servidor principal Express
├── package.json                   # Dependencias y scripts
├── api-tests.http                 # Tests completos de API
├── README.md                      # Documentación del proyecto
│
├── database/
│   ├── DatabaseManager.js         # Gestión SQLite con async/await
│   └── inventario.db              # Base de datos SQLite (auto-generada)
│
├── services/
│   ├── AuthService.js             # Lógica de autenticación
│   ├── JWTService.js              # Gestión completa de tokens JWT
│   └── PasswordService.js         # Encriptación y validación de contraseñas
│
├── middleware/
│   └── auth.js                    # Middleware de autenticación híbrida
│
├── routes/
│   ├── auth.js                    # Endpoints de autenticación
│   └── products.js               # Endpoints de productos
│
└── scripts/
    ├── initDatabase.js            # Inicialización de BD con datos ejemplo
    └── migratePasswords.js        # Migración de contraseñas a encriptadas
```

## 🚀 Instalación y Configuración

### 📋 Prerequisitos
```bash
# Node.js 14+ y npm
node --version
npm --version
```

### ⬇️ Instalación
```bash
# Ir al directorio del proyecto
cd inventario_server

# Instalar dependencias
npm install
```

### 💾 Inicialización de Base de Datos
```bash
# Crear base de datos con datos de ejemplo
npm run init-db

# (Opcional) Migrar contraseñas existentes a formato encriptado
npm run migrate-passwords
```

### ▶️ Iniciar el Servidor
```bash
# Iniciar servidor
npm start

# El servidor estará disponible en: http://localhost:3000
```

### ✅ Verificación
```bash
# Verificar que el servidor funciona
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","timestamp":"..."}
```

## 🔗 API Endpoints

### 🔑 Autenticación y Usuarios

| Método | Endpoint | Descripción | Roles | Auth |
|--------|----------|-------------|--------|------|
| `POST` | `/auth/login` | Iniciar sesión con credenciales | Todos | No |
| `POST` | `/auth/logout` | Cerrar sesión y limpiar tokens | Todos | Sí |
| `GET` | `/auth/profile` | Obtener perfil del usuario actual | Todos | Sí |
| `POST` | `/auth/register` | Registrar nuevo usuario | Admin | Sí |
| `POST` | `/auth/refresh` | Renovar access token | Todos | Refresh Token |
| `PUT` | `/auth/change-password` | Cambiar contraseña | Todos | Sí |
| `GET` | `/auth/token-info` | Información del token JWT | Todos | Sí |

### 📦 Gestión de Productos

| Método | Endpoint | Descripción | Roles | Auth |
|--------|----------|-------------|--------|------|
| `GET` | `/products` | Listar todos los productos | Todos | Sí |
| `GET` | `/products/:id` | Obtener producto específico | Todos | Sí |
| `POST` | `/products` | Crear nuevo producto | Admin | Sí |
| `PUT` | `/products/:id` | Actualizar producto existente | Admin | Sí |
| `DELETE` | `/products/:id` | Eliminar producto | Admin | Sí |

### 🔧 Sistema y Salud

| Método | Endpoint | Descripción | Roles | Auth |
|--------|----------|-------------|--------|------|
| `GET` | `/` | Información del servidor | Todos | No |
| `GET` | `/health` | Estado de salud del servidor | Todos | No |

## 👥 Roles y Permisos

### 👨‍💼 Administrador (admin)
- **Productos**: Crear, leer, actualizar, eliminar
- **Usuarios**: Registrar nuevos usuarios
- **Sistema**: Acceso completo a todas las funcionalidades
- **Gestión**: Cambiar contraseñas, administrar tokens

### 👀 Visualizador (viewer)
- **Productos**: Solo lectura (listar y ver detalles)
- **Limitaciones**: No puede crear, actualizar o eliminar productos
- **Usuarios**: No puede registrar usuarios
- **Perfil**: Puede ver y cambiar su propia contraseña

## 🆔 Usuarios Predeterminados

| Usuario | Contraseña | Rol | Descripción |
|---------|------------|-----|-------------|
| `admin` | `admin123` | Administrador | Acceso completo al sistema |
| `viewer` | `viewer123` | Visualizador | Solo lectura de productos |

## 🔐 Autenticación JWT

### 🔄 Flujo de Autenticación

1. **Login** → Credenciales válidas
2. **Respuesta** → Access Token (15 min) + Refresh Token (7 días)
3. **Uso** → Incluir token en header: `Authorization: Bearer <access-token>`
4. **Renovación** → Usar refresh token cuando access token expire
5. **Logout** → Limpiar tokens del cliente

### 💻 Ejemplo de Uso

```bash
# 1. Login para obtener tokens
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Respuesta:
# {
#   "success": true,
#   "user": {"id": 1, "username": "admin", "role": "admin"},
#   "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#   "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
# }

# 2. Usar access token para requests autenticados
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  http://localhost:3000/products

# 3. Renovar token cuando expire (después de 15 min)
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"eyJhbGciOiJIUzI1NiIs..."}'

# 4. Crear producto (solo admin)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer <nuevo-access-token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nuevo Producto","description":"Descripción","price":99.99,"stock":10}'
```

### 🔐 Métodos de Autenticación Soportados

#### 🎫 JWT (Recomendado)
```javascript
// Header requerido
Authorization: Bearer <access-token>

// Ventajas:
// - Stateless (sin sesiones en servidor)
// - Escalable para microservicios
// - Tokens con expiración automática
// - Información del usuario en el token
```

#### 🍪 Sesiones (Compatibilidad)
```javascript
// Cookie automática (no header necesario)
// Se mantiene por compatibilidad con sistemas legacy

// Ventajas:
// - Simple de implementar
// - Manejo automático de cookies
// - Compatible con aplicaciones web tradicionales
```

## 🧪 Pruebas y Testing

### 📄 Archivo de Pruebas
El archivo `api-tests.http` contiene más de 50 tests organizados en categorías:

1. **General**: Endpoints básicos del servidor
2. **Autenticación por Sesión**: Tests de compatibilidad
3. **Autenticación JWT**: Tests completos de tokens
4. **Gestión de Contraseñas**: Cambio y validación
5. **Operaciones Admin**: Tests de permisos administrativos
6. **Operaciones Viewer**: Tests de permisos limitados
7. **Errores de Autenticación**: Manejo de errores JWT
8. **Errores de Validación**: Validaciones de entrada
9. **Autenticación Híbrida**: Tests de compatibilidad
10. **Flujos Completos**: Demostraciones end-to-end

### ▶️ Cómo Ejecutar Tests

#### 📝 Opción 1: VS Code REST Client
1. Instalar extensión "REST Client"
2. Abrir `api-tests.http`
3. Hacer clic en "Send Request" sobre cada test

#### 💻 Opción 2: cURL Manual
```bash
# Copiar comandos del archivo api-tests.http
# Ejecutar en terminal uno por uno
```

#### 📮 Opción 3: Postman
1. Importar requests desde `api-tests.http`
2. Configurar environment variables
3. Ejecutar collection completa

## 🛠️ Tecnologías y Dependencias

### ⚡ Backend Core
```json
{
  "express": "^4.18.2",        // Framework web principal
  "sqlite3": "^5.1.6",        // Base de datos SQLite
  "cors": "^2.8.5"             // Soporte CORS
}
```

### 🔒 Seguridad y Autenticación
```json
{
  "jsonwebtoken": "^9.0.2",    // Manejo de JWT tokens
  "bcryptjs": "^2.4.3",       // Encriptación de contraseñas
  "express-session": "^1.17.3" // Sesiones (compatibilidad)
}
```

### 🔧 Desarrollo
```json
{
  "nodemon": "^3.0.1"         // Auto-restart en desarrollo
}
```

## ⚙️ Scripts NPM Disponibles

```json
{
  "start": "node server.js",              // Iniciar servidor producción
  "dev": "nodemon server.js",             // Iniciar servidor desarrollo
  "init-db": "node scripts/initDatabase.js",     // Inicializar base de datos
  "migrate-passwords": "node scripts/migratePasswords.js"  // Migrar contraseñas
}
```

## 🔒 Configuración de Seguridad

### 🔑 Configuración JWT
```javascript
// Configuración actual (ajustar para producción)
const JWT_CONFIG = {
  accessTokenExpiry: '15m',    // 15 minutos
  refreshTokenExpiry: '7d',    // 7 días
  saltRounds: 12,             // bcrypt salt rounds
  secretKey: 'your-secret-key' // CAMBIAR en producción
};
```

### 🏭 Recomendaciones de Producción
```bash
# 1. Variables de entorno
export JWT_SECRET="tu-secreto-super-seguro-aleatorio-256-bits"
export JWT_REFRESH_SECRET="otro-secreto-diferente-para-refresh"
export NODE_ENV="production"

# 2. HTTPS obligatorio
# 3. Rate limiting
# 4. Helmet.js para headers de seguridad
# 5. Validación de entrada más estricta
```

## 📊 Códigos de Estado HTTP

| Código | Estado | Descripción | Casos de Uso |
|--------|--------|-------------|--------------|
| `200` | OK | Operación exitosa | GET, PUT exitosos |
| `201` | Created | Recurso creado | POST exitoso |
| `400` | Bad Request | Error de validación | Datos inválidos |
| `401` | Unauthorized | Autenticación requerida | Token inválido/expirado |
| `403` | Forbidden | Permisos insuficientes | Rol inadecuado |
| `404` | Not Found | Recurso no encontrado | ID no existe |
| `500` | Server Error | Error interno | Error de servidor |

### 🚨 Códigos de Error Específicos JWT
```javascript
{
  "NO_AUTH": "No hay autenticación",
  "TOKEN_EXPIRED": "Token JWT expirado",
  "INVALID_TOKEN": "Token JWT inválido",
  "INSUFFICIENT_PERMISSIONS": "Permisos insuficientes"
}
```

## 🚀 Puesta en Producción

### 🔧 Configuración de Entorno
```bash
# 1. Crear archivo .env
JWT_SECRET=tu-secreto-production-seguro-256-bits
JWT_REFRESH_SECRET=otro-secreto-diferente
NODE_ENV=production
PORT=3000
DATABASE_URL=./database/inventario.db

# 2. Instalar dependencias de producción
npm ci --only=production

# 3. Inicializar base de datos
npm run init-db

# 4. Iniciar servidor
npm start
```

### ✅ Checklist de Seguridad
- [ ] Cambiar secretos JWT por valores aleatorios seguros
- [ ] Habilitar HTTPS/TLS
- [ ] Implementar rate limiting
- [ ] Agregar headers de seguridad (Helmet.js)
- [ ] Configurar CORS apropiadamente
- [ ] Implementar logging y monitoreo
- [ ] Backup automático de base de datos
- [ ] Validar todas las entradas de usuario
- [ ] Implementar rotación de secretos

## 🔮 Características Futuras

- [ ] API para aplicaciones móviles
- [ ] Búsqueda avanzada de productos
- [ ] Dashboard de analytics
- [ ] Notificaciones en tiempo real
- [ ] Export/Import de datos
- [ ] Internacionalización (i18n)
- [ ] Panel de administración web

## 🔧 Solución de Problemas

Si encuentras algún problema:
1. Verificar que todas las dependencias estén instaladas
2. Comprobar que el servidor esté corriendo en puerto 3000
3. Revisar logs del servidor para errores
4. Verificar que la base de datos esté inicializada

## 📚 Recursos Adicionales

- [Express.js Documentation](https://expressjs.com/)
- [JWT.io - JWT Debugger](https://jwt.io/)
- [bcrypt.js Documentation](https://github.com/dcodeIO/bcrypt.js)
- [SQLite Documentation](https://sqlite.org/docs.html)

---

**🔐 Sistema de Inventario con Seguridad JWT**

*Desarrollado para demostrar implementación de controles de seguridad empresarial*