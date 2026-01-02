# Circuit Lab - 3D Arduino Circuit Simulator

A production-grade, enterprise-quality 3D Arduino Circuit Simulator comparable to Autodesk Tinkercad Circuits. This simulator provides physically accurate visuals, real Arduino compilation, and high-performance WebGL rendering.

## Features

- **Physically Accurate 3D Rendering**: Three.js WebGL2 with PBR materials, HDRI lighting
- **Real Arduino Compilation**: arduino-cli in Docker sandbox with HEX/ELF output
- **Circuit Simulation Engine**: Event-driven digital simulation with netlist management
- **Live Current Flow Animation**: GPU-instanced particles showing current direction
- **Serial Monitor**: Full UART emulation with TX/RX visualization
- **PWM Support**: Visible LED brightness changes with PWM duty cycle
- **Component Library**: Arduino UNO, Breadboard, LEDs, Resistors, Buttons, and more

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- React 18
- Zustand (State Management)
- Three.js / React Three Fiber
- Monaco Editor (Arduino syntax highlighting)

### Backend
- Node.js / Fastify
- PostgreSQL
- Redis
- BullMQ (Job Queues)
- WebSocket

### Infrastructure
- Docker / docker-compose
- MinIO (S3-compatible storage)
- Arduino CLI (Compilation)

## Project Structure

\`\`\`
circuit-lab/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # Fastify backend
│   └── worker-compile/      # Arduino compile worker
├── packages/
│   ├── sim-core/            # Circuit simulation engine
│   ├── render-webgl/        # Three.js 3D components
│   ├── avr-runtime/         # WASM AVR bridge
│   ├── assets/              # 3D models & textures
│   └── ui/                  # Shared UI components
├── infra/
│   └── docker/              # Dockerfiles
├── qa/                      # QA test pages
├── docker-compose.yml
└── pnpm-workspace.yaml
\`\`\`

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose

### Development

1. Install dependencies:
\`\`\`bash
pnpm install
\`\`\`

2. Start development servers:
\`\`\`bash
pnpm dev
\`\`\`

3. Open http://localhost:3000

### Docker Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## Quality Assurance

Access QA pages at `/qa`:
- `/qa/assets` - 3D asset quality at 100%, 200%, 400% zoom
- `/qa/alignment` - Pin spacing and alignment verification (≤0.25px error)

## Acceptance Criteria

- ✅ Arduino Blink works
- ✅ LED lights correctly
- ✅ PWM visibly changes brightness
- ✅ Wire flow visible
- ✅ Serial output works
- ✅ 60fps maintained
- ✅ Zoom does not blur
- ✅ RBAC enforced
- ✅ Compile sandbox secure

## Component Specifications

### Arduino UNO
- Accurate ATmega328P pin layout
- 68.6mm × 53.4mm dimensions
- 2.54mm (0.1") pin spacing
- All digital, analog, power, and ground pins

### Breadboard
- Full-size (830 tie points) or half-size (400 tie points)
- Proper internal connections modeled
- Split power rails on full-size boards

### Wires
- 3D bezier curves with natural droop
- Current flow particle animation
- Multiple colors available

## License

MIT
