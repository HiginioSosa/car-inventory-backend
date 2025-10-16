# API Reference - Car Inventory Backend

**Versión:** 1.0.0
**Base URL:** `http://localhost:3000`
**Documentación Interactiva:** `http://localhost:3000/api-docs`

---

## Tabla de Contenidos

1. [Autenticación](#autenticación)
2. [Formato de Respuestas](#formato-de-respuestas)
3. [Manejo de Errores](#manejo-de-errores)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Auth](#auth)
   - [Cars](#cars)
   - [Catalogs](#catalogs)
6. [Paginación](#paginación)
7. [Upload de Archivos](#upload-de-archivos)

---

## Autenticación

La API utiliza **JWT (JSON Web Tokens)** para autenticación.

### Flujo de Autenticación

1. Registrar usuario o iniciar sesión
2. Recibir token JWT en la respuesta
3. Incluir token en el header `Authorization` para requests protegidos

### Header de Autenticación

```
Authorization: Bearer <tu_token_jwt>
```

### Ejemplo

```javascript
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

fetch('http://localhost:3000/api/cars', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Formato de Respuestas

### Respuestas Exitosas

```json
{
  "status": 200,
  "message": "Mensaje en inglés",
  "data": {
    // Datos de la respuesta
  }
}
```

### Respuestas con Paginación

```json
{
  "status": 200,
  "message": "Autos obtenidos exitosamente",
  "data": {
    "data": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "totalPages": 5
    }
  }
}
```

---

## Manejo de Errores

### Formato de Error

Todos los errores siguen este formato estándar:

```json
{
  "status": 4XX / 5XX,
  "name": "Nombre del Error HTTP",
  "message": "Descripción del error en inglés",
  "customMessage": "Descripción del error en español"
}
```

### Códigos de Estado HTTP

| Código | Nombre | Descripción |
|--------|--------|-------------|
| 200 | OK | Solicitud exitosa |
| 201 | Created | Recurso creado exitosamente |
| 400 | Bad Request | Datos de entrada inválidos |
| 401 | Unauthorized | No autenticado o token inválido |
| 403 | Forbidden | No tiene permisos para esta acción |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Conflicto (ej: email ya registrado) |
| 429 | Too Many Requests | Límite de rate limiting excedido |
| 500 | Internal Server Error | Error interno del servidor |

### Ejemplos de Errores

#### Error de Validación (400)

```json
{
  "status": 400,
  "name": "Validation Error",
  "message": "[{\"field\":\"email\",\"message\":\"Email inválido\"}]",
  "customMessage": "Errores de validación"
}
```

#### Error de Autenticación (401)

```json
{
  "status": 401,
  "name": "Unauthorized",
  "message": "Invalid token",
  "customMessage": "Token inválido"
}
```

#### Error de Recurso No Encontrado (404)

```json
{
  "status": 404,
  "name": "Not Found",
  "message": "Car not found",
  "customMessage": "Auto no encontrado"
}
```

#### Error de Rate Limiting (429)

```json
{
  "status": 429,
  "name": "Too Many Requests",
  "message": "Too many login attempts from this IP, please try again after 15 minutes",
  "customMessage": "Demasiados intentos de inicio de sesión, por favor intente más tarde en 15 minutos"
}
```

---

## Rate Limiting

La API implementa limitadores de tasa para prevenir abusos:

### Limitadores Activos

| Tipo | Límite | Ventana | Aplica a |
|------|--------|---------|----------|
| General | 100 requests | 15 minutos | Toda la API |
| Autenticación | 5 intentos | 15 minutos | `/api/auth/login`, `/api/auth/register` |
| Creación | 20 requests | 10 minutos | `POST /api/cars` |
| Upload | 10 uploads | 10 minutos | Rutas con upload de archivos |

### Headers de Rate Limit

```
RateLimit-Limit: 100
RateLimit-Remaining: 95
RateLimit-Reset: 1640000000
```

---

## Endpoints

### Auth

#### POST /api/auth/register

Registrar un nuevo usuario.

**Rate Limit:** 5 requests / 15 minutos

**Requisitos de Contraseña:**
- Mínimo 6 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número

**Request:**

```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "name": "Juan Pérez"
}
```

**Response (201):**

```json
{
  "status": 201,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**
- `400`: Datos de validación inválidos
- `409`: Email ya registrado

---

#### POST /api/auth/login

Iniciar sesión.

**Rate Limit:** 5 requests / 15 minutos

**Request:**

```json
{
  "email": "usuario@example.com",
  "password": "Password123"
}
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "usuario@example.com",
      "name": "Juan Pérez",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errores:**
- `400`: Datos de validación inválidos
- `401`: Credenciales inválidas o cuenta desactivada

---

#### GET /api/auth/profile

Obtener perfil del usuario autenticado.

**Auth:** Requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Perfil obtenido exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "usuario@example.com",
    "name": "Juan Pérez",
    "role": "user"
  }
}
```

**Errores:**
- `401`: No autenticado o token inválido

---

### Cars

#### GET /api/cars

Listar autos con filtros y paginación.

**Auth:** Requerida

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| marca | string | No | Filtrar por marca |
| modelo | string | No | Filtrar por modelo |
| anio | number | No | Filtrar por año exacto |
| minPrecio | number | No | Precio mínimo |
| maxPrecio | number | No | Precio máximo |
| color | string | No | Filtrar por color |
| page | number | No | Número de página (default: 1) |
| limit | number | No | Items por página (default: 10, max: 100) |
| sortBy | string | No | Campo de ordenamiento (precio, anio, kilometraje, fechaAlta) |
| sortOrder | string | No | Orden (asc, desc) (default: desc) |

**Ejemplo Request:**

```
GET /api/cars?marca=Ford&minPrecio=100000&maxPrecio=500000&page=1&limit=10
```

**Response (200):**

```json
{
  "status": 200,
  "message": "Autos obtenidos exitosamente",
  "data": {
    "data": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "marca": "Ford",
        "modelo": "Focus",
        "anio": 2020,
        "precio": 280000,
        "kilometraje": 20000,
        "color": "Negro",
        "email": "dueño@ejemplo.com",
        "telefono": "5599988877",
        "foto": "http://localhost:3000/uploads/focus-1234567890.jpg",
        "fechaAlta": "2025-01-15T10:30:00.000Z",
        "fechaModificacion": "2025-01-15T10:30:00.000Z",
        "fechaEliminacion": null,
        "isDeleted": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

#### GET /api/cars/:id

Obtener un auto por ID.

**Auth:** Requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Auto obtenido exitosamente",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "marca": "Ford",
    "modelo": "Focus",
    "anio": 2020,
    "precio": 280000,
    "kilometraje": 20000,
    "color": "Negro",
    "email": "dueño@ejemplo.com",
    "telefono": "5599988877",
    "foto": "http://localhost:3000/uploads/focus-1234567890.jpg",
    "fechaAlta": "2025-01-15T10:30:00.000Z",
    "fechaModificacion": "2025-01-15T10:30:00.000Z",
    "fechaEliminacion": null,
    "isDeleted": false
  }
}
```

**Errores:**
- `404`: Auto no encontrado

---

#### POST /api/cars

Crear un nuevo auto.

**Auth:** Requerida
**Rate Limit:** 20 requests / 10 minutos (creación) + 10 uploads / 10 minutos
**Content-Type:** `multipart/form-data`

**Form Data:**

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| marca | string | Sí | Marca del auto |
| modelo | string | Sí | Modelo del auto |
| anio | number | Sí | Año (1900 - año actual + 1) |
| precio | number | Sí | Precio entero positivo |
| kilometraje | number | Sí | Kilometraje > 100 |
| color | string | No | Color del auto |
| email | string | Sí | Email del dueño (válido) |
| telefono | string | Sí | Teléfono (10 dígitos) |
| foto | file | No | Imagen (JPG, PNG, WebP, max 5MB) |

**Ejemplo Request (JavaScript/Fetch):**

```javascript
const formData = new FormData();
formData.append('marca', 'Honda');
formData.append('modelo', 'Civic');
formData.append('anio', '2021');
formData.append('precio', '350000');
formData.append('kilometraje', '15000');
formData.append('color', 'Rojo');
formData.append('email', 'propietario@example.com');
formData.append('telefono', '5512345678');
formData.append('foto', fileInput.files[0]);

fetch('http://localhost:3000/api/cars', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

**Response (201):**

```json
{
  "status": 201,
  "message": "Auto creado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fechaAlta": "2025-01-15T10:30:00.000Z",
    "_id": "507f1f77bcf86cd799439011",
    "marca": "Honda",
    "modelo": "Civic",
    "anio": 2021,
    "precio": 350000,
    "kilometraje": 15000,
    "color": "Rojo",
    "email": "propietario@example.com",
    "telefono": "5512345678",
    "foto": "http://localhost:3000/uploads/civic-1234567890.jpg",
    "fechaModificacion": "2025-01-15T10:30:00.000Z",
    "isDeleted": false
  }
}
```

**Notas Importantes:**
- Si ocurre un error de validación después de subir una foto, la imagen se elimina automáticamente del servidor
- Si la creación del auto falla por cualquier motivo, la imagen también se limpia automáticamente

**Errores:**
- `400`: Datos de validación inválidos o archivo no válido
- `429`: Límite de rate limiting excedido

---

#### PUT /api/cars/:id

Actualizar un auto existente.

**Auth:** Requerida
**Rate Limit:** 10 uploads / 10 minutos (si incluye foto)
**Content-Type:** `multipart/form-data`

**Nota:** Si se proporciona una nueva foto, la foto anterior se eliminará automáticamente del servidor.

**Form Data:** Todos los campos son opcionales

**Response (200):**

```json
{
  "status": 200,
  "message": "Auto actualizado exitosamente",
  "data": {
    // Auto actualizado
  }
}
```

**Errores:**
- `404`: Auto no encontrado
- `400`: Datos de validación inválidos

---

#### DELETE /api/cars/:id

Eliminar un auto (soft delete).

**Auth:** Requerida

**Nota:** Este endpoint realiza un soft delete (marca el auto como eliminado sin borrarlo de la base de datos) y elimina la foto asociada del servidor si existe.

**Response (200):**

```json
{
  "status": 200,
  "message": "Auto eliminado exitosamente",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "fechaEliminacion": "2025-01-15T12:00:00.000Z"
  }
}
```

**Errores:**
- `404`: Auto no encontrado

---

#### GET /api/cars/stats

Obtener estadísticas de autos.

**Auth:** Requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "total": 100,
    "deleted": 10,
    "active": 90,
    "averagePrice": 275000,
    "averageKm": 25000
  }
}
```

---

#### GET /api/cars/search

Buscar autos por texto.

**Auth:** Requerida

**Query Parameters:**

| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| q | string | Sí | Término de búsqueda |

**Response (200):**

```json
{
  "status": 200,
  "message": "Búsqueda completada exitosamente",
  "data": [
    // Array de autos que coinciden
  ]
}
```

---

### Catalogs

#### GET /api/catalogs/brands

Obtener lista de marcas disponibles.

**Auth:** No requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Marcas obtenidas exitosamente",
  "data": {
    "marcas": ["Ford", "Honda", "Toyota", "Chevrolet", "Nissan"]
  }
}
```

---

#### GET /api/catalogs/models/:marca

Obtener modelos de una marca específica.

**Auth:** No requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Modelos obtenidos exitosamente",
  "data": {
    "marca": "Ford",
    "modelos": ["Focus", "Fusion", "Mustang", "Explorer", "F-150"]
  }
}
```

**Errores:**
- `404`: Marca no encontrada

---

#### GET /api/catalogs/years

Obtener lista de años disponibles.

**Auth:** No requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Años obtenidos exitosamente",
  "data": {
    "anios": [2026, 2025, 2024, 2023, ..., 1991, 1990]
  }
}
```

---

#### GET /api/catalogs

Obtener catálogo completo (marcas con sus modelos).

**Auth:** No requerida

**Response (200):**

```json
{
  "status": 200,
  "message": "Catálogo obtenido exitosamente",
  "data": {
    "catalogs": [
      {
        "_id": "...",
        "marca": "Ford",
        "modelos": [
          { "nombre": "Focus", "isActive": true },
          { "nombre": "Fusion", "isActive": true }
        ]
      }
    ]
  }
}
```

---

#### POST /api/catalogs/initialize

Inicializar catálogos con datos predeterminados.

**Auth:** Requerida

**Response (201):**

```json
{
  "status": 201,
  "message": "Catálogos inicializados exitosamente",
  "data": {
    "message": "Default catalogs have been initialized"
  }
}
```

---

## Paginación

Todos los endpoints que retornan listas soportan paginación mediante query parameters:

- `page`: Número de página (por defecto 1)
- `limit`: Cantidad de resultados por página (por defecto 10, máximo 100)

### Respuesta con Paginación

```json
{
  "data": [...],
  "pagination": {
    "page": 1,           // Página actual
    "limit": 10,         // Items por página
    "total": 50,         // Total de items
    "totalPages": 5      // Total de páginas
  }
}
```

---

## Upload de Archivos

### Especificaciones

- **Campo:** `foto`
- **Formato:** `multipart/form-data`
- **Tipos permitidos:** JPG, JPEG, PNG, WebP
- **Tamaño máximo:** 5 MB
- **Rate Limit:** 10 uploads / 10 minutos
- **Nombres de archivo:** Se generan aleatoriamente con timestamp para seguridad

### Validaciones de Seguridad

1. Validación de tipo MIME y extensión
2. Sanitización de nombres de archivo
3. Protección contra path traversal
4. Límite de tamaño de archivo
5. Limpieza automática de imágenes en caso de errores

### Limpieza Automática de Imágenes

El sistema elimina automáticamente las imágenes en los siguientes casos:
- Errores de validación después de subir la foto
- Fallos en la creación o actualización del auto
- Actualización de un auto con una nueva foto (elimina la anterior)
- Eliminación de un auto (soft delete)

### URL de Archivos

Las fotos se retornan con URL completa:

```
http://localhost:3000/uploads/nombre-archivo-1234567890.jpg
```

### Ejemplo de Upload

```javascript
const formData = new FormData();
formData.append('foto', fileInput.files[0]);
// ... otros campos

fetch('http://localhost:3000/api/cars', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

---

## Formato de Fechas

Todas las fechas están en formato **ISO 8601 UTC**:

```
2025-01-15T10:30:00.000Z
```

### Campos de Fecha en Cars

- `fechaAlta`: Fecha de creación (fecha del sistema)
- `fechaModificacion`: Fecha de última modificación (fecha del sistema)
- `fechaEliminacion`: Fecha de eliminación (null si no está eliminado)

---

## Health Check

### GET /health

Verificar estado del servidor.

**Auth:** No requerida

**Response (200):**

```json
{
  "status": "OK",
  "message": "Server is running",
  "environment": "development",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## Notas de Implementación para Frontend

### Manejo de Tokens

```javascript
// Guardar token después del login
localStorage.setItem('token', response.data.token);

// Incluir en todas las requests protegidas
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`
}

// Limpiar al cerrar sesión
localStorage.removeItem('token');
```

### Manejo de Errores

```javascript
try {
  const response = await fetch(url, options);
  const data = await response.json();

  if (!response.ok) {
    // Mostrar error al usuario
    console.error(data.customMessage); // Mensaje en español
    throw new Error(data.message);
  }

  return data;
} catch (error) {
  // Manejo de errores de red
  console.error('Error de conexión:', error);
}
```

### Interceptor de Rate Limiting

```javascript
if (response.status === 429) {
  const resetTime = response.headers.get('RateLimit-Reset');
  // Mostrar mensaje de espera al usuario
  alert('Has excedido el límite de solicitudes. Por favor espera.');
}
```

### Renovación de Token

Si recibes un error 401, redirige al usuario a la página de login:

```javascript
if (response.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

---

## Contacto y Soporte

- **Swagger UI:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health
