# Car Inventory Backend API

🚗 API REST moderna para gestión de inventario de autos construida con Node.js, Express, TypeScript y MongoDB.

## ✨ Características

- 🔒 **Autenticación JWT** - Sistema de autenticación seguro
- 📝 **TypeScript** - Tipado estático para mayor seguridad
- 🧪 **Testing** - Jest & Supertest configurados
- 📚 **Documentación API** - Swagger/OpenAPI integrado
- 🐳 **Docker** - Contenedores para desarrollo y producción
- 🎨 **Code Quality** - ESLint + Prettier configurados
- 📊 **MongoDB** - Base de datos NoSQL con Mongoose
- 🔍 **Logging** - Morgan para requests HTTP
- 🛡️ **Seguridad** - Helmet, CORS, y mejores prácticas

## 🚀 Tecnologías

- **Runtime:** Node.js >= 18.0.0
- **Framework:** Express.js
- **Lenguaje:** TypeScript
- **Base de datos:** MongoDB con Mongoose
- **Autenticación:** JWT (jsonwebtoken)
- **Testing:** Jest + Supertest
- **Documentación:** Swagger + JSDoc
- **Validación:** Zod
- **File Upload:** Multer
- **Seguridad:** Helmet + CORS
- **Logging:** Morgan
- **Containerización:** Docker + Docker Compose

## 📋 Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB >= 5.0 (o Docker)
- Git

## 🔧 Instalación

### Opción 1: Instalación Local

```bash
# Clonar el repositorio
git clone <repository-url>
cd car-inventory-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Poblar base de datos con datos iniciales
npm run seed

# Ejecutar en modo desarrollo
npm run dev
```

### Opción 2: Con Docker (Recomendado)

```bash
# Levantar MongoDB y Backend (con auto-seed)
docker-compose up --build

# En segundo plano
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f backend

# Detener servicios
docker-compose down

# Reiniciar desde cero (elimina datos)
docker-compose down -v
docker-compose up --build
```

**Características Docker:**
- ✅ MongoDB con credenciales configuradas
- ✅ Backend con auto-compilación TypeScript
- ✅ Ejecuta automáticamente `npm run seed` para inicializar datos
- ✅ Volumen persistente para uploads
- ✅ Credenciales por defecto:
  - **Admin**: admin@carinventory.com / Admin123
  - **MongoDB**: admin / admin123

## 📝 Scripts Disponibles

### Desarrollo
```bash
npm run dev          # Ejecutar con nodemon (auto-reload)
```

### Producción
```bash
npm run build        # Compilar TypeScript
npm start            # Ejecutar aplicación compilada
npm run start:prod   # Ejecutar en modo producción
```

### Testing
```bash
npm test             # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:coverage # Tests con cobertura
npm run test:ci      # Tests para CI/CD
```

### Calidad de Código
```bash
npm run lint         # Verificar código con ESLint
npm run lint:fix     # Arreglar problemas automáticamente
npm run format       # Formatear código con Prettier
npm run format:check # Verificar formato
npm run typecheck    # Verificar tipos de TypeScript
```

### Utilidades
```bash
npm run clean        # Limpiar carpeta dist
npm run seed         # Poblar base de datos con datos iniciales
```

## 🌱 Inicialización de Base de Datos

### Script Seed (Desarrollo)

Ejecuta el script seed para crear usuarios de prueba y catálogos iniciales:

```bash
npm run seed
```

**Crea:**
- 👤 Usuario Admin: \`admin@carinventory.com\` / \`Admin123\`
- 👤 Usuario Test: \`user@carinventory.com\` / \`User123\`
- 📋 Catálogos de marcas y modelos

**Cuándo usar:**
- Primera instalación del proyecto
- Después de resetear la base de datos
- Para testing local

### Endpoint Initialize (Producción)

Alternativamente, inicializa solo los catálogos vía API:

```bash
POST /api/catalogs/initialize
Authorization: Bearer <tu-token>
```

**Diferencias:**
- 🔧 **Seed Script**: Ejecuta desde terminal, crea usuarios + catálogos
- 🔌 **API Endpoint**: Ejecuta vía HTTP, solo catálogos, requiere autenticación

## 🌐 Endpoints

### 📄 Documentación
- **Swagger UI:** `http://localhost:3000/api-docs`

### 🏥 Health Check
- `GET /health` - Verificar estado del servidor
- `GET /` - Información de la API

### 🔐 Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token

### 🚗 Autos (Requiere autenticación)
- `GET /api/cars` - Listar todos los autos
- `GET /api/cars/:id` - Obtener auto por ID
- `POST /api/cars` - Crear nuevo auto
- `PUT /api/cars/:id` - Actualizar auto
- `DELETE /api/cars/:id` - Eliminar auto

## 📁 Estructura del Proyecto

```
car-inventory-backend/
├── src/
│   ├── __tests__/           # Tests
│   │   ├── integration/     # Tests de integración
│   │   ├── unit/            # Tests unitarios
│   │   └── setup.ts         # Configuración de tests
│   ├── config/              # Configuraciones
│   │   ├── database.ts      # Conexión MongoDB
│   │   ├── env.ts           # Variables de entorno
│   │   └── swagger.ts       # Configuración Swagger
│   ├── controllers/         # Controladores
│   ├── middlewares/         # Middlewares personalizados
│   ├── models/              # Modelos de MongoDB (Mongoose)
│   ├── routes/              # Definición de rutas
│   ├── services/            # Lógica de negocio
│   ├── types/               # Tipos de TypeScript
│   ├── utils/               # Utilidades
│   │   ├── logger.ts        # Logger personalizado
│   │   └── responseHandler.ts # Manejador de respuestas
│   ├── uploads/             # Archivos subidos
│   └── server.ts            # Punto de entrada
├── docker/
│   └── mongo-init/          # Scripts de inicialización MongoDB
│       └── init.sh
├── dist/                    # Código compilado
├── coverage/                # Reportes de cobertura
├── .env.example             # Variables de entorno ejemplo
├── .env.docker              # Variables para Docker
├── .dockerignore            # Archivos ignorados por Docker
├── .gitignore               # Archivos ignorados por Git
├── .prettierrc              # Configuración Prettier
├── docker-compose.yml       # Docker Compose (solo MongoDB)
├── docker-compose.dev.yml   # Docker Compose (desarrollo completo)
├── Dockerfile               # Dockerfile producción (multi-stage)
├── Dockerfile.dev           # Dockerfile desarrollo
├── eslint.config.js         # Configuración ESLint
├── jest.config.js           # Configuración Jest
├── nodemon.json             # Configuración Nodemon
├── package.json             # Dependencias y scripts
├── tsconfig.json            # Configuración TypeScript
└── README.md                # Este archivo
```

## 🔒 Variables de Entorno

Crea un archivo \`.env\` basado en \`.env.example\`:

```env
# Entorno
NODE_ENV=development

# Servidor
PORT=3000
HOST=localhost

# Base de datos
MONGODB_URI=mongodb://localhost:27017/car_inventory
# Para Docker: mongodb://admin:admin123@localhost:27017/car_inventory?authSource=admin

# JWT
JWT_SECRET=tu_clave_secreta_super_segura
JWT_EXPIRES_IN=24h

# Uploads
UPLOAD_PATH=./src/uploads
MAX_FILE_SIZE=5242880

# CORS
CORS_ORIGIN=http://localhost:4200

# Logs
LOG_LEVEL=debug
```

## 🐳 Docker

### Inicio Rápido con Docker

```bash
# Levantar todo el sistema (MongoDB + Backend + Auto-seed)
docker-compose up --build

# En segundo plano
docker-compose up -d --build

# Ver logs en tiempo real
docker-compose logs -f backend

# Ver logs de MongoDB
docker-compose logs -f mongodb

# Detener servicios
docker-compose down

# Reiniciar desde cero (elimina datos y volúmenes)
docker-compose down -v
docker-compose up --build
```

### ✨ Características Docker

- 🐘 **MongoDB 7.0**: Base de datos configurada con autenticación
- 🚀 **Backend**: Compilación automática de TypeScript
- 🌱 **Auto-seed**: Inicializa datos automáticamente al iniciar
- 💾 **Volúmenes persistentes**: Los uploads se guardan en tu sistema local
- 🔒 **Credenciales configuradas**: Listo para usar sin configuración adicional

### 🔑 Credenciales por Defecto

**Usuario Administrador (creado con seed):**
- Email: `admin@carinventory.com`
- Password: `Admin123`

**MongoDB:**
- Usuario: `admin`
- Password: `admin123`
- URI: `mongodb://admin:admin123@localhost:27017/car-inventory?authSource=admin`

### 📍 URLs de Acceso

Una vez levantados los servicios:

- **API REST**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **MongoDB**: mongodb://localhost:27017

### 🛠️ Comandos Útiles Docker

```bash
# Ver estado de los contenedores
docker-compose ps

# Ejecutar comandos dentro del contenedor
docker-compose exec backend sh

# Reiniciar solo un servicio
docker-compose restart backend

# Reconstruir imágenes sin caché
docker-compose build --no-cache

# Ver todos los logs
docker-compose logs

# Seguir logs de un servicio específico
docker-compose logs -f backend

# Limpiar todo (contenedores, volúmenes, imágenes)
docker-compose down -v
docker system prune -a
```

### 🔄 Reiniciar Base de Datos

```bash
# Detener y eliminar volúmenes (borra todos los datos)
docker-compose down -v

# Levantar nuevamente (ejecutará seed automáticamente)
docker-compose up --build
```

### 🐛 Troubleshooting Docker

**Error de conexión a MongoDB:**
```bash
# Verificar que MongoDB esté corriendo
docker-compose ps

# Ver logs de MongoDB
docker-compose logs mongodb

# Esperar 5-10 segundos después de iniciar MongoDB
```

**Puerto ya en uso:**
```bash
# Verificar qué está usando el puerto 3000 o 27017
netstat -ano | findstr :3000
netstat -ano | findstr :27017

# Cambiar puertos en docker-compose.yml si es necesario
```

**Reconstruir después de cambios:**
```bash
# Si modificas el código fuente, reconstruye la imagen
docker-compose up --build
```

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch
npm run test:watch

# Tests específicos
npm test -- health.test.ts
```

### Estructura de Tests

- **Unit Tests:** Tests de funciones y utilidades individuales
- **Integration Tests:** Tests de endpoints y flujos completos
- **Coverage:** Reportes en `coverage/` carpeta

## 📚 Documentación

### Swagger/OpenAPI

Accede a la documentación interactiva en:
- **URL:** `http://localhost:3000/api-docs`
- **Formato:** OpenAPI 3.0

### JSDoc

El código incluye documentación JSDoc completa:

```typescript
/**
 * Envía una respuesta exitosa estandarizada
 * @param {Response} res - Objeto de respuesta de Express
 * @param {number} statusCode - Código de estado HTTP
 * @param {string} message - Mensaje de éxito
 * @returns {Response} Respuesta de Express
 */
```

## 🛡️ Seguridad

- ✅ Helmet para headers HTTP seguros
- ✅ CORS configurado
- ✅ JWT para autenticación
- ✅ Validación de datos con Zod
- ✅ Rate limiting (pendiente)
- ✅ Input sanitization
- ✅ Usuario no-root en Docker

## 🔍 Logging

- **Morgan:** Logs de requests HTTP
- **Custom Logger:** Logger con emojis para desarrollo
  - `logger.info()` - Información general
  - `logger.error()` - Errores
  - `logger.warn()` - Advertencias
  - `logger.success()` - Operaciones exitosas
  - `logger.debug()` - Debugging (solo desarrollo)

## 🚀 Despliegue

### Preparación

```bash
# Compilar TypeScript
npm run build

# Verificar build
npm start
```

### Con Docker

```bash
# Build imagen de producción
docker build -t car-inventory-api:latest .

# Ejecutar
docker run -d \\
  -p 3000:3000 \\
  --env-file .env.docker \\
  --name car-inventory-api \\
  car-inventory-api:latest
```

## 📄 Licencia

Este proyecto es para una prueba tecnica.

## 👥 Autor

José Higinio Sosa Vázquez
- GitHub: [HiginioSosa](https://github.com/HiginioSosa)
