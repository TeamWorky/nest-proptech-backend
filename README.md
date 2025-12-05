# NestJS Backend Template - Production Ready

A complete, production-ready NestJS backend template with all essential components, best practices, and common infrastructure ready to use.

## Features

### 🔐 Authentication & Authorization
- JWT authentication (Access + Refresh tokens)
- User registration and login
- Role-based access control (SUPER_ADMIN, ADMIN, USER, GUEST)
- Password hashing with bcrypt
- Token refresh mechanism
- Protected routes with guards

### 🔒 Security
- Helmet for security headers
- CORS configuration
- Rate limiting (100 req/min)
- Input validation with class-validator
- Request timeout protection

### ⚡ Performance
- Response compression
- Redis caching (auto-implemented)
- Database connection pooling
- Optimized queries with TypeORM

### 🛠️ Developer Experience
- API versioning (URI-based)
- OpenAPI/Swagger with Scalar UI
- Automatic API documentation
- Health check endpoint
- Request tracing with unique IDs
- Structured logging
- Hot reload in development

### 💾 Data Management
- PostgreSQL with TypeORM
- Database migrations support
- Soft delete capability
- UUID primary keys
- Automatic timestamps

### 📦 Infrastructure
- Docker Compose setup
- Redis for caching
- Environment configuration
- Graceful shutdown handling

## Quick Start

### Prerequisites
- Node.js 24.11.1 (required)
- Docker & Docker Compose (required for PostgreSQL and Redis)

### Installation

1. Clone and install dependencies:
```bash
git clone <repository>
cd nest-proptech-backend
npm install
```

2. Set up environment:
```bash
cp .env.example .env
# Edit .env if needed to customize database or Redis configuration
```

3. **IMPORTANT: Start Docker services** (PostgreSQL and Redis):
```bash
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

Verify services are running:
```bash
docker-compose ps
```

4. Run the application:
```bash
npm run start:dev
```

5. Access the application:
- API: http://localhost:3000/api
- Documentation: http://localhost:3000/api-docs
- Health Check: http://localhost:3000/api/health

### Default Admin User

The application automatically creates a default admin user on first start.

#### Default Credentials (if not configured):
```
Email: admin@admin.com
Password: admin
Role: SUPER_ADMIN
```

#### Customize Admin User (Recommended for Production):
Add these variables to your `.env` file:
```env
ADMIN_EMAIL=your-admin@company.com
ADMIN_PASSWORD=YourSecurePassword123!
ADMIN_FIRST_NAME=John
ADMIN_LAST_NAME=Doe
```

⚠️ **IMPORTANT**: Use custom credentials in production!

```bash
# Login with default credentials
POST /api/v1/auth/login
{
  "email": "admin@admin.com",
  "password": "admin"
}

# Then update the user with secure credentials
PATCH /api/v1/users/{admin-id}
{
  "email": "your-secure-email@company.com",
  "password": "YourSecurePassword123!"
}
```

### Stopping the Application

To stop the application:
```bash
# Stop NestJS app: Ctrl+C

# Stop Docker services:
docker-compose down

# Stop and remove volumes (will delete all data):
docker-compose down -v
```

## Project Structure

```
src/
├── auth/               # Authentication module
│   ├── dto/           # Auth DTOs (login, register, refresh)
│   ├── strategies/    # Passport strategies (JWT)
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
├── users/              # User management module
│   ├── dto/           # User DTOs
│   ├── entities/      # User entity
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── common/             # Shared components
│   ├── constants/     # App constants
│   ├── decorators/    # Custom decorators (@CurrentUser, @Public, @Roles)
│   ├── dto/          # Base DTOs
│   ├── entities/     # Base entity (UUID, timestamps, soft delete)
│   ├── enums/        # Common enums (Role, etc.)
│   ├── exceptions/   # Custom exceptions
│   └── interfaces/   # Common interfaces
├── database/          # Database configuration
├── filters/           # Exception filters
├── guards/            # Auth guards (JwtAuthGuard, RolesGuard)
├── health/            # Health check module
├── interceptors/      # Response/logging interceptors
├── middlewares/       # Custom middlewares
├── redis/             # Redis module
└── utils/             # Utility functions
```

## Available Scripts

```bash
# Docker Services
docker-compose up -d         # Start PostgreSQL and Redis
docker-compose down          # Stop services
docker-compose ps            # Check services status
docker-compose logs          # View services logs

# Development
npm run start:dev            # Start with hot reload (requires Docker services running)
npm run start:debug          # Start in debug mode

# Production
npm run build                # Build for production
npm run start:prod           # Run production build

# Testing
npm run test                 # Run unit tests
npm run test:watch           # Run tests in watch mode
npm run test:cov             # Run tests with coverage
npm run test:e2e             # Run e2e tests

# Database Migrations
npm run migration:generate -- src/database/migrations/MigrationName
npm run migration:run
npm run migration:revert

# Code Quality
npm run lint                 # Lint code
npm run format               # Format code
```

## Documentation

Complete project documentation is available in `.cursor/docs/`:

- **[Documentation Index](.cursor/docs/README.md)** - Full documentation index
- **[Adding New Roles](.cursor/docs/guides/adding-new-roles.md)** - How to add new roles
- **[Role Hierarchy](.cursor/docs/features/role-hierarchy.md)** - Role permissions system
- **[Authentication System](.cursor/docs/features/authentication-system.md)** - JWT auth guide
- **[Backend Template](.cursor/docs/features/backend-template-complete.md)** - Complete template structure

## Creating a New Module

For a complete example of how to create a CRUD module with all best practices, see the documentation in `.cursor/docs/features/backend-template-complete.md`.

Basic steps:
1. Create module folder structure
2. Create entity extending `BaseEntity`
3. Create DTOs for validation (Create, Update)
4. Implement service with Redis caching
5. Create controller with versioning
6. Register module in `AppModule`
7. Generate migration if needed

Example structure:
```
src/your-module/
├── dto/
│   ├── create-your-entity.dto.ts
│   └── update-your-entity.dto.ts
├── your-entity.entity.ts
├── your-entity.service.ts
├── your-entity.controller.ts
└── your-entity.module.ts
```

## Environment Variables

See `.env.example` for all available variables:

### Database
- `POSTGRES_HOST` - PostgreSQL host (default: localhost)
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)
- `POSTGRES_USER` - PostgreSQL user (default: postgres)
- `POSTGRES_PASSWORD` - PostgreSQL password (default: postgres)
- `POSTGRES_DB` - PostgreSQL database name (default: nest_proptech)

### Redis
- `REDIS_HOST` - Redis host (default: localhost)
- `REDIS_PORT` - Redis port (default: 6379)

### Application
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - CORS allowed origins (default: *). Examples:
  - `*` - All origins
  - `http://localhost:3000,http://localhost:4200` - Multiple specific origins

### Authentication
- `JWT_SECRET` - JWT access token secret (**REQUIRED - change in production**)
- `JWT_REFRESH_SECRET` - JWT refresh token secret (**REQUIRED - change in production**)
- `JWT_EXPIRES_IN` - Access token expiration (default: 15m)

### Admin User Seeder (Optional)
- `ADMIN_EMAIL` - Admin user email (default: admin@admin.com)
- `ADMIN_PASSWORD` - Admin user password (default: admin)
- `ADMIN_FIRST_NAME` - Admin first name (default: Admin)
- `ADMIN_LAST_NAME` - Admin last name (default: User)

## API Documentation

Interactive API documentation is available at `/api-docs` powered by Scalar with automatic OpenAPI/Swagger generation.

### Available Endpoints

#### Authentication (Public)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/logout` - Logout (requires JWT)
- `POST /api/v1/auth/refresh` - Refresh access token

#### Users (Protected)
- `GET /api/v1/users` - Get all users with pagination (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create user (Admin only)
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Soft delete user (Admin only)

#### Health
- `GET /api/v1/health` - Health check endpoint

### Authentication Flow

1. **Register**: `POST /api/v1/auth/register`
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

2. **Login**: `POST /api/v1/auth/login`
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

3. **Use Access Token**: Add to Authorization header
```
Authorization: Bearer {accessToken}
```

4. **Refresh Token**: When access token expires
```json
{
  "refreshToken": "{refreshToken}"
}
```

### Response Format

All responses follow a standard format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detail 1", "Detail 2"]
}
```

**Paginated:**
```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

## Utilities

### Date Utilities
```typescript
import { DateUtil } from './utils/date.util';

DateUtil.now()
DateUtil.addDays(date, 7)
DateUtil.isExpired(date)
```

### String Utilities
```typescript
import { StringUtil } from './utils/string.util';

StringUtil.slugify('Hello World')
StringUtil.maskEmail('user@example.com')
StringUtil.generateRandomString(32)
```

### Crypto Utilities
```typescript
import { CryptoUtil } from './utils/crypto.util';

CryptoUtil.generateHash(data)
CryptoUtil.generateRandomToken()
CryptoUtil.generateUUID()
```

### Response Utilities
```typescript
import { ResponseUtil } from './utils/response.util';

ResponseUtil.success(data)
ResponseUtil.paginated(items, page, limit, total)
ResponseUtil.error(message)
```

## Redis Caching

Redis caching is automatically used in services. Pattern:

```typescript
// Check cache
const cached = await this._redis.get(key);
if (cached) return JSON.parse(cached);

// Get from database
const data = await this._repository.find();

// Store in cache
await this._redis.setex(key, ttl, JSON.stringify(data));
```

## Custom Exceptions

```typescript
import { NotFoundException, AlreadyExistsException } from './common/exceptions/business.exception';

throw new NotFoundException('User');
throw new AlreadyExistsException('Email');
```

## Troubleshooting

### Application won't start
- Ensure Docker services are running: `docker-compose ps`
- Check if PostgreSQL is accessible: `docker-compose logs postgres`
- Check if Redis is accessible: `docker-compose logs redis`
- Verify environment variables in `.env`

### Database connection error
- Ensure PostgreSQL container is running
- Check `POSTGRES_*` variables in `.env` match docker-compose.yml
- Try restarting Docker services: `docker-compose restart`

### Redis connection error
- Ensure Redis container is running
- Check `REDIS_*` variables in `.env` match docker-compose.yml
- Try restarting Docker services: `docker-compose restart`

## Production Deployment

### Prerequisites
- Node.js 24.11.1
- PostgreSQL database (managed service or self-hosted)
- Redis instance (managed service or self-hosted)

### Deployment Checklist
1. Set `NODE_ENV=production`
2. Change `JWT_SECRET` to a strong secret
3. Configure `CORS_ORIGIN` to specific domains
4. Update database credentials for production
5. Run database migrations: `npm run migration:run`
6. Configure logging service (e.g., Winston)
7. Set up monitoring (e.g., Prometheus)
8. Enable HTTPS
9. Configure database backups
10. Set up Redis persistence
11. Review and adjust rate limits

## Documentation

Detailed documentation available in `.cursor/docs/features/`:
- `backend-template-complete.md` - Complete feature documentation
- `redis-integration.md` - Redis usage guide
- `scalar-api-documentation.md` - API docs setup

## License

UNLICENSED - Private project

## Support

For issues or questions, please create an issue in the repository.
