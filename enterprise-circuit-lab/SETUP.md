# Circuit Lab Enterprise - Setup Guide

## Phase 1.0: Infrastructure Scaffolding ✅ COMPLETE

This document describes the setup process for the Enterprise Circuit Lab monorepo.

## Prerequisites

- **Node.js**: v20 or higher
- **pnpm**: v9 or higher (`npm install -g pnpm`)
- **Docker & Docker Compose**: Latest version
- **Git**: For version control

## Quick Start

### 1. Install Dependencies

```bash
# Install all dependencies across the monorepo
pnpm install
```

### 2. Start Infrastructure Services

```bash
# Start PostgreSQL, Redis, and MinIO
pnpm docker:up

# Verify services are running
docker compose ps
```

Expected output:
```
NAME                        STATUS
circuit-lab-postgres        Up (healthy)
circuit-lab-redis           Up (healthy)
circuit-lab-minio           Up (healthy)
```

### 3. Initialize Database

```bash
# Run database initialization script
docker exec circuit-lab-postgres psql -U circuitlab -d circuitlab -f /docker-entrypoint-initdb.d/init.sql
```

This creates:
- Database schema (users, orgs, projects, compile_jobs, etc.)
- Seed data (demo user, demo org, blink example project)

### 4. Configure Environment

```bash
# API environment
cp apps/api/.env.example apps/api/.env

# Web environment
cp apps/web/.env.example apps/web/.env
```

Edit the `.env` files if needed (defaults work for local development).

### 5. Build Packages

```bash
# Build all packages
pnpm build
```

This compiles:
- `@circuit-lab/sim-core` - Circuit simulation engine
- `@circuit-lab/render-webgl` - PixiJS renderer
- `@circuit-lab/avr-runtime` - AVR emulator runtime
- `@circuit-lab/ui` - Shared React components

### 6. Start Development Servers

```bash
# Start all apps in dev mode
pnpm dev
```

This starts:
- **API**: http://localhost:3001 (NestJS backend)
- **Web**: http://localhost:3000 (Next.js frontend)

## Verify Installation

### Check API Health

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development",
  "services": {
    "database": "connected",
    "redis": "connected",
    "minio": "connected"
  }
}
```

### Access MinIO Console

Open http://localhost:9001
- Username: `minioadmin`
- Password: `minioadmin`

### Access Web App

Open http://localhost:3000

You should see the Circuit Lab Enterprise landing page.

## Demo User Login

Use these credentials to test authentication:

- Email: `demo@circuitlab.dev`
- Password: `demo123`

## Database Access

```bash
# Connect to PostgreSQL
docker exec -it circuit-lab-postgres psql -U circuitlab -d circuitlab

# Useful queries
SELECT * FROM users;
SELECT * FROM orgs;
SELECT * FROM projects;
SELECT * FROM project_versions;
```

## Redis CLI

```bash
# Connect to Redis
docker exec -it circuit-lab-redis redis-cli

# Check keys
KEYS *
```

## Architecture Overview

```
enterprise-circuit-lab/
├── apps/
│   ├── api/              # NestJS backend (port 3001)
│   ├── web/              # Next.js frontend (port 3000)
│   └── worker-compile/   # [TODO Phase 1.2] BullMQ compile worker
├── packages/
│   ├── sim-core/         # [TODO Phase 1.4] Circuit simulation
│   ├── render-webgl/     # [TODO Phase 1.5] PixiJS renderer
│   ├── avr-runtime/      # [TODO Phase 1.3] AVR emulator
│   └── ui/               # Shared React components
├── docker/
│   └── init-db.sql       # Database schema + seed data
├── docker-compose.yml    # Infrastructure services
└── turbo.json            # Monorepo build configuration
```

## Development Workflow

### Running Individual Apps

```bash
# API only
cd apps/api && pnpm dev

# Web only
cd apps/web && pnpm dev
```

### Building for Production

```bash
# Build all
pnpm build

# Start production servers
cd apps/api && pnpm start:prod
cd apps/web && pnpm start
```

### Running Tests

```bash
# Run all tests
pnpm test

# Test specific package
cd packages/sim-core && pnpm test
```

## Troubleshooting

### Port Conflicts

If ports 3000, 3001, 5432, 6379, 9000, or 9001 are in use:

```bash
# Check what's using a port
lsof -i :3000

# Stop Circuit Lab services
docker compose down

# Change ports in docker-compose.yml and .env files
```

### Database Connection Issues

```bash
# Check Postgres logs
docker compose logs postgres

# Restart Postgres
docker compose restart postgres

# Reset database (WARNING: Deletes all data!)
docker compose down -v
docker compose up -d
docker exec circuit-lab-postgres psql -U circuitlab -d circuitlab -f /docker-entrypoint-initdb.d/init.sql
```

### MinIO Connection Issues

```bash
# Check MinIO logs
docker compose logs minio

# Verify bucket exists
docker exec circuit-lab-minio mc ls local/
```

## Next Steps

After setup is complete, proceed with implementation phases:

### ✅ Phase 1.0: Infrastructure (COMPLETE)
- Monorepo structure
- Docker services
- Database schema
- API & Web scaffolding

### 🔄 Phase 1.1: Auth + Org + Projects (NEXT)
- Implement auth endpoints (register, login, JWT)
- Org management (create, list, add members)
- Project CRUD with versions
- RBAC enforcement

### ⏳ Phase 1.2: Compile Pipeline
- BullMQ worker service
- Docker sandbox for arduino-cli
- MinIO artifact storage
- WebSocket progress updates

### ⏳ Phase 1.3: AVR Runtime
- AVR8js WASM integration
- GPIO/PWM/UART bridges
- Serial monitor connection

### ⏳ Phase 1.4: Circuit Engine
- Netlist builder
- Digital propagation
- Component behaviors

### ⏳ Phase 1.5: WebGL Renderer
- PixiJS scene graph
- Tinkercad-quality assets
- 60fps flow animation

## Support

For issues or questions:
- Check README.md for architecture details
- Review code comments in source files
- See package-specific documentation in `packages/*/README.md`

---

**Status**: Phase 1.0 Complete - Ready for Phase 1.1 implementation
