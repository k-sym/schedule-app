# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Always warn about the context remaining and before starting a new task make sure the left over context is enough for the task or not. if not ask the user to use compact.

## Project Overview

Schedule App is an entertainment booking management system for a venue with multiple areas (rooms). The system allows:
- **Entertainers** to mark their day-by-day availability
- **Admins** to create schedules via drag-and-drop interface
- **Public** to view published schedules via a shareable URL

**Tech Stack**: Node.js/Express backend, Vue 3 frontend, PostgreSQL database, Socket.io for real-time updates. All services run in Docker for local development.

## Development Environment Setup

### Starting the Application

```bash
# Start all services (PostgreSQL, backend, frontend)
docker-compose up

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

The services will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Database: localhost:5432

### Common Commands

**Backend** (inside Docker container):
```bash
# Access backend shell
docker-compose exec backend sh

# Run database migrations
docker-compose exec backend npm run migrate

# Rollback last migration
docker-compose exec backend npm run migrate:undo

# Seed database with initial data (4 areas, demo users)
docker-compose exec backend npm run seed

# Run tests
docker-compose exec backend npm test
docker-compose exec backend npm run test:watch

# Lint
docker-compose exec backend npm run lint
docker-compose exec backend npm run lint:fix
```

**Frontend** (inside Docker container):
```bash
# Access frontend shell
docker-compose exec frontend sh

# Lint
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build
```

**Database**:
```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U schedule_user -d schedule_app

# Backup database
docker-compose exec postgres pg_dump -U schedule_user schedule_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U schedule_user schedule_app < backup.sql
```

**Rebuilding** (after dependency changes):
```bash
docker-compose build backend
docker-compose build frontend
docker-compose up --build
```

**Fresh Start** (removes all data):
```bash
docker-compose down -v
docker-compose up --build
```

## Architecture

### Monorepo Structure

```
schedule-app/
├── backend/          # Node.js/Express API
├── frontend/         # Vue 3 SPA
├── docs/            # Project documentation
└── docker-compose.yml
```

### Backend Architecture

**Location**: `backend/src/`

Key architectural patterns:
- **MVC-style**: Routes → Controllers → Services → Models
- **Middleware-based**: Authentication, validation, error handling
- **Sequelize ORM**: Database models with migrations and seeders
- **JWT Authentication**: Access + refresh token pattern
- **Socket.io**: Real-time updates for collaborative editing

Important directories:
- `config/` - Database connection, JWT config
- `models/` - Sequelize models (User, Area, Availability, Booking, RecurringPattern, AuditLog)
- `controllers/` - HTTP request handlers
- `services/` - Business logic (conflict detection, booking validation)
- `middleware/` - Auth verification, role-based access, validation
- `routes/` - API endpoint definitions
- `websocket/` - WebSocket event handlers

### Frontend Architecture

**Location**: `frontend/src/`

Key architectural patterns:
- **Vue 3 Composition API**: All components use `<script setup>`
- **Pinia stores**: Centralized state management (auth, bookings, availability, areas, users)
- **Vue Router**: Route guards for authentication
- **Axios client**: Centralized API client with JWT interceptors and auto-refresh
- **Socket.io client**: Real-time updates via WebSocket

Important directories:
- `stores/` - Pinia stores for global state
- `views/` - Page-level components (LoginView, DashboardView, ScheduleView, etc.)
- `components/` - Organized by feature (auth, availability, schedule, admin, common)
- `api/` - API client and endpoint wrappers
- `router/` - Route definitions with auth guards
- `composables/` - Reusable Vue composables (useAuth, useWebSocket, etc.)

### Database Schema

**Core tables**:
- `users` - Admins and entertainers (role-based)
- `areas` - Venue rooms/areas (4 fixed areas initially)
- `availability` - Entertainer day-by-day availability
- `bookings` - Schedule assignments (one entertainer per area per day)
- `recurring_patterns` - Future feature for recurring bookings
- `audit_log` - Change tracking

**Key relationships**:
- Bookings reference users (entertainer), areas, and creator
- Availability is per entertainer per date (unique constraint)
- Bookings have unique constraint on (area_id, booking_date) - prevents double-booking areas
- System prevents booking same entertainer to multiple areas on same day

### Authentication Flow

1. User logs in → Backend validates credentials
2. Backend returns JWT access token (15min) + refresh token (7 days)
3. Frontend stores tokens in localStorage and Pinia store
4. Axios interceptor adds access token to all requests
5. On 401 error, axios interceptor attempts token refresh
6. If refresh fails, user is logged out and redirected to login

### Real-Time Updates (Socket.io)

When implemented (Phase 5):
- Admins connect to WebSocket on login
- Backend emits events: `booking:created`, `booking:updated`, `booking:deleted`, `availability:updated`
- Frontend listeners update Pinia stores and UI in real-time
- Enables collaborative editing for multiple admins

## Key Constraints and Business Rules

1. **Availability**: Entertainers mark full days (no time slots)
2. **Conflict Detection**:
   - System prevents booking same entertainer to multiple areas on same day
   - Warns if booking entertainer on unavailable day (can override)
3. **One booking per area per day**: Enforced by database constraint
4. **Recurring bookings**: Future feature - allow patterns like "every Tuesday" with override capability
5. **Roles**:
   - Admin: Full CRUD access, schedule management
   - Entertainer: Manage own availability, view schedules, view own bookings

## API Structure

**Base URL**: `/api`

**Endpoint groups**:
- `/auth` - Login, logout, token refresh, password change
- `/users` - User management (admin only except own profile)
- `/areas` - Area management (admin CUD, all can read)
- `/availability` - Availability management (entertainers manage own, admins view all)
- `/bookings` - Booking management (admin only for CUD, all can read)
- `/public` - Public schedule view (no auth required)

**Authentication**: All endpoints (except `/auth` and `/public`) require JWT in `Authorization: Bearer <token>` header.

## Development Workflow

### Adding a New Feature

1. **Backend**:
   - Create migration: `docker-compose exec backend npx sequelize-cli migration:generate --name <name>`
   - Define model in `src/models/`
   - Create service in `src/services/` (business logic)
   - Create controller in `src/controllers/` (HTTP handlers)
   - Define routes in `src/routes/`
   - Add validation middleware
   - Run migration: `docker-compose exec backend npm run migrate`

2. **Frontend**:
   - Create Pinia store in `src/stores/` if needed
   - Add API methods in `src/api/`
   - Create components in `src/components/<feature>/`
   - Add view in `src/views/` if new page
   - Update router in `src/router/index.js`

3. **Testing**:
   - Backend: Add tests in `backend/tests/`
   - Run: `docker-compose exec backend npm test`

### Database Migrations

**Creating a migration**:
```bash
docker-compose exec backend npx sequelize-cli migration:generate --name create-bookings-table
# Edit file in migrations/
docker-compose exec backend npm run migrate
```

**Rollback**:
```bash
docker-compose exec backend npm run migrate:undo
```

### Working with Sequelize Models

Models are in `backend/src/models/`. Sequelize conventions:
- Use UUIDs for primary keys
- Models auto-add `createdAt` and `updatedAt`
- Define associations in model files
- Use enums for status/role fields

Example model reference:
```javascript
const { User, Area, Booking } = require('../models');

// Query with associations
const bookings = await Booking.findAll({
  include: [
    { model: User, as: 'entertainer' },
    { model: Area }
  ],
  where: { booking_date: '2024-01-15' }
});
```

## Terminology

- **Area**: A room/space in the venue (e.g., "Pub", "Terrace", "Main Stage")
- **Entertainer**: User role for DJs/bands who perform
- **Availability**: Days an entertainer is available to perform
- **Booking**: Assignment of entertainer to area on specific date
- **Recurring Pattern**: Future feature for repeated bookings (e.g., "every Tuesday")

## Important Implementation Notes

### Conflict Detection Logic

Located in `backend/src/services/conflictService.js` (when implemented):
1. Check if entertainer already booked in different area on same day
2. Check if area already has booking on that day
3. Check if entertainer marked unavailable for that day
4. Return conflict details or allow booking

### Vue Component Patterns

All components use Composition API with `<script setup>`:
```vue
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)
</script>
```

### API Client Pattern

Use centralized axios instance (`frontend/src/api/client.js`):
- Auto-attaches JWT token
- Auto-refreshes expired tokens
- Handles 401 errors
- Centralizes error handling

Import and use:
```javascript
import apiClient from '@/api/client'

const response = await apiClient.get('/bookings')
const booking = await apiClient.post('/bookings', data)
```

## Phase-Based Development

The project follows an 8-phase plan (see `docs/project_plan.md`):

**Current Phase**: Foundation setup complete
**Next Phase**: Phase 1 - Authentication implementation

When implementing features, refer to the phase plan for:
- Feature scope and requirements
- Database schema for that phase
- API endpoints to implement
- Frontend components needed

## Environment Variables

**Backend** (`.env`):
- Database connection: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- JWT secrets: `JWT_SECRET`, `JWT_REFRESH_SECRET`
- JWT expiry: `JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`
- CORS: `CORS_ORIGIN`

**Frontend** (`.env`):
- API URL: `VITE_API_BASE_URL`
- WebSocket URL: `VITE_WS_URL`

**Note**: In Docker, these are set in `docker-compose.yml`. For local development, copy from `.env.example`.

## Debugging

**Backend logs**:
```bash
docker-compose logs -f backend
```

**Frontend logs**:
```bash
docker-compose logs -f frontend
```

**Database queries**:
- Set `LOG_LEVEL=debug` in backend `.env`
- Sequelize will log all SQL queries

**WebSocket debugging** (when implemented):
- Browser DevTools → Network → WS tab
- Backend emits events to `socket-io` namespace

## Production Deployment

Target: AWS with PostgreSQL RDS, EC2/ECS, Nginx

Key differences from development:
- Use production environment variables
- Enable SSL/HTTPS
- Use production database (RDS)
- Build frontend: `npm run build`
- Serve frontend via Nginx
- Use PM2 or Docker for backend process management
- Set `NODE_ENV=production`

Deployment guide: `docs/deployment_guide.md` (to be created in Phase 8)
