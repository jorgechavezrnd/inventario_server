# API de Gestión de Usuarios - Endpoints

## Autenticación

Todos los endpoints requieren autenticación con el rol `admin_manage_users`.

**Credenciales del usuario administrador:**
- Usuario: `adminusers`
- Contraseña: `adminusers123`
- Rol: `admin_manage_users`

**Header de autenticación:**
```
Authorization: Bearer {access_token}
```

---

## Endpoints

### 1. Login (Obtener Access Token)

**POST** `/auth/login`

Autentica al usuario y obtiene el token de acceso necesario para usar los demás endpoints.

**Request Body:**
```json
{
  "username": "adminusers",
  "password": "adminusers123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 3,
    "username": "adminusers",
    "role": "admin_manage_users"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "authType": "hybrid",
  "loginTime": "2025-11-07T...",
  "sessionExpiry": "2025-11-08T..."
}
```

**Notas:**
- El `accessToken` debe incluirse en el header `Authorization` como `Bearer {accessToken}`
- Los tokens expiran: accessToken en 15 minutos, refreshToken en 7 días

---

### 2. Listar Todos los Usuarios

**GET** `/auth/manage/users`

Obtiene la lista completa de usuarios con sus roles asignados.

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "users": [
    {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "created_at": "2025-11-07T10:30:00.000Z",
      "updated_at": "2025-11-07T10:30:00.000Z"
    },
    {
      "id": 2,
      "username": "viewer",
      "role": "viewer",
      "created_at": "2025-11-07T10:30:00.000Z",
      "updated_at": "2025-11-07T10:30:00.000Z"
    },
    {
      "id": 3,
      "username": "adminusers",
      "role": "admin_manage_users",
      "created_at": "2025-11-07T10:30:00.000Z",
      "updated_at": "2025-11-07T10:30:00.000Z"
    }
  ],
  "count": 3
}
```

**Errores posibles:**
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario sin permisos suficientes
- `500 Internal Server Error`: Error del servidor

---

### 3. Crear Nuevo Usuario

**POST** `/auth/manage/users`

Crea un nuevo usuario con el rol especificado.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "nuevouser",
  "password": "password123",
  "role": "admin"
}
```

**Campos:**
- `username` (string, requerido): Nombre de usuario único (3-50 caracteres)
- `password` (string, requerido): Contraseña (mínimo 6 caracteres)
- `role` (string, requerido): Rol del usuario. Valores permitidos: `"admin"`, `"viewer"`

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 4,
    "username": "nuevouser",
    "role": "admin"
  }
}
```

**Errores posibles:**
- `400 Bad Request`: Campos faltantes o rol inválido
  ```json
  {
    "success": false,
    "message": "Username, password, and role are required"
  }
  ```
  ```json
  {
    "success": false,
    "message": "Invalid role. Allowed roles: admin, viewer"
  }
  ```
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Usuario sin permisos suficientes
- `409 Conflict`: El nombre de usuario ya existe
  ```json
  {
    "success": false,
    "message": "Username already exists"
  }
  ```
- `500 Internal Server Error`: Error del servidor

---

### 4. Actualizar Rol de Usuario

**PUT** `/auth/manage/users/{userId}/role`

Actualiza el rol de un usuario existente.

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**URL Parameters:**
- `userId` (number): ID del usuario a actualizar

**Request Body:**
```json
{
  "role": "viewer"
}
```

**Campos:**
- `role` (string, requerido): Nuevo rol del usuario. Valores permitidos: `"admin"`, `"viewer"`

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": 4,
    "username": "nuevouser",
    "role": "viewer",
    "updated_at": "2025-11-07T11:45:00.000Z"
  }
}
```

**Errores posibles:**
- `400 Bad Request`: Campo role faltante o inválido
  ```json
  {
    "success": false,
    "message": "Role is required"
  }
  ```
  ```json
  {
    "success": false,
    "message": "Invalid role. Allowed roles: admin, viewer"
  }
  ```
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: No se puede cambiar el rol de `admin_manage_users`
  ```json
  {
    "success": false,
    "message": "Cannot change role of admin_manage_users user"
  }
  ```
- `404 Not Found`: Usuario no encontrado
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- `500 Internal Server Error`: Error del servidor

**Restricciones:**
- No se puede cambiar el rol del usuario `admin_manage_users`
- Solo se pueden asignar los roles `admin` o `viewer`

---

### 5. Eliminar Usuario

**DELETE** `/auth/manage/users/{userId}`

Elimina un usuario del sistema.

**Headers:**
```
Authorization: Bearer {access_token}
```

**URL Parameters:**
- `userId` (number): ID del usuario a eliminar

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUser": {
    "id": 4,
    "username": "nuevouser"
  }
}
```

**Errores posibles:**
- `400 Bad Request`: Intento de auto-eliminación
  ```json
  {
    "success": false,
    "message": "Cannot delete your own account"
  }
  ```
- `401 Unauthorized`: Token inválido o expirado
- `403 Forbidden`: Intento de eliminar usuario `admin_manage_users`
  ```json
  {
    "success": false,
    "message": "Cannot delete admin_manage_users user"
  }
  ```
- `404 Not Found`: Usuario no encontrado
  ```json
  {
    "success": false,
    "message": "User not found"
  }
  ```
- `500 Internal Server Error`: Error del servidor

**Restricciones:**
- No se puede eliminar el usuario `admin_manage_users`
- No se puede eliminar la propia cuenta

---

## Flujo de Trabajo Típico

### 1. Autenticación inicial:
```bash
POST /auth/login
Body: { "username": "adminusers", "password": "adminusers123" }
# Guardar el accessToken de la respuesta
```

### 2. Listar usuarios existentes:
```bash
GET /auth/manage/users
Header: Authorization: Bearer {accessToken}
```

### 3. Crear nuevo usuario:
```bash
POST /auth/manage/users
Header: Authorization: Bearer {accessToken}
Body: { "username": "carlos", "password": "carlos123", "role": "admin" }
```

### 4. Actualizar rol de usuario:
```bash
PUT /auth/manage/users/4/role
Header: Authorization: Bearer {accessToken}
Body: { "role": "viewer" }
```

### 5. Eliminar usuario:
```bash
DELETE /auth/manage/users/4
Header: Authorization: Bearer {accessToken}
```

---

## Roles Disponibles

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| `admin` | Administrador del inventario | Acceso completo a productos (CRUD), visualización de productos |
| `viewer` | Visualizador | Solo lectura de productos |
| `admin_manage_users` | Administrador de usuarios | Gestión completa de usuarios y roles (CRUD) |

**Nota:** El rol `admin_manage_users` es exclusivo para gestión de usuarios y NO tiene acceso a los endpoints de productos.

---

## Códigos de Error HTTP

- `200 OK`: Operación exitosa
- `201 Created`: Recurso creado exitosamente
- `400 Bad Request`: Datos inválidos en la petición
- `401 Unauthorized`: Autenticación requerida o token inválido
- `403 Forbidden`: Permisos insuficientes
- `404 Not Found`: Recurso no encontrado
- `409 Conflict`: Conflicto (ej: usuario ya existe)
- `423 Locked`: Cuenta bloqueada por intentos fallidos
- `500 Internal Server Error`: Error del servidor

---

## Seguridad

### Rate Limiting
- Máximo 5 intentos de login fallidos por usuario en 15 minutos
- Bloqueo automático de cuenta por 15 minutos tras exceder el límite
- Máximo 10 intentos de login fallidos por IP en 15 minutos

### Tokens JWT
- Access Token: Válido por 15 minutos
- Refresh Token: Válido por 7 días
- Algoritmo: HMAC-SHA256

### Contraseñas
- Mínimo 6 caracteres
- Máximo 128 caracteres
- Hasheadas con bcrypt (12 salt rounds = 4096 iteraciones)

---

## URL Base

Desarrollo: `http://localhost:3000`

Ejemplo completo de petición:
```bash
curl -X GET http://localhost:3000/auth/manage/users \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
