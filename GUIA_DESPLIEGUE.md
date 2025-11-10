# 📦 GUÍA DE DESPLIEGUE Y PRUEBA
## Sistema de Gestión de Inventario - Proyecto Final

---

## 🚀 INSTALACIÓN RÁPIDA

### Paso 1: Descargar el Proyecto

```bash
# Opción A: Clonar desde GitHub
git clone https://github.com/[tu-usuario]/inventario_server.git
cd inventario_server

# Opción B: Descargar ZIP y extraer
# Luego navegar al directorio
cd inventario_server
```

### Paso 2: Instalar Dependencias

```bash
npm install
```

### Paso 3: Inicializar Base de Datos

```bash
npm run init-db
```

### Paso 4: Iniciar el Servidor

```bash
npm start
```

**¡Listo!** El servidor estará corriendo en `http://localhost:3000`

---

## 👥 USUARIOS DE PRUEBA

### Usuario Administrador
```
Username: admin
Password: admin123
Rol: admin
Permisos: Acceso completo a todas las funcionalidades
```

### Usuario Visualizador
```
Username: viewer
Password: viewer123
Rol: viewer
Permisos: Solo lectura (puede ver pero no modificar)
```

---

## 🧪 PRUEBAS DEL SISTEMA

### Herramienta Recomendada: Postman

**Descargar:** https://www.postman.com/downloads/

### Archivo de Pruebas Incluido

El proyecto incluye `api-tests.http` con todas las peticiones pre-configuradas.

### Pruebas Manuales con cURL

#### 1. Verificar que el servidor funciona

```bash
curl http://localhost:3000/health
```

**Respuesta esperada:**
```json
{
    "status": "ok",
    "timestamp": "2025-11-06T..."
}
```

#### 2. Login con usuario admin

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Respuesta esperada:**
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
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
}
```

**💡 Guardar el accessToken para las siguientes peticiones**

#### 3. Obtener lista de productos

```bash
curl http://localhost:3000/products \
  -H "Authorization: Bearer [TU_ACCESS_TOKEN]"
```

#### 4. Crear un producto (solo admin)

```bash
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer [TU_ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Producto de Prueba\",\"description\":\"Descripción\",\"price\":99.99,\"quantity\":10}"
```

#### 5. Intentar crear producto con usuario viewer (debe fallar)

```bash
# Primero login con viewer
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"viewer\",\"password\":\"viewer123\"}"

# Luego intentar crear producto (DEBE RETORNAR ERROR 403)
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer [VIEWER_ACCESS_TOKEN]" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Producto\",\"description\":\"Test\",\"price\":99,\"quantity\":5}"
```

**Respuesta esperada:**
```json
{
    "success": false,
    "message": "Insufficient permissions. Required role(s): admin",
    "code": "INSUFFICIENT_PERMISSIONS"
}
```

---

## 🛡️ PRUEBAS DE SEGURIDAD

### Prueba 1: Bloqueo de Cuenta por Intentos Fallidos

```bash
# Ejecutar script de prueba incluido
node scripts/testAccountLockout.js
```

O manualmente:

```bash
# Intentar login con contraseña incorrecta 5 veces
for i in {1..5}; do
  curl -X POST http://localhost:3000/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"admin\",\"password\":\"contraseña_incorrecta\"}"
  echo "\n--- Intento $i ---\n"
done

# El 6to intento debe retornar cuenta bloqueada (HTTP 423)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

**Respuesta esperada (intento 6):**
```json
{
    "success": false,
    "message": "Account temporarily locked due to multiple failed login attempts",
    "error": "ACCOUNT_LOCKED",
    "lockedUntil": "2025-11-06T15:30:00.000Z"
}
```

### Prueba 2: Protección contra SQL Injection

```bash
# Intentar SQL Injection en login (debe fallar)
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin' OR '1'='1\",\"password\":\"cualquiera\"}"
```

**Resultado esperado:** Login fallido (protegido con consultas parametrizadas)

### Prueba 3: Validación de Datos

```bash
# Intentar crear producto con datos inválidos
curl -X POST http://localhost:3000/products \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Producto\",\"price\":\"no_es_numero\",\"quantity\":-5}"
```

**Respuesta esperada:**
```json
{
    "success": false,
    "message": "Price must be a positive number"
}
```

### Prueba 4: Expiración de Tokens JWT

```bash
# El access token expira en 15 minutos
# Después de 15 min, usar el mismo token debe retornar error
curl http://localhost:3000/products \
  -H "Authorization: Bearer [TOKEN_EXPIRADO]"
```

**Respuesta esperada:**
```json
{
    "success": false,
    "message": "Access token expired. Please refresh your token.",
    "code": "TOKEN_EXPIRED"
}
```

---

## 📊 ENDPOINTS DE ADMINISTRACIÓN

### Ver Intentos de Login (Admin only)

```bash
curl http://localhost:3000/auth/admin/login-attempts/admin?limit=20 \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Ver Cuentas Bloqueadas (Admin only)

```bash
curl http://localhost:3000/auth/admin/locked-accounts \
  -H "Authorization: Bearer [ADMIN_TOKEN]"
```

### Desbloquear Cuenta (Admin only)

```bash
curl -X POST http://localhost:3000/auth/admin/unlock-account \
  -H "Authorization: Bearer [ADMIN_TOKEN]" \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\"}"
```

---

## 🔧 COMANDOS ÚTILES

### Limpiar Datos de Prueba

```bash
node scripts/cleanupTestData.js
```

### Reinicializar Base de Datos

```bash
# Con limpieza completa
npm run init-db

# El script preguntará si deseas limpiar datos existentes
```

### Ver Logs del Servidor

Los logs se muestran en la consola donde se ejecuta `npm start`

---

## 📱 COLECCIÓN DE POSTMAN

### Importar Colección

1. Abrir Postman
2. Click en "Import"
3. Seleccionar el archivo `api-tests.http` o crear manualmente

### Colección Básica para Postman

#### Configurar Variable de Entorno

1. Crear environment "Inventario Server"
2. Agregar variables:
   - `baseUrl`: `http://localhost:3000`
   - `accessToken`: (se llenará automáticamente)
   - `refreshToken`: (se llenará automáticamente)

#### Request 1: Login Admin

```
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Tests (Script para guardar token):**
```javascript
if (pm.response.code === 200) {
    const jsonData = pm.response.json();
    pm.environment.set("accessToken", jsonData.tokens.accessToken);
    pm.environment.set("refreshToken", jsonData.tokens.refreshToken);
}
```

#### Request 2: Get Products

```
GET {{baseUrl}}/products
Authorization: Bearer {{accessToken}}
```

#### Request 3: Create Product

```
POST {{baseUrl}}/products
Authorization: Bearer {{accessToken}}
Content-Type: application/json

{
    "name": "Laptop Lenovo ThinkPad",
    "description": "Laptop empresarial con procesador Intel i7",
    "price": 1499.99,
    "quantity": 3
}
```

---

## 🌐 DESPLIEGUE EN PRODUCCIÓN

### Variables de Entorno Requeridas

Crear archivo `.env` en producción:

```env
# JWT Secrets (CAMBIAR en producción)
JWT_ACCESS_SECRET=clave-super-secreta-acceso-minimo-256-bits-cambiar-en-produccion
JWT_REFRESH_SECRET=clave-super-secreta-refresh-minimo-256-bits-cambiar-en-produccion

# Session Secret (CAMBIAR en producción)
SESSION_SECRET=clave-super-secreta-sesion-minimo-256-bits-cambiar-en-produccion

# Security
BCRYPT_SALT_ROUNDS=12

# Environment
NODE_ENV=production

# CORS (CAMBIAR a tu dominio)
ALLOWED_ORIGINS=https://tu-dominio.com

# JWT Expiry
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Plataformas de Despliegue Recomendadas

#### Opción 1: Heroku

```bash
# Instalar Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Login
heroku login

# Crear app
heroku create nombre-de-tu-app

# Configurar variables de entorno
heroku config:set JWT_ACCESS_SECRET=tu-clave-secreta
heroku config:set JWT_REFRESH_SECRET=tu-clave-secreta
heroku config:set SESSION_SECRET=tu-clave-secreta
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Inicializar BD
heroku run npm run init-db
```

#### Opción 2: Railway

1. Conectar repositorio GitHub
2. Configurar variables de entorno en dashboard
3. Deploy automático

#### Opción 3: Render

1. Conectar repositorio GitHub
2. Configurar como "Web Service"
3. Agregar variables de entorno
4. Deploy automático

### Consideraciones de Producción

- ✅ Usar HTTPS obligatoriamente
- ✅ Configurar variables de entorno seguras
- ✅ Usar base de datos externa (PostgreSQL, MySQL)
- ✅ Configurar backups automáticos
- ✅ Implementar rate limiting a nivel de infraestructura
- ✅ Monitoreo con servicios como Sentry, LogRocket
- ✅ CDN para assets estáticos

---

## 🐛 TROUBLESHOOTING

### Error: Cannot find module

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: EADDRINUSE (Puerto 3000 en uso)

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Base de datos corrupta

```bash
# Eliminar BD y reinicializar
rm database.sqlite
npm run init-db
```

### Token inválido o expirado

```bash
# Hacer login nuevamente para obtener nuevo token
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"
```

---

## 📞 SOPORTE

### Recursos de Ayuda

- **Documentación completa**: Ver `README.md`
- **Implementación de seguridad**: Ver `SECURITY_IMPLEMENTATION.md`
- **Proyecto final**: Ver `PROYECTO_FINAL.md`
- **Tests de API**: Ver `api-tests.http`

### Contacto

**Desarrollador:** Jorge Chávez  
**Email:** [tu-email@example.com]  
**GitHub:** [tu-usuario]

---

## ✅ CHECKLIST DE VERIFICACIÓN

Antes de entregar el proyecto, verificar:

- [ ] Servidor inicia sin errores
- [ ] Login con admin funciona
- [ ] Login con viewer funciona
- [ ] Crear producto con admin funciona
- [ ] Crear producto con viewer falla (403)
- [ ] Bloqueo de cuenta tras 5 intentos funciona
- [ ] Ver cuentas bloqueadas (admin) funciona
- [ ] Desbloquear cuenta funciona
- [ ] Tokens JWT expiran correctamente
- [ ] Consultas parametrizadas protegen contra SQL Injection
- [ ] Validación de datos funciona
- [ ] Headers de seguridad están configurados
- [ ] Logs de seguridad funcionan
- [ ] Documentación está completa
- [ ] Video de demostración está grabado

---

**¡Proyecto listo para entrega!**
