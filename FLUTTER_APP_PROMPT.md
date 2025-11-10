# 📱 Prompt para GitHub Copilot - App Flutter de Gestión de Usuarios

---

## 🎯 Contexto del Proyecto

Necesito crear una aplicación móvil en Flutter para gestionar usuarios y roles de un sistema de inventario backend. La app se conectará a una API REST Node.js/Express que ya está implementada.

**Objetivo:** Crear una app Flutter que permita a un administrador de usuarios (con rol `admin_manage_users`) gestionar usuarios del sistema: crear, listar, actualizar roles y eliminar usuarios.

---

## 🔐 Información de Autenticación

### Usuario Administrador (Único)
```
Usuario: adminusers
Contraseña: adminusers123
Rol: admin_manage_users
```

### Sistema de Autenticación
- **Tipo:** JWT (JSON Web Tokens)
- **Header de autenticación:** `Authorization: Bearer {accessToken}`
- **Duración del token:** 
  - Access Token: 15 minutos
  - Refresh Token: 7 días

---

## 🌐 API Endpoints

**Base URL (Desarrollo):** `http://localhost:3000`  
**Base URL (Producción):** `[TU_URL_SERVIDOR]`

### 1. Login (Autenticación)
```
POST /auth/login
Content-Type: application/json

Request Body:
{
  "username": "adminusers",
  "password": "adminusers123"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 3,
    "username": "adminusers",
    "role": "admin_manage_users"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  },
  "authType": "hybrid",
  "loginTime": "2025-11-07T...",
  "sessionExpiry": "2025-11-08T..."
}

Errores:
- 400: Credenciales faltantes
- 401: Credenciales inválidas
- 423: Cuenta bloqueada (5 intentos fallidos)
```

### 2. Listar Usuarios
```
GET /auth/manage/users
Authorization: Bearer {accessToken}

Response (200 OK):
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
    }
  ],
  "count": 2
}

Errores:
- 401: Token inválido o expirado
- 403: Permisos insuficientes
```

### 3. Crear Usuario
```
POST /auth/manage/users
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "username": "carlos",
  "password": "carlos123",
  "role": "admin"
}

Campos:
- username (string, requerido): 3-50 caracteres, único
- password (string, requerido): mínimo 6 caracteres
- role (string, requerido): "admin" o "viewer"

Response (201 Created):
{
  "success": true,
  "message": "User created successfully",
  "user": {
    "id": 4,
    "username": "carlos",
    "role": "admin"
  }
}

Errores:
- 400: Datos inválidos o rol no permitido
- 401: Token inválido
- 403: Permisos insuficientes
- 409: Usuario ya existe
```

### 4. Actualizar Rol de Usuario
```
PUT /auth/manage/users/{userId}/role
Authorization: Bearer {accessToken}
Content-Type: application/json

Request Body:
{
  "role": "viewer"
}

Response (200 OK):
{
  "success": true,
  "message": "User role updated successfully",
  "user": {
    "id": 4,
    "username": "carlos",
    "role": "viewer",
    "updated_at": "2025-11-07T11:45:00.000Z"
  }
}

Errores:
- 400: Rol inválido
- 401: Token inválido
- 403: No se puede cambiar rol de admin_manage_users
- 404: Usuario no encontrado
```

### 5. Eliminar Usuario
```
DELETE /auth/manage/users/{userId}
Authorization: Bearer {accessToken}

Response (200 OK):
{
  "success": true,
  "message": "User deleted successfully",
  "deletedUser": {
    "id": 4,
    "username": "carlos"
  }
}

Errores:
- 400: Intento de auto-eliminación
- 401: Token inválido
- 403: No se puede eliminar admin_manage_users
- 404: Usuario no encontrado
```

---

## 🎨 Requerimientos de la App Flutter

### Funcionalidades Principales

#### ⚠️ RESTRICCIONES IMPORTANTES - ROL admin_manage_users

**El usuario con rol `admin_manage_users` es ÚNICO y PROTEGIDO:**

1. **NO SE DEBE MOSTRAR botones de editar/eliminar** para usuarios con rol `admin_manage_users`
2. **SOLO se pueden crear usuarios** con roles: `admin` o `viewer`
3. **SOLO se pueden modificar roles** a: `admin` o `viewer`
4. **NO se puede crear** un nuevo usuario con rol `admin_manage_users`
5. **NO se puede eliminar** el usuario con rol `admin_manage_users`
6. **NO se puede cambiar el rol** del usuario con rol `admin_manage_users`

**Implementación en UI:**
- En la lista de usuarios, si `user.role === 'admin_manage_users'`:
  - Mostrar badge morado con el rol
  - **OCULTAR** el botón de editar (icono de lápiz)
  - **OCULTAR** el botón de eliminar (icono de basura)
  - Opcionalmente mostrar un icono de candado 🔒
- En el dropdown de roles (crear/editar):
  - **SOLO** incluir opciones: "admin" y "viewer"
  - **NO** incluir opción "admin_manage_users"

---

#### 1. Pantalla de Login
- [ ] Input para username
- [ ] Input para password (oculto)
- [ ] Botón "Iniciar Sesión"
- [ ] Validación de campos vacíos
- [ ] Manejo de errores (credenciales incorrectas, cuenta bloqueada)
- [ ] Mostrar loading durante autenticación
- [ ] Guardar token de forma segura (flutter_secure_storage)
- [ ] Navegación automática a Home al autenticar exitosamente

#### 2. Pantalla Principal (Lista de Usuarios)
- [ ] AppBar con título "Gestión de Usuarios"
- [ ] Botón logout en AppBar
- [ ] Lista (ListView) de usuarios con:
  - Nombre de usuario
  - Rol (con badge de color según rol)
  - Fecha de creación
  - **Icono de editar (SOLO si rol != 'admin_manage_users')**
  - **Icono de eliminar (SOLO si rol != 'admin_manage_users')**
- [ ] FloatingActionButton "+" para crear nuevo usuario
- [ ] Pull-to-refresh para recargar lista
- [ ] Indicador de loading al cargar
- [ ] Manejo de lista vacía
- [ ] Manejo de errores de red

#### 3. Pantalla/Modal Crear Usuario
#### 3. Pantalla/Modal Crear Usuario
- [ ] Input para username (validación 3-50 caracteres)
- [ ] Input para password (validación mínimo 6 caracteres)
- [ ] **Dropdown/Selector para rol (SOLO opciones: "admin" y "viewer")**
- [ ] Botón "Crear Usuario"
- [ ] Botón "Cancelar"
- [ ] Validación de campos en tiempo real
- [ ] Manejo de errores (usuario ya existe, validaciones)
- [ ] Mostrar loading durante creación
- [ ] Actualizar lista al crear exitosamente
- [ ] Mostrar mensaje de éxito

#### 4. Pantalla/Modal Editar Rol
- [ ] Mostrar nombre de usuario (no editable)
- [ ] Mostrar rol actual
- [ ] **Dropdown/Selector para nuevo rol (SOLO opciones: "admin" y "viewer")**
- [ ] Botón "Actualizar Rol"
- [ ] Botón "Cancelar"
- [ ] Confirmación antes de actualizar
- [ ] Manejo de errores
- [ ] Mostrar loading durante actualización
- [ ] Actualizar lista al cambiar rol exitosamente
- [ ] Mostrar mensaje de éxito

#### 5. Funcionalidad Eliminar Usuario
- [ ] Dialog de confirmación con mensaje claro
- [ ] Botones "Sí, eliminar" y "Cancelar"
- [ ] Manejo de errores (no se puede eliminar admin_manage_users)
- [ ] Mostrar loading durante eliminación
- [ ] Actualizar lista al eliminar exitosamente
- [ ] Mostrar mensaje de éxito

### Características de Seguridad y UX

#### Gestión de Tokens
- [ ] Guardar access token de forma segura (flutter_secure_storage)
- [ ] Incluir token en header de todas las peticiones autenticadas
- [ ] Detectar token expirado (401) y redirigir a login
- [ ] Limpiar tokens al hacer logout

#### Manejo de Errores
- [ ] Mostrar mensajes de error amigables en SnackBar o Dialog
- [ ] Diferenciar errores de red vs errores del servidor
- [ ] Timeout de peticiones (30 segundos)
- [ ] Reintentos automáticos en errores de red

#### Validaciones
- [ ] Username: 3-50 caracteres, alfanumérico
- [ ] Password: mínimo 6 caracteres
- [ ] Rol: solo "admin" o "viewer"
- [ ] Prevenir envío de formularios con campos vacíos

#### UX Mejorado
- [ ] Indicadores de loading (CircularProgressIndicator)
- [ ] Animaciones suaves entre pantallas
- [ ] Feedback visual en botones (ripple effect)
- [ ] Confirmaciones antes de acciones destructivas
- [ ] Mensajes de éxito y error claros
- [ ] Colores distintivos para roles (badges)

---

## 📦 Dependencias de Flutter Recomendadas

```yaml
dependencies:
  flutter:
    sdk: flutter
  
  # HTTP Client
  http: ^1.1.0
  
  # State Management
  provider: ^6.1.1
  
  # Secure Storage
  flutter_secure_storage: ^9.0.0
  
  # UI Components
  flutter_spinkit: ^5.2.0
  
  # Utilities
  intl: ^0.18.1
```

---

## 🏗️ Arquitectura Recomendada

### Estructura de Carpetas
```
lib/
├── main.dart
├── models/
│   ├── user.dart
│   ├── auth_response.dart
│   └── api_response.dart
├── services/
│   ├── api_service.dart
│   ├── auth_service.dart
│   └── storage_service.dart
├── providers/
│   ├── auth_provider.dart
│   └── users_provider.dart
├── screens/
│   ├── login_screen.dart
│   ├── home_screen.dart
│   ├── create_user_screen.dart
│   └── edit_user_screen.dart
├── widgets/
│   ├── user_card.dart
│   ├── role_badge.dart
│   └── loading_indicator.dart
└── utils/
    ├── constants.dart
    └── validators.dart
```

### Modelos de Datos

#### User Model
```dart
class User {
  final int id;
  final String username;
  final String role;
  final DateTime createdAt;
  final DateTime updatedAt;

  User({
    required this.id,
    required this.username,
    required this.role,
    required this.createdAt,
    required this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      username: json['username'],
      role: json['role'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
}
```

#### AuthResponse Model
```dart
class AuthResponse {
  final bool success;
  final String message;
  final UserInfo? user;
  final Tokens? tokens;

  AuthResponse({
    required this.success,
    required this.message,
    this.user,
    this.tokens,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      success: json['success'],
      message: json['message'],
      user: json['user'] != null ? UserInfo.fromJson(json['user']) : null,
      tokens: json['tokens'] != null ? Tokens.fromJson(json['tokens']) : null,
    );
  }
}

class UserInfo {
  final int id;
  final String username;
  final String role;

  UserInfo({required this.id, required this.username, required this.role});

  factory UserInfo.fromJson(Map<String, dynamic> json) {
    return UserInfo(
      id: json['id'],
      username: json['username'],
      role: json['role'],
    );
  }
}

class Tokens {
  final String accessToken;
  final String refreshToken;

  Tokens({required this.accessToken, required this.refreshToken});

  factory Tokens.fromJson(Map<String, dynamic> json) {
    return Tokens(
      accessToken: json['accessToken'],
      refreshToken: json['refreshToken'],
    );
  }
}
```

### API Service (Ejemplo)

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  static const String baseUrl = 'http://localhost:3000'; // Cambiar en producción
  
  // Login
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'password': password,
      }),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message']);
    }
  }
  
  // Get Users
  Future<Map<String, dynamic>> getUsers(String token) async {
    final response = await http.get(
      Uri.parse('$baseUrl/auth/manage/users'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else if (response.statusCode == 401) {
      throw Exception('Token expirado');
    } else {
      throw Exception(jsonDecode(response.body)['message']);
    }
  }
  
  // Create User
  Future<Map<String, dynamic>> createUser(
    String token, 
    String username, 
    String password, 
    String role
  ) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/manage/users'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({
        'username': username,
        'password': password,
        'role': role,
      }),
    );
    
    if (response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message']);
    }
  }
  
  // Update User Role
  Future<Map<String, dynamic>> updateUserRole(
    String token, 
    int userId, 
    String role
  ) async {
    final response = await http.put(
      Uri.parse('$baseUrl/auth/manage/users/$userId/role'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
      body: jsonEncode({'role': role}),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message']);
    }
  }
  
  // Delete User
  Future<Map<String, dynamic>> deleteUser(String token, int userId) async {
    final response = await http.delete(
      Uri.parse('$baseUrl/auth/manage/users/$userId'),
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message']);
    }
  }
}
```

---

## 🎨 Diseño UI Sugerido

### Colores de Roles
- **admin**: Color azul (#2196F3) - Administrador del inventario
- **viewer**: Color verde (#4CAF50) - Solo lectura
- **admin_manage_users**: Color morado (#9C27B0) - Gestión de usuarios (no editable)

### Pantalla de Login
```
┌─────────────────────────────────┐
│     [Logo o Icono]              │
│   Gestión de Usuarios           │
│                                 │
│   ┌─────────────────────────┐  │
│   │ Usuario              📧 │  │
│   └─────────────────────────┘  │
│                                 │
│   ┌─────────────────────────┐  │
│   │ Contraseña           🔒 │  │
│   └─────────────────────────┘  │
│                                 │
│   ┌─────────────────────────┐  │
│   │    INICIAR SESIÓN       │  │
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

### Pantalla Principal
```
┌─────────────────────────────────┐
│ ← Gestión de Usuarios     🚪   │  <- AppBar con logout
├─────────────────────────────────┤
│  Pull to refresh...             │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 👤 admin                  │ │
│  │ [ADMIN] 📅 Nov 7, 2025    │ │
│  │                    ✏️ 🗑️ │ │  <- Botones de editar/eliminar
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 👤 viewer                 │ │
│  │ [VIEWER] 📅 Nov 7, 2025   │ │
│  │                    ✏️ 🗑️ │ │  <- Botones de editar/eliminar
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │ 👤 adminusers       🔒    │ │  <- Icono de candado (sin botones)
│  │ [ADMIN_MANAGE_USERS]      │ │  <- Usuario PROTEGIDO
│  │ 📅 Nov 7, 2025            │ │
│  └───────────────────────────┘ │
│                                 │
│                          [+]    │  <- FloatingActionButton
└─────────────────────────────────┘
```
**IMPORTANTE:** El usuario con rol `admin_manage_users` muestra un icono de candado 🔒 y NO tiene botones de editar/eliminar.

### Modal Crear Usuario
```
┌─────────────────────────────────┐
│  Crear Nuevo Usuario        ✕  │
├─────────────────────────────────┤
│                                 │
│  Usuario *                      │
│  ┌─────────────────────────┐   │
│  │ carlos                  │   │
│  └─────────────────────────┘   │
│                                 │
│  Contraseña *                   │
│  ┌─────────────────────────┐   │
│  │ ••••••••                │   │
│  └─────────────────────────┘   │
│                                 │
│  Rol *                          │
│  ┌─────────────────────────┐   │
│  │ Admin            ▼      │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌────────┐  ┌──────────────┐  │
│  │Cancelar│  │ Crear Usuario│  │
│  └────────┘  └──────────────┘  │
│                                 │
└─────────────────────────────────┘
```

---

## ✅ Checklist de Implementación

### Setup Inicial
- [ ] Crear nuevo proyecto Flutter
- [ ] Agregar dependencias en pubspec.yaml
- [ ] Configurar permisos de internet (Android/iOS)
- [ ] Crear estructura de carpetas

### Servicios Base
- [ ] Implementar ApiService con todos los endpoints
- [ ] Implementar StorageService para tokens
- [ ] Implementar AuthService para gestión de autenticación

### Modelos
- [ ] Crear modelo User
- [ ] Crear modelo AuthResponse
- [ ] Crear modelo ApiResponse genérico

### Providers (State Management)
- [ ] Crear AuthProvider (login, logout, estado de autenticación)
- [ ] Crear UsersProvider (CRUD de usuarios)

### Pantallas
- [ ] Implementar LoginScreen
- [ ] Implementar HomeScreen (lista de usuarios)
- [ ] Implementar CreateUserScreen/Modal
- [ ] Implementar EditUserRoleScreen/Modal

### Widgets Reutilizables
- [ ] Crear UserCard widget
- [ ] Crear RoleBadge widget
- [ ] Crear LoadingIndicator widget
- [ ] Crear CustomTextField widget

### Validaciones y Utilidades
- [ ] Implementar validadores (username, password, role)
- [ ] Crear constantes (URLs, colores, strings)
- [ ] Implementar manejo de errores centralizado

### Testing
- [ ] Probar login con credenciales correctas
- [ ] Probar login con credenciales incorrectas
- [ ] Probar lista de usuarios
- [ ] Probar crear usuario (casos válidos e inválidos)
- [ ] Probar actualizar rol
- [ ] Probar eliminar usuario
- [ ] Probar manejo de token expirado

---

## 🚀 Instrucciones para Ejecutar

### Backend (Ya implementado)
```bash
cd inventario_server
npm install
npm run init-db  # Esto creará el usuario adminusers
npm start        # Servidor en http://localhost:3000
```

### Flutter App (A crear)
```bash
flutter create user_management_app
cd user_management_app
# Agregar dependencias en pubspec.yaml
flutter pub get
flutter run
```

### Configuración Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

### Configuración iOS (ios/Runner/Info.plist)
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

---

## 📝 Notas Importantes

1. **URL del servidor**: Cambiar `http://localhost:3000` por la URL real del servidor en producción
2. **Tokens**: El accessToken expira en 15 minutos, implementar refresh o re-login
3. **Roles protegidos**: No permitir editar/eliminar usuarios con rol `admin_manage_users`
4. **Validaciones**: Implementar las mismas validaciones del backend en el frontend
5. **Errores de red**: Manejar timeout y pérdida de conexión
6. **Persistencia**: Guardar token de forma segura usando flutter_secure_storage

---

## 🎯 Prompt Final para GitHub Copilot

**Copia y pega esto en el chat de GitHub Copilot:**

```
Crea una aplicación Flutter completa para gestión de usuarios que se conecte a una API REST. 

Requisitos:
1. Pantalla de login para autenticar con username: "adminusers" y password: "adminusers123"
2. Lista de usuarios mostrando nombre, rol (con badge de colores) y botones de editar/eliminar
3. Pantalla/modal para crear nuevos usuarios con campos: username (3-50 chars), password (min 6 chars), rol (dropdown con SOLO 2 opciones: "admin" y "viewer")
4. Pantalla/modal para editar solo el rol de un usuario (dropdown con SOLO 2 opciones: "admin" y "viewer")
5. Confirmación antes de eliminar usuarios
6. Usar flutter_secure_storage para guardar el token JWT
7. Incluir manejo de errores y loading states
8. Pull-to-refresh en la lista de usuarios

⚠️ RESTRICCIONES CRÍTICAS - Usuario Protegido:
- Existe UN SOLO usuario con rol "admin_manage_users" que NO debe ser editable ni eliminable
- En la lista: SI user.role == "admin_manage_users" -> OCULTAR botones de editar y eliminar
- En crear/editar: Dropdown de roles debe tener SOLO 2 opciones: "admin" y "viewer" (NO incluir "admin_manage_users")
- El rol "admin_manage_users" solo debe mostrarse en la lista con badge morado, pero sin acciones disponibles

API Endpoints (Base URL: http://localhost:3000):
- POST /auth/login (body: {username, password}) -> retorna {tokens: {accessToken, refreshToken}, user}
- GET /auth/manage/users (header: Authorization: Bearer {token}) -> retorna {users: [...]}
- POST /auth/manage/users (header: token, body: {username, password, role}) -> crea usuario (role solo puede ser "admin" o "viewer")
- PUT /auth/manage/users/{userId}/role (header: token, body: {role}) -> actualiza rol (role solo puede ser "admin" o "viewer")
- DELETE /auth/manage/users/{userId} (header: token) -> elimina usuario (retorna 403 si es admin_manage_users)

Arquitectura:
- Usar Provider para state management
- Separar en models/, services/, providers/, screens/, widgets/
- ApiService para todas las peticiones HTTP
- StorageService para manejar tokens con flutter_secure_storage

Colores para roles:
- admin: azul #2196F3
- viewer: verde #4CAF50
- admin_manage_users: morado #9C27B0 (solo mostrar badge, sin botones de acción)

Lógica de UserCard widget:
```dart
// En el widget de cada usuario en la lista
Widget UserCard(User user) {
  final bool isProtectedUser = user.role == 'admin_manage_users';
  
  return Card(
    child: ListTile(
      title: Text(user.username),
      subtitle: RoleBadge(user.role),
      trailing: isProtectedUser 
        ? Icon(Icons.lock, color: Colors.grey) // Solo icono de candado
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: Icon(Icons.edit),
                onPressed: () => editUser(user),
              ),
              IconButton(
                icon: Icon(Icons.delete),
                onPressed: () => deleteUser(user),
              ),
            ],
          ),
    ),
  );
}

// Dropdown de roles (crear y editar)
DropdownButton<String>(
  items: [
    DropdownMenuItem(value: 'admin', child: Text('Admin')),
    DropdownMenuItem(value: 'viewer', child: Text('Viewer')),
    // NO incluir admin_manage_users
  ],
  onChanged: (value) => setState(() => selectedRole = value),
)
```

Incluye validaciones, manejo de errores 401 (token expirado), mensajes de éxito/error con SnackBar, y diseño Material con animaciones suaves.
```

---

¿Necesitas alguna aclaración o modificación? 🚀
