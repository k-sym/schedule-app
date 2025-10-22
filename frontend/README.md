# Schedule App - Frontend

Frontend web application for the Schedule App entertainment booking management system.

## Tech Stack

- Vue 3 (Composition API)
- Vite
- Pinia (State Management)
- Vue Router
- Axios
- Socket.io Client

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for local development)

### Local Development with Docker

1. Start all services from the project root:
```bash
docker-compose up
```

2. Frontend will be available at `http://localhost:5173`

### Manual Setup (without Docker)

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env if needed
```

3. Start development server:
```bash
npm run dev
```

4. Open browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── src/
│   ├── assets/           # Static assets
│   ├── components/       # Vue components
│   │   ├── common/       # Shared components
│   │   ├── auth/         # Authentication components
│   │   ├── availability/ # Availability components
│   │   ├── schedule/     # Schedule components
│   │   └── admin/        # Admin components
│   ├── views/            # Page components
│   ├── stores/           # Pinia stores
│   ├── composables/      # Composable functions
│   ├── api/              # API client
│   ├── router/           # Vue Router config
│   ├── utils/            # Utility functions
│   ├── App.vue           # Root component
│   └── main.js           # App entry point
├── public/               # Public assets
└── index.html            # HTML entry point
```

## Environment Variables

See `.env.example` for all available environment variables.

## License

GPL-2.0
