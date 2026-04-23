# Docker Quick Start Guide

## Prerequisites
- Docker & Docker Compose installed
- `.env` file configured (copy from `.env.example`)

## Development Setup

### 1. Create `.env` file:
```bash
cp .env.example .env
```

Update these in `.env`:
- `OPENAI_API_KEY` - Your OpenAI API key
- `GOOGLE_API_KEY` - Your Google API key  
- `JWT_SECRET` - Your JWT secret (change from default)

### 2. Start all services:
```bash
docker-compose up -d
```

This starts:
- PostgreSQL (port 5432)
- Redis (port 6379)
- API (port 4000)
- Web (port 3000)
- LangChain (port 8000)

### 3. Run database migrations:
```bash
docker-compose exec api npx prisma migrate deploy
```

### 4. Verify services are running:
```bash
docker-compose ps
```

## Common Commands

### View logs:
```bash
docker-compose logs -f api      # API logs
docker-compose logs -f web      # Web logs
docker-compose logs -f langchain # LangChain logs
```

### Stop services:
```bash
docker-compose down
```

### Rebuild images:
```bash
docker-compose up --build
```

### Delete all data:
```bash
docker-compose down -v
```

## Production Build

### Build production images with NODE_ENV=production:
```bash
docker build --build-arg NODE_ENV=production -t trader-api:latest ./apps/api
docker build --build-arg NODE_ENV=production -t trader-web:latest ./apps/web
docker build --build-arg NODE_ENV=production -t trader-langchain:latest ./apps/langchain-service
```

### Run production container:
```bash
docker run -e DATABASE_URL=... -e REDIS_URL=... -p 4000:4000 trader-api:latest
```

## Troubleshooting

### Database connection fails:
```bash
# Check if PostgreSQL is healthy
docker-compose ps
# Restart PostgreSQL
docker-compose restart postgres
```

### Build fails:
```bash
# Clean and rebuild
docker-compose down -v
docker-compose up --build
```

### Port already in use:
Edit `docker-compose.yml` and change port mappings (e.g., `3001:3000` for Web).
