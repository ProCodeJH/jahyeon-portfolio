# Circuit Lab Enterprise

> Enterprise-grade, production-ready Arduino circuit simulator at Tinkercad quality level

## 🎯 Vision

Build a WebGL-powered, photoreal circuit simulator that compiles real Arduino code, executes it in-browser via AVR emulation, simulates digital circuits, and renders beautiful 60fps wire flow animations—all with enterprise RBAC, multi-tenancy, and observability.

## 🏗️ Architecture

### Monorepo Structure

```
circuit-lab-enterprise/
├── apps/
│   ├── web/              # Next.js App Router frontend (TypeScript + WebGL)
│   ├── api/              # NestJS backend API (Auth, Orgs, Projects, Compile)
│   └── worker-compile/   # Arduino compilation worker (BullMQ + Docker sandbox)
├── packages/
│   ├── sim-core/         # Circuit simulation engine (netlist, digital propagation)
│   ├── render-webgl/     # PixiJS renderer (components, wires, flow animation)
│   ├── avr-runtime/      # AVR WASM wrapper (GPIO, PWM, UART bridge)
│   └── ui/               # Shared React components
├── docker/
│   ├── init-db.sql       # Database schema
│   └── arduino-compile/  # Docker image for safe compilation
└── docker-compose.yml    # Local dev environment (Postgres, Redis, MinIO)
```

### Technology Stack

**Frontend:**
- TypeScript + React + Next.js (App Router)
- WebGL rendering via PixiJS (60fps target)
- Monaco Editor for code editing
- Zustand for state management
- WebSocket for real-time updates

**Backend:**
- Node.js + TypeScript (NestJS)
- PostgreSQL (data persistence)
- Redis (BullMQ job queue)
- MinIO (S3-compatible artifact storage)
- Docker (secure compile sandboxes)

**Simulation:**
- Custom digital circuit engine with netlist graph
- AVR emulation via WASM (ATmega328P)
- GPIO, PWM, UART peripheral bridges
- 60fps particle-based flow visualization

## 🚀 Quick Start

### Prerequisites

- Node.js ≥20
- pnpm ≥9
- Docker + Docker Compose

### Setup

```bash
# Install dependencies
pnpm install

# Start infrastructure
pnpm docker:up

# Initialize database (first time)
docker exec circuit-lab-postgres psql -U circuitlab -d circuitlab -f /docker-entrypoint-initdb.d/init.sql

# Start development servers
pnpm dev

# View logs
pnpm docker:logs
```

**Services:**
- Web: http://localhost:3000
- API: http://localhost:3001
- MinIO Console: http://localhost:9001
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## 📊 Database Schema

### Core Tables

**users**
- id, email, password_hash, created_at

**orgs**
- id, name, created_at

**org_members**
- user_id, org_id, role (OWNER|ADMIN|EDITOR|VIEWER)

**projects**
- id, org_id, name, created_by, created_at, updated_at

**project_versions**
- id, project_id, version, content_json, created_at

**compile_jobs**
- id, project_version_id, status, log, artifact_url_hex, artifact_url_elf, artifact_url_map, created_at

**audit_logs**
- id, org_id, actor_user_id, action, target_type, target_id, meta_json, created_at

## 🎨 Visual Fidelity Requirements (Tinkercad-Class)

### Rendering

- **WebGL-first:** All circuit visuals rendered via PixiJS
- **No DOM wires:** Instanced particle rendering for 200+ wires at 60fps
- **High-DPI support:** Crisp at 100% and 200% zoom
- **Photoreal components:** Accurate Arduino UNO, breadboard, sensors with proper silkscreen, shadows, highlights

### Flow Animation (GPU-Optimized)

1. **Idle glow:** Subtle wire presence
2. **Edge pulses:** Packet animation on transitions
3. **PWM streams:** Duty-based particle density
4. **Power flow:** Direction visualization from sources to sinks

**Performance target:** 60fps with 200+ wires on mid-range laptop

### Assets

- Vector/texture-based components (4096px sources)
- Accurate breadboard hole spacing
- Arduino UNO pin-accurate headers (D0-D13, A0-A5, power)
- Real sensor appearances (PIR lens, photoresistor zigzag, etc.)

## 🔒 Security & Enterprise Features

### Multi-Tenancy & RBAC

- Org-based isolation
- Role-based permissions: OWNER → ADMIN → EDITOR → VIEWER
- Row-level security enforcement
- Audit logging for all mutations

### Compile Sandbox

- Arduino CLI in locked-down Docker container
- No network access
- CPU/memory/time limits
- Only write to `/workspace`
- Sanitized error logs

### Observability

- Structured logging (JSON)
- Metrics endpoint (Prometheus-compatible)
- Tracing instrumentation ready
- Health checks on all services

## 🧪 Testing Strategy

### Unit Tests

- `packages/sim-core`: Netlist builder, propagation rules
- `packages/avr-runtime`: GPIO/PWM/UART bridges
- `apps/api`: Auth, RBAC, project CRUD

### Integration Tests

- Database migrations
- API endpoints with auth
- Compile job queue flow

### E2E Smoke Tests

- "Blink" example: compile → run → LED toggle → wire flow animation
- PWM example: brightness + stream density changes
- Serial output verification
- RBAC enforcement

## 📦 Package Details

### `packages/sim-core`

Circuit simulation engine:
- Netlist builder (breadboard hole mapping)
- Digital propagation (LED, button, sensors)
- Pin → net mapping
- Event-driven updates

### `packages/render-webgl`

PixiJS-based renderer:
- Scene graph for components/wires
- Instanced particle system
- Flow animation shaders
- Zoom/pan with crisp rendering

### `packages/avr-runtime`

AVR emulator bridge:
- Load HEX files
- pinMode/digitalRead/digitalWrite
- analogWrite (PWM on pins 3,5,6,9,10,11)
- UART → Serial Monitor
- Execution loop

### `packages/ui`

Shared React components:
- Button, Input, Select, etc.
- Monaco Editor wrapper
- Serial Monitor
- Component palette

## 🛠️ Development Guide

### Adding a New Component

1. Add sprite/texture to `packages/render-webgl/assets/`
2. Define component type in `packages/sim-core/src/types.ts`
3. Implement rendering in `packages/render-webgl/src/components/`
4. Add simulation logic in `packages/sim-core/src/components/`

### Compile Pipeline Flow

```
User clicks "Compile & Run"
  → API creates compile_job
  → Worker picks job from Redis queue
  → Spins up Docker container with sketch
  → Runs arduino-cli compile
  → Uploads HEX/ELF/MAP to MinIO
  → Updates job status via WebSocket
  → Web loads HEX into AVR runtime
  → Simulation starts
```

### Wire Flow Animation

```
Net state change (GPIO toggle)
  → Netlist propagation
  → Emit edge event
  → Spawn pulse particles at driver pins
  → GPU shader animates particles along wire path
  → 60fps render loop
```

## 🚧 Implementation Status

### ✅ Phase 1.0: Repo + Infra (COMPLETE)
- ✅ Monorepo structure with pnpm workspaces
- ✅ Docker Compose (Postgres, Redis, MinIO)
- ✅ Database schema with seed data
- ✅ NestJS API fully scaffolded
  - Auth module (JWT + Passport)
  - Users, Orgs, Projects, Compile modules
  - TypeORM entities and repositories
- ✅ Next.js Web app scaffolded
  - App Router with TypeScript
  - Tailwind CSS configured
  - Landing page ready
- ✅ Package structure complete
  - `@circuit-lab/sim-core` - Circuit simulation types
  - `@circuit-lab/render-webgl` - PixiJS renderer scaffold
  - `@circuit-lab/avr-runtime` - AVR emulator wrapper
  - `@circuit-lab/ui` - Shared React components
- ✅ Turbo.json build orchestration
- ✅ Comprehensive SETUP.md guide

### 🔄 Phase 1.1: Auth + Org + Projects (READY TO START)
- ✅ Database schema complete
- ✅ API scaffolding complete
- ⏳ Test endpoints (register, login, JWT flow)
- ⏳ Implement RBAC guards
- ⏳ Create auth UI pages
- ⏳ Test org/project workflows

### ⏳ Phase 1.2: Compile Pipeline (PLANNED)
- Worker service architecture defined
- Docker sandbox image specification ready
- BullMQ integration pending
- Artifact upload pending

### ⏳ Phase 1.3: AVR Runtime (PLANNED)
- Architecture defined
- WASM wrapper pending
- Peripheral bridges pending

### ⏳ Phase 1.4: Circuit Engine (PLANNED)
- Netlist specification ready
- Propagation engine pending
- Component implementations pending

### ⏳ Phase 1.5: WebGL Renderer (PLANNED)
- PixiJS scene graph pending
- Asset pipeline pending
- Flow animation system pending

## 📝 MVP Acceptance Criteria

- [ ] **Blink Test:** Compiles, runs, LED toggles, wires animate
- [ ] **PWM Test:** Brightness changes, stream density changes, 60fps stable
- [ ] **Serial Test:** Prints appear in monitor
- [ ] **Button Test:** Press changes pin read, flow updates
- [ ] **RBAC Test:** Viewer cannot edit, editor can, admin adds members
- [ ] **Sandbox Test:** Network blocked, times out safely
- [ ] **Visual QA:** Sharp at 100%/200% zoom, perfect pin snapping, no component float

## 🎯 Next Steps

1. **Complete Phase 1.1:** Implement auth + org + projects API
2. **Phase 1.2:** Build compile worker with Docker sandbox
3. **Phase 1.3:** Integrate AVR WASM emulator
4. **Phase 1.4:** Build circuit simulation engine
5. **Phase 1.5:** Implement WebGL renderer + flow animation

## 📚 Resources

- [Arduino CLI](https://arduino.github.io/arduino-cli/)
- [PixiJS Documentation](https://pixijs.com/)
- [AVR8js (AVR emulator)](https://github.com/wokwi/avr8js)
- [BullMQ (Job Queue)](https://docs.bullmq.io/)

## 📄 License

Proprietary - Enterprise License Required

---

**Built with enterprise-grade architecture for production deployment**
