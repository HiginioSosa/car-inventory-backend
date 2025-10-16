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
# Solo MongoDB
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

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

### MongoDB con Mongo Express

```bash
# Iniciar MongoDB y Mongo Express
docker-compose up -d

# Acceder a Mongo Express
# URL: http://localhost:8081
# Usuario: admin
# Password: admin123
```

### Aplicación Completa con Docker

```bash
# Desarrollo (con hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Producción (build optimizado)
docker build -t car-inventory-api .
docker run -p 3000:3000 --env-file .env.docker car-inventory-api
```

### Comandos Útiles Docker

```bash
# Ver logs
docker-compose logs -f app

# Ejecutar comandos en el contenedor
docker-compose exec app npm test

# Reconstruir imágenes
docker-compose build --no-cache

# Limpiar volúmenes
docker-compose down -v
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

### Plataformas Recomendadas

- **Railway:** Deploy automático con GitHub
- **Render:** Free tier con MongoDB
- **Heroku:** Con MongoDB Atlas
- **AWS ECS:** Con Docker
- **DigitalOcean App Platform:** Deploy directo

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (\`git checkout -b feature/AmazingFeature\`)
3. Commit tus cambios (\`git commit -m 'Add some AmazingFeature'\`)
4. Push a la rama (\`git push origin feature/AmazingFeature\`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC.

## 👥 Autor

Tu Nombre - [@tuhandle](https://twitter.com/tuhandle)

## 🙏 Agradecimientos

- Express.js team
- TypeScript team
- MongoDB team
- Comunidad open source

---

⭐ Si te gusta este proyecto, dale una estrella en GitHub!
