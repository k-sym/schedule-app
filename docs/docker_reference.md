# Docker Reference - Schedule App

Quick reference guide for Docker commands used in the Schedule App development.

## Docker Compose Commands

### Starting Services

```bash
# Start all services (foreground)
docker-compose up

# Start all services (background/detached)
docker-compose up -d

# Start specific service
docker-compose up backend
docker-compose up frontend
docker-compose up postgres

# Start with rebuild
docker-compose up --build

# Start and force recreate containers
docker-compose up --force-recreate
```

### Stopping Services

```bash
# Stop all services (keeps containers)
docker-compose stop

# Stop specific service
docker-compose stop backend

# Stop and remove containers
docker-compose down

# Stop, remove containers and volumes (deletes database data)
docker-compose down -v

# Stop, remove everything including images
docker-compose down --rmi all
```

### Restarting Services

```bash
# Restart all services
docker-compose restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
docker-compose restart postgres
```

### Viewing Logs

```bash
# View all logs
docker-compose logs

# Follow logs (real-time)
docker-compose logs -f

# View logs for specific service
docker-compose logs backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since 2024-01-01T00:00:00
```

### Checking Status

```bash
# List running containers
docker-compose ps

# List all containers (including stopped)
docker-compose ps -a

# View resource usage
docker-compose top
```

### Building Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (fresh build)
docker-compose build --no-cache

# Build and start
docker-compose up --build
```

### Executing Commands in Containers

```bash
# Execute command in running container
docker-compose exec backend <command>
docker-compose exec frontend <command>
docker-compose exec postgres <command>

# Get shell access
docker-compose exec backend sh
docker-compose exec frontend sh
docker-compose exec postgres sh

# Run command in new container
docker-compose run --rm backend <command>
```

## Service-Specific Commands

### Backend Commands

```bash
# Access backend shell
docker-compose exec backend sh

# Install npm package
docker-compose exec backend npm install <package-name>

# Run migrations
docker-compose exec backend npm run migrate

# Rollback migration
docker-compose exec backend npm run migrate:undo

# Run seeders
docker-compose exec backend npm run seed

# Undo seeders
docker-compose exec backend npm run seed:undo

# Run tests
docker-compose exec backend npm test

# Run linter
docker-compose exec backend npm run lint

# View backend logs
docker-compose logs -f backend
```

### Frontend Commands

```bash
# Access frontend shell
docker-compose exec frontend sh

# Install npm package
docker-compose exec frontend npm install <package-name>

# Run linter
docker-compose exec frontend npm run lint

# Build for production
docker-compose exec frontend npm run build

# View frontend logs
docker-compose logs -f frontend
```

### Database Commands

```bash
# Access PostgreSQL shell
docker-compose exec postgres psql -U schedule_user -d schedule_app

# Run SQL file
docker-compose exec -T postgres psql -U schedule_user -d schedule_app < script.sql

# Backup database
docker-compose exec postgres pg_dump -U schedule_user schedule_app > backup.sql

# Restore database
docker-compose exec -T postgres psql -U schedule_user schedule_app < backup.sql

# View database logs
docker-compose logs -f postgres

# List databases
docker-compose exec postgres psql -U schedule_user -c '\l'

# List tables
docker-compose exec postgres psql -U schedule_user -d schedule_app -c '\dt'
```

## Docker Commands (Without Compose)

### Container Management

```bash
# List running containers
docker ps

# List all containers
docker ps -a

# Stop container
docker stop <container_name_or_id>

# Start container
docker start <container_name_or_id>

# Restart container
docker restart <container_name_or_id>

# Remove container
docker rm <container_name_or_id>

# Force remove running container
docker rm -f <container_name_or_id>

# View container logs
docker logs <container_name_or_id>
docker logs -f <container_name_or_id>

# Execute command in container
docker exec -it <container_name_or_id> <command>

# Get shell in container
docker exec -it <container_name_or_id> sh
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi <image_name_or_id>

# Force remove image
docker rmi -f <image_name_or_id>

# Build image
docker build -t <image_name> .

# Pull image
docker pull <image_name>

# Tag image
docker tag <source_image> <target_image>
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect <volume_name>

# Remove volume
docker volume rm <volume_name>

# Remove unused volumes
docker volume prune

# Create volume
docker volume create <volume_name>
```

### Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect <network_name>

# Remove network
docker network rm <network_name>

# Create network
docker network create <network_name>
```

### System Commands

```bash
# Show disk usage
docker system df

# Remove unused data
docker system prune

# Remove everything (containers, images, volumes, networks)
docker system prune -a --volumes

# Show detailed info
docker info

# Show version
docker version
```

## Common Workflows

### Fresh Start

```bash
# Stop everything and remove all data
docker-compose down -v

# Rebuild and start
docker-compose up --build
```

### Update Dependencies

```bash
# Backend
docker-compose exec backend npm install

# Rebuild and restart
docker-compose build backend
docker-compose restart backend

# Frontend
docker-compose exec frontend npm install

# Rebuild and restart
docker-compose build frontend
docker-compose restart frontend
```

### Database Reset

```bash
# Stop services
docker-compose down

# Remove only database volume
docker volume rm schedule-app_postgres_data

# Start again (fresh database)
docker-compose up
```

### View Real-Time Logs (Multiple Services)

```bash
# All services
docker-compose logs -f

# Multiple specific services
docker-compose logs -f backend frontend

# With timestamps
docker-compose logs -f -t
```

### Debugging

```bash
# Check service health
docker-compose ps

# Inspect service
docker-compose exec backend env

# Check network connectivity
docker-compose exec backend ping postgres
docker-compose exec frontend ping backend

# View resource usage
docker stats
```

## Environment-Specific Commands

### Development

```bash
# Start with development config
docker-compose up

# Enable debug logging
docker-compose logs -f --tail=100
```

### Testing

```bash
# Run tests in backend
docker-compose exec backend npm test

# Run specific test file
docker-compose exec backend npm test -- tests/unit/auth.test.js

# Run tests with coverage
docker-compose exec backend npm test -- --coverage
```

### Production Build (Local)

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start production services
docker-compose -f docker-compose.prod.yml up
```

## Container Names

The following container names are used:

- `schedule-app-db` - PostgreSQL database
- `schedule-app-backend` - Node.js backend API
- `schedule-app-frontend` - Vue.js frontend app

## Network

Services communicate via the `schedule-app_schedule-network` bridge network.

## Volumes

- `schedule-app_postgres_data` - PostgreSQL data persistence

## Troubleshooting Commands

### Container Won't Start

```bash
# View error logs
docker-compose logs <service_name>

# Inspect container
docker inspect <container_name>

# Check resource limits
docker stats
```

### Port Conflicts

```bash
# Find what's using port (macOS/Linux)
lsof -i :<port_number>

# Kill process
kill -9 <PID>
```

### Network Issues

```bash
# Inspect network
docker network inspect schedule-app_schedule-network

# Test connectivity
docker-compose exec backend ping postgres
docker-compose exec backend curl http://postgres:5432

# Recreate network
docker-compose down
docker network rm schedule-app_schedule-network
docker-compose up
```

### Performance Issues

```bash
# Check resource usage
docker stats

# View system disk usage
docker system df

# Clean up unused resources
docker system prune

# Limit container resources (in docker-compose.yml)
# deploy:
#   resources:
#     limits:
#       cpus: '0.5'
#       memory: 512M
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# View database logs
docker-compose logs postgres

# Test connection from backend
docker-compose exec backend nc -zv postgres 5432

# Connect directly to database
docker-compose exec postgres psql -U schedule_user -d schedule_app
```

## Tips and Best Practices

1. **Use `docker-compose` for local development** - It's easier than managing containers manually
2. **Always check logs** - Most issues can be diagnosed from logs
3. **Don't commit volumes** - Data is meant to be ephemeral in development
4. **Rebuild after dependency changes** - Use `--build` flag
5. **Use `.dockerignore`** - Exclude unnecessary files from build context
6. **Name your containers** - Makes it easier to reference them
7. **Use health checks** - Ensures services are ready before depending services start
8. **Leverage Docker networks** - Services can communicate by name
9. **Clean up regularly** - Use `docker system prune` to free space
10. **Use volumes for node_modules** - Prevents host/container conflicts

## Quick Reference Card

| Task | Command |
|------|---------|
| Start all | `docker-compose up` |
| Start detached | `docker-compose up -d` |
| Stop all | `docker-compose down` |
| View logs | `docker-compose logs -f` |
| Rebuild | `docker-compose up --build` |
| Shell access | `docker-compose exec <service> sh` |
| Run command | `docker-compose exec <service> <command>` |
| Fresh start | `docker-compose down -v && docker-compose up --build` |
| List containers | `docker-compose ps` |
| Restart service | `docker-compose restart <service>` |

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker CLI Reference](https://docs.docker.com/engine/reference/commandline/cli/)
- [Docker Compose File Reference](https://docs.docker.com/compose/compose-file/)
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
