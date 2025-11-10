# MATRIZ DE ROLES - SISTEMA DE GESTIÓN DE INVENTARIO Y USUARIOS

## Matriz de Permisos por Rol

| SISTEMA/RECURSO | **AUTENTICACIÓN** | | | **MÓDULO: PRODUCTOS** | | | | | **MÓDULO: USUARIOS** | | | |
|----------------|-------------------|---|---|---------------------|---|---|---|---|---------------------|---|---|---|
| **ROLES** | Login | Logout | Refresh | Ver Lista | Ver Detalle | Crear | Actualizar | Eliminar | Listar | Crear | Cambiar Rol | Eliminar |
| **admin** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **viewer** | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **admin_manage_users** | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ |

**Leyenda:**
- ✅ = Permiso concedido
- ❌ = Permiso denegado

---

## Descripción de Roles

### 1. Rol: admin
**Usuario de ejemplo:** `admin` / `admin123`

**Responsabilidad:** Administración completa del inventario de productos

**Permisos:**
- ✅ Acceso completo (CRUD) al módulo de productos
- ✅ Ver, crear, actualizar y eliminar productos
- ❌ Sin acceso a gestión de usuarios

**Endpoints permitidos:**
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `GET /products`, `GET /products/:id`
- `POST /products`, `PUT /products/:id`, `DELETE /products/:id`

---

### 2. Rol: viewer
**Usuario de ejemplo:** `viewer` / `viewer123`

**Responsabilidad:** Consulta de inventario (solo lectura)

**Permisos:**
- ✅ Ver productos (lectura)
- ❌ No puede crear, modificar o eliminar productos
- ❌ Sin acceso a gestión de usuarios

**Endpoints permitidos:**
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `GET /products`, `GET /products/:id`

---

### 3. Rol: admin_manage_users
**Usuario de ejemplo:** `adminusers` / `adminusers123`

**Responsabilidad:** Administración exclusiva de usuarios y roles

**Características especiales:**
- 🔒 **Rol único**: Solo existe UN usuario con este rol
- 🔒 **Protegido**: No puede ser eliminado ni modificado
- 🔒 **Inmutable**: No puede cambiar su propio rol

**Permisos:**
- ✅ Acceso completo (CRUD) al módulo de usuarios
- ✅ Crear usuarios con roles `admin` o `viewer`
- ✅ Actualizar roles de usuarios existentes
- ✅ Eliminar usuarios
- ❌ Sin acceso a productos/inventario

**Endpoints permitidos:**
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `GET /auth/manage/users`
- `POST /auth/manage/users`
- `PUT /auth/manage/users/:id/role`
- `DELETE /auth/manage/users/:id`

**Restricciones:**
- ❌ NO puede crear usuarios con rol `admin_manage_users`
- ❌ NO puede modificar el rol del usuario `adminusers`
- ❌ NO puede eliminar el usuario `adminusers`
- ❌ NO puede eliminarse a sí mismo

---

## Principio de Separación de Responsabilidades

El sistema implementa una **separación estricta de responsabilidades**:

```
┌─────────────────────────────────────────────────────────┐
│                    USUARIOS DEL SISTEMA                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────┐       ┌──────────────────┐   │
│  │  admin / viewer      │       │  admin_manage_   │   │
│  │                      │       │  users           │   │
│  │  Gestionan:          │       │                  │   │
│  │  - Productos         │       │  Gestiona:       │   │
│  │  - Inventario        │       │  - Usuarios      │   │
│  │                      │       │  - Roles         │   │
│  └──────────────────────┘       └──────────────────┘   │
│           │                              │              │
│           │                              │              │
│           ▼                              ▼              │
│  ┌──────────────────────┐       ┌──────────────────┐   │
│  │  /products/*         │       │  /auth/manage/*  │   │
│  │  Endpoints           │       │  Endpoints       │   │
│  └──────────────────────┘       └──────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Ventajas de esta arquitectura:**
- ✅ Menor superficie de ataque
- ✅ Prevención de escalada de privilegios
- ✅ Cumplimiento del principio de mínimo privilegio
- ✅ Auditoría y trazabilidad mejorada
- ✅ Facilita cumplimiento normativo (SOC 2, ISO 27001)

---

## Notas de Seguridad

### Protecciones Implementadas

1. **Validación multinivel:**
   - Base de datos: `CHECK (role IN ('admin', 'viewer', 'admin_manage_users'))`
   - Middleware: `requireRole(['admin_manage_users'])`
   - Lógica de negocio: Validaciones adicionales en controladores

2. **Prevención de escalada de privilegios:**
   - Solo `admin_manage_users` puede modificar roles
   - No puede asignar su propio rol a otros usuarios
   - No puede modificar usuarios protegidos

3. **Garantía de disponibilidad:**
   - Siempre existe al menos un `admin_manage_users`
   - No puede auto-eliminarse
   - Rol inmutable

4. **Auditoría:**
   - Todos los cambios registran `updated_at`
   - Logs de servidor registran operaciones con timestamp
   - Tabla `login_attempts` registra accesos

---

## Aplicaciones Móviles y Roles

### App 1: Inventory Manager
**Roles soportados:** `admin`, `viewer`

**Funcionalidad:**
- Gestión de productos del inventario
- UI adaptativa según rol (admin ve botones CRUD, viewer solo lectura)

### App 2: User Manager
**Roles soportados:** `admin_manage_users` (exclusivo)

**Funcionalidad:**
- Gestión de usuarios y roles
- Protección visual del usuario `adminusers` (icono 🔒)
- Dropdown solo muestra roles `admin` y `viewer`

---

## Cumplimiento OWASP Top 10

Esta matriz de roles aborda específicamente:

- **A01:2021 - Broken Access Control**
  - ✅ Control de acceso basado en roles (RBAC)
  - ✅ Validación de permisos en cada endpoint
  - ✅ Separación de responsabilidades
  - ✅ Prevención de escalada de privilegios

- **A07:2021 - Identification and Authentication Failures**
  - ✅ Gestión segura de usuarios
  - ✅ Protección de cuentas privilegiadas
  - ✅ Rate limiting y bloqueo de cuentas
  - ✅ Auditoría de intentos de acceso

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0  
**Sistema:** Inventory & User Management API Server
