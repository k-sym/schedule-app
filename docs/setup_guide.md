# Setup Guide - Schedule App

This guide will help you set up the Schedule App development environment on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker Desktop** (version 20.10 or higher)
  - [Download for Mac](https://www.docker.com/products/docker-desktop)
  - [Download for Windows](https://www.docker.com/products/docker-desktop)
  - [Download for Linux](https://docs.docker.com/engine/install/)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (for version control)
- **Node.js 18+** (optional, for running outside Docker)
- **A code editor** (VS Code, WebStorm, etc.)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd schedule-app
```

### 2. Start the Development Environment

```bash
docker-compose up
```

This single command will:
- Start a PostgreSQL database
- Start the backend API server
- Start the frontend development server
- Set up networking between all services

**First-time startup will take a few minutes** as Docker downloads images and installs dependencies.

### 3. Verify Everything is Running

Once all services are started, you should see log output from all three containers. Verify the services are accessible:

- **Frontend**: Open [http://localhost:5173](http://localhost:5173) in your browser
- **Backend API**: Visit [http://localhost:3000/health](http://localhost:3000/health)
- **Database**: Available at `localhost:5432` (accessible via tools like pgAdmin or DBeaver)

You should see:
- Frontend showing the login page
- Backend health check returning: `{"status":"ok","timestamp":"...","environment":"development"}`

## Development Workflow

### Starting the Application

```bash
# Start all services in the foreground (see logs)
docker-compose up

# Or start in detached mode (background)
docker-compose up -d
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow all logs in real-time
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Stopping the Application

```bash
# Stop all services (Ctrl+C if running in foreground)
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Restarting a Specific Service

```bash
# Restart backend only
docker-compose restart backend

# Restart frontend only
docker-compose restart frontend

# Restart database
docker-compose restart postgres
```

### Rebuilding After Code Changes

Most code changes will hot-reload automatically, but if you modify dependencies or Docker configuration:

```bash
# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Rebuild and restart
docker-compose up --build

# Rebuild specific service and restart it
docker-compose up --build backend
```

## Project Structure

```
schedule-app/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── config/       # Database, JWT config
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth, validation
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helper functions
│   │   ├── websocket/    # WebSocket handlers
│   │   ├── app.js        # Express app setup
│   │   └── server.js     # Server entry point
│   ├── migrations/       # Database migrations
│   ├── seeders/          # Database seed data
│   ├── tests/            # Unit and integration tests
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/             # Vue 3 application
│   ├── src/
│   │   ├── assets/       # Images, styles
│   │   ├── components/   # Vue components
│   │   ├── views/        # Page components
│   │   ├── stores/       # Pinia state stores
│   │   ├── composables/  # Reusable composition functions
│   │   ├── api/          # API client
│   │   ├── router/       # Vue Router config
│   │   ├── utils/        # Helper functions
│   │   ├── App.vue       # Root component
│   │   └── main.js       # App entry point
│   ├── public/           # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env.example
│
├── docs/                 # Documentation
├── docker-compose.yml    # Docker orchestration
└── README.md
```

## Service Details

### Backend API (Port 3000)

**Technology**: Node.js 18, Express.js, Sequelize ORM

**Environment Variables**: See `backend/.env.example`

**Key Features**:
- RESTful API endpoints
- JWT authentication
- PostgreSQL database connection
- WebSocket support (Socket.io)
- Request validation
- Error handling and logging

**Running Commands Inside Container**:
```bash
# Access backend shell
docker-compose exec backend sh

# Run migrations
docker-compose exec backend npm run migrate

# Run seeds
docker-compose exec backend npm run seed

# Run tests
docker-compose exec backend npm test
```

### Frontend App (Port 5173)

**Technology**: Vue 3, Vite, Pinia, Vue Router

**Environment Variables**: See `frontend/.env.example`

**Key Features**:
- Vite for fast hot module replacement
- Pinia for state management
- Vue Router with auth guards
- Axios for API calls
- WebSocket client

**Running Commands Inside Container**:
```bash
# Access frontend shell
docker-compose exec frontend sh

# Run linter
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build
```

### PostgreSQL Database (Port 5432)

**Version**: PostgreSQL 15 (Alpine)

**Connection Details**:
- Host: `localhost` (from host machine) or `postgres` (from containers)
- Port: `5432`
- Database: `schedule_app`
- Username: `schedule_user`
- Password: `schedule_pass_dev` (development only)

**Accessing the Database**:
```bash
# Using psql from container
docker-compose exec postgres psql -U schedule_user -d schedule_app

# Or use a GUI tool like pgAdmin, DBeaver, TablePlus
# Connection string: postgresql://schedule_user:schedule_pass_dev@localhost:5432/schedule_app
```

**Common Database Commands**:
```sql
-- List all tables
\dt

-- Describe a table
\d table_name

-- List all databases
\l

-- Quit psql
\q
```

## Port Configuration

| Service  | Internal Port | External Port | URL                       |
|----------|---------------|---------------|---------------------------|
| Frontend | 5173          | 5173          | http://localhost:5173     |
| Backend  | 3000          | 3000          | http://localhost:3000     |
| Database | 5432          | 5432          | localhost:5432            |

## Environment Variables

### Backend Environment Variables

Create `backend/.env` based on `backend/.env.example`:

```bash
# Server Configuration
NODE_ENV=development
PORT=3000

# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=schedule_app
DB_USER=schedule_user
DB_PASSWORD=schedule_pass_dev

# JWT Configuration
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here_change_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=debug
```

### Frontend Environment Variables

Create `frontend/.env` based on `frontend/.env.example`:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Application Configuration
VITE_APP_NAME=Schedule App
VITE_APP_VERSION=1.0.0
```

## Troubleshooting

### Containers Won't Start

```bash
# Check Docker is running
docker --version
docker-compose --version

# View detailed logs
docker-compose logs

# Remove all containers and volumes, then restart
docker-compose down -v
docker-compose up --build
```

### Port Already in Use

If you see errors about ports being in use:

```bash
# Find what's using the port (macOS/Linux)
lsof -i :3000
lsof -i :5173
lsof -i :5432

# Kill the process or change ports in docker-compose.yml
```

### Database Connection Issues

```bash
# Check if database is healthy
docker-compose ps

# View database logs
docker-compose logs postgres

# Restart database
docker-compose restart postgres

# Connect to database to verify
docker-compose exec postgres psql -U schedule_user -d schedule_app
```

### Hot Reload Not Working

If code changes aren't being detected:

```bash
# Restart the specific service
docker-compose restart backend
docker-compose restart frontend

# On Windows, you may need to use polling mode
# This is already configured in vite.config.js
```

### Permission Issues (Linux)

On Linux, you may encounter permission issues with mounted volumes:

```bash
# Run with your user ID
export UID=$(id -u)
export GID=$(id -g)
docker-compose up

# Or add to docker-compose.yml:
# user: "${UID}:${GID}"
```

### Container Keeps Restarting

```bash
# Check logs for error messages
docker-compose logs backend
docker-compose logs frontend

# Common issues:
# - Missing dependencies: Rebuild with --build
# - Syntax errors: Check recent code changes
# - Port conflicts: Change ports in docker-compose.yml
```

### Database Data Persistence

Data is persisted in a Docker volume named `schedule-app_postgres_data`.

```bash
# View volumes
docker volume ls

# Remove volume (WARNING: deletes all data)
docker-compose down -v

# Backup database
docker-compose exec postgres pg_dump -U schedule_user schedule_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U schedule_user schedule_app < backup.sql
```

## Running Without Docker

If you prefer to run services directly on your machine:

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set DB_HOST=localhost
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Database

Install PostgreSQL locally and create the database:

```bash
createdb schedule_app
psql schedule_app
```

## Development Tips

### Use Docker Compose Profiles (Future)

For faster startup, you can create profiles:

```yaml
# In docker-compose.yml
services:
  backend:
    profiles: ["api", "full"]
  frontend:
    profiles: ["web", "full"]
```

Then start only what you need:
```bash
docker-compose --profile api up  # Only backend + database
docker-compose --profile full up # Everything
```

### Accessing Container Shell

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh

# Database
docker-compose exec postgres sh
```

### Installing New Dependencies

**Backend**:
```bash
# Add to package.json
docker-compose exec backend npm install <package-name>

# Then rebuild the image
docker-compose build backend
docker-compose restart backend
```

**Frontend**:
```bash
# Add to package.json
docker-compose exec frontend npm install <package-name>

# Then rebuild the image
docker-compose build frontend
docker-compose restart frontend
```

### Running Database Migrations

```bash
# Create a new migration
docker-compose exec backend npx sequelize-cli migration:generate --name <migration-name>

# Run pending migrations
docker-compose exec backend npm run migrate

# Rollback last migration
docker-compose exec backend npm run migrate:undo
```

### Running Tests

```bash
# Backend tests
docker-compose exec backend npm test

# Watch mode
docker-compose exec backend npm run test:watch

# With coverage
docker-compose exec backend npm test -- --coverage
```

## Next Steps

Once your environment is running:

1. **Review the project plan**: See [docs/project_plan.md](project_plan.md)
2. **Understand the architecture**: Read [docs/project_ideas.md](project_ideas.md)
3. **Start Phase 1 development**: Begin implementing authentication
4. **Run database migrations**: Set up the initial schema
5. **Create seed data**: Add test users and areas

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Vue 3 Documentation](https://vuejs.org/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Sequelize Documentation](https://sequelize.org/)
- [Express.js Documentation](https://expressjs.com/)
- [Vite Documentation](https://vitejs.dev/)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the container logs: `docker-compose logs`
2. Review the troubleshooting section above
3. Search for similar issues in the project's issue tracker
4. Ask the development team

## Summary

You now have a fully functional local development environment with:

✅ Backend API running on port 3000
✅ Frontend app running on port 5173
✅ PostgreSQL database on port 5432
✅ Hot reload enabled for rapid development
✅ All services networked and communicating
✅ Data persistence configured

Happy coding! 🚀
