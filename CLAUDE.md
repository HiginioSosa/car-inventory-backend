# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Car Inventory Backend API - A modern REST API for managing car inventory built with Node.js, Express, TypeScript, and MongoDB. The application implements JWT authentication, comprehensive validation, and follows a layered architecture pattern.

## Essential Commands

### Development
```bash
npm run dev          # Start development server with auto-reload (nodemon + ts-node)
npm run typecheck    # Verify TypeScript types without building
```

### Testing
```bash
npm test             # Run all tests
npm run test:watch   # Run tests in watch mode for active development
npm run test:coverage # Run tests with coverage report
npm run test:ci      # Run tests in CI mode (limited workers)

# Run specific test file
npm test -- car.test.ts
```

### Build and Production
```bash
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled JavaScript from dist/
npm run start:prod   # Run in production mode with NODE_ENV=production
npm run clean        # Remove dist/ folder
```

### Code Quality
```bash
npm run lint         # Check code with ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Verify Prettier formatting
```

### Docker Commands
```bash
# Start MongoDB only
docker-compose up -d

# Start full development stack (app + MongoDB + Mongo Express)
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f app

# Stop and remove containers
docker-compose down
```

## Architecture

### Layered Architecture Pattern

The codebase follows a strict separation of concerns with these layers:

1. **Routes** (`src/routes/`) - Define API endpoints and mount validators
2. **Controllers** (`src/controllers/`) - Handle HTTP requests/responses, orchestrate services
3. **Services** (`src/services/`) - Contain business logic and data operations
4. **Models** (`src/models/`) - Define Mongoose schemas and database structure
5. **Middlewares** (`src/middlewares/`) - Handle cross-cutting concerns (auth, validation, uploads)
6. **Validators** (`src/validators/`) - Define validation rules using express-validator

### Key Architecture Patterns

#### Authentication Flow
- JWT tokens issued on login/register via `auth.service.ts`
- `authenticate` middleware extracts and verifies token from `Authorization: Bearer <token>` header
- Adds decoded user info to `req.user` for downstream use
- `authorize(['admin', 'user'])` middleware checks role-based permissions
- `optionalAuthenticate` allows anonymous access but attaches user if token present

#### Request Validation Pipeline
All routes use validators before controllers:
```typescript
router.post('/', createCarValidations, validate, controller.create);
```
- Validators defined in `src/validators/` use express-validator chains
- `validate` middleware (in `validation.middleware.ts`) checks results and returns 400 on errors
- Controllers receive pre-validated data

#### Response Handling
Use standardized response helpers from `src/utils/responseHandler.ts`:
- `successResponse(res, statusCode, message, data)` - Success responses
- `errorResponse(res, statusCode, name, message, customMessage)` - Error responses
All responses follow consistent JSON structure

#### Soft Delete Pattern
Car model implements soft deletes:
- `isDeleted` boolean flag (indexed for performance)
- `fechaEliminacion` timestamp when deleted
- All queries filter `{ isDeleted: false }` by default
- `deleteCar()` marks as deleted, `hardDeleteCar()` permanently removes

#### File Upload Flow
- Multer middleware configured in `upload.middleware.ts`
- Stores files in `src/uploads/` with sanitized filenames
- Validates file types (images only) and size (5MB max)
- Auto-deletes old photos when updating or hard-deleting cars
- Served statically via `/uploads` route

### Database Design

#### Mongoose Models
All models in `src/models/` define:
- TypeScript interfaces extending `Document`
- Schema with validation, indexes, and defaults
- Pre-save hooks for auto-updating timestamps
- Composite indexes for optimized queries

#### Car Model Specifics
- Compound indexes on `{ marca: 1, modelo: 1 }` and `{ isDeleted: 1, fechaAlta: -1 }`
- Custom date fields (`fechaAlta`, `fechaModificacion`, `fechaEliminacion`) instead of Mongoose timestamps
- References User model via `createdBy` field
- Pre-save and pre-update hooks auto-update `fechaModificacion`

### Configuration Management

#### Environment Variables
- Loaded via dotenv in `src/config/env.ts`
- All config exported from single config object with defaults
- Required vars: `MONGODB_URI`, `JWT_SECRET`
- Optional with defaults: `PORT`, `HOST`, `NODE_ENV`, etc.
- For Docker: Use `.env.docker` with `mongodb://admin:admin123@mongodb:27017/...?authSource=admin`

#### TypeScript Configuration
- `module: "nodenext"` - Uses Node.js native ESM resolution
- Strict mode enabled with additional checks (`noUnusedLocals`, `noImplicitReturns`, etc.)
- Output to `dist/` with source maps and declarations
- `ts-node` configured for CommonJS in development

## Important Implementation Details

### Service Layer Pattern
Services export singleton instances:
```typescript
class CarService {
  async getAllCars(filters: CarFilters) { /* ... */ }
}
export default new CarService();
```
Import as: `import carService from '../services/car.service'`

### Pagination Implementation
All list endpoints support:
- Query params: `page`, `limit`, `sortBy`, `sortOrder`
- Returns `PaginatedResponse<T>` with data array and pagination metadata
- Default: page=1, limit=10, sortBy='fechaAlta', sortOrder='desc'

### Error Handling Strategy
- Services throw errors with Spanish messages
- Controllers catch and call `errorResponse()` with translated messages
- Global error handler in `server.ts` catches unhandled errors
- Mongoose validation errors automatically converted to readable format

### Swagger Documentation
- Configured in `src/config/swagger.ts`
- Uses JSDoc comments with `@swagger` tags inline in route files
- Auto-generates OpenAPI 3.0 spec
- Accessible at `/api-docs` in development

### Testing Configuration
- Jest configured with ts-jest preset
- Test files must be in `test/` directory (not `src/__tests__/`)
- Setup file: `test/setup.ts` runs before all tests
- Coverage collected from `src/**/*.ts` excluding type files
- 10 second timeout for database operations

## Common Development Patterns

### Adding a New Resource
1. Create model in `src/models/` with interface and schema
2. Define types/interfaces in `src/types/index.ts`
3. Create service class in `src/services/` with business logic
4. Create controller in `src/controllers/` for HTTP handling
5. Define validators in `src/validators/`
6. Create routes in `src/routes/` and mount in `src/routes/index.ts`

### Authentication-Protected Routes
```typescript
import { authenticate, authorize } from '../middlewares/auth.middleware';

// Require authentication
router.get('/', authenticate, controller.getAll);

// Require specific role
router.delete('/:id', authenticate, authorize(['admin']), controller.delete);
```

### Database Queries with Filters
Follow pattern in `car.service.ts`:
- Build dynamic query object based on provided filters
- Use regex with `$options: 'i'` for case-insensitive text search
- Use `$gte` and `$lte` for numeric ranges
- Always filter `isDeleted: false` for active records
- Use `Promise.all()` to run count and find queries in parallel

### Handling File Uploads
```typescript
import { upload } from '../middlewares/upload.middleware';

router.post('/', upload.single('foto'), validator, controller.create);
// File available as req.file, saved path in req.file.filename
```

## Project Quirks and Conventions

### Language Mixing
- Code (variables, functions) in English
- User-facing messages, database fields, and validation messages in Spanish
- Response structure has both `message` (English) and `customMessage` (Spanish)

### Date Field Naming
- Uses Spanish field names: `fechaAlta`, `fechaModificacion`, `fechaEliminacion`
- Custom date fields instead of Mongoose's `createdAt`/`updatedAt` (timestamps disabled)

### Validation Messages
- Validators return Spanish error messages
- Controllers use `errorResponse()` with both English and Spanish messages

### Logger Usage
Custom logger in `src/utils/logger.ts` with emojis:
- `logger.info()`, `logger.error()`, `logger.warn()`, `logger.success()`, `logger.debug()`
- Morgan configured for HTTP request logging

### TypeScript Strictness
- Project uses strict TypeScript configuration
- Some ESLint exceptions needed for dynamic queries (marked with `// eslint-disable-next-line`)
- All service methods properly typed with return types

### MongoDB Connection
- Connection established on app startup in `server.ts`
- Event handlers for disconnection and errors
- Graceful shutdown on SIGINT (Ctrl+C)

## API Endpoints Structure

### Authentication (`/api/auth`)
- `POST /register` - Create new user account
- `POST /login` - Authenticate and receive JWT
- `POST /refresh` - Refresh expired token

### Cars (`/api/cars`)
All require authentication via JWT bearer token
- `GET /` - List cars with filtering and pagination
- `GET /:id` - Get single car by ID
- `POST /` - Create new car (with optional photo upload)
- `PUT /:id` - Update existing car
- `DELETE /:id` - Soft delete car

### Catalogs (`/api/catalogs`)
- `GET /years` - Get list of valid years for car catalog

### Health & Documentation
- `GET /health` - Server health check
- `GET /` - API info and available endpoints
- `GET /api-docs` - Swagger UI documentation
