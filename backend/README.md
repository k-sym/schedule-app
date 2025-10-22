# Schedule App - Backend API

Backend API for the Schedule App entertainment booking management system.

## Tech Stack

- Node.js 18+
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT Authentication
- Socket.io (WebSocket)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for local development)

### Local Development with Docker

1. Start all services:
```bash
docker-compose up
```

2. Backend will be available at `http://localhost:3000`

### Manual Setup (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Run database migrations:
```bash
npm run migrate
```

4. Seed initial data:
```bash
npm run seed
```

5. Start development server:
```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm start` - Start production server
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run migrate` - Run database migrations
- `npm run migrate:undo` - Rollback last migration
- `npm run seed` - Seed database with initial data
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## API Documentation

API documentation will be available at `/api-docs` once Swagger is set up.

## Project Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Express middleware
│   ├── models/         # Sequelize models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   ├── websocket/      # WebSocket handlers
│   ├── app.js          # Express app setup
│   └── server.js       # Server entry point
├── migrations/         # Database migrations
├── seeders/           # Database seeders
└── tests/             # Test files
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

GPL-2.0
