# Jahyeon Enterprise SaaS Platform

Full-stack SaaS platform with Zendesk-style live chat, Naver-style blog CMS, and mobile admin app.

## 🏗 Architecture

```
apps/
├── api/        # NestJS Backend (Port 3001)
├── web/        # Next.js 14 Frontend (Port 3000)
└── mobile/     # React Native (Expo)

packages/
├── database/   # Prisma Schema & Client
├── shared/     # Shared Types
└── ui/         # Shared Components
```

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker (optional)

### 1. Database Setup

```bash
cd packages/database
npm install
cp .env.example .env
# Edit DATABASE_URL in .env
npx prisma db push
```

### 2. API Server

```bash
cd apps/api
npm install
cp .env.example .env
# Edit environment variables
npm run dev
```

### 3. Web Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 4. Mobile App

```bash
cd apps/mobile
npm install
npx expo start
```

## 🐳 Docker Deployment

```bash
cd docker
docker-compose up -d
```

## 📱 Features

### Live Chat
- Real-time WebSocket messaging
- Typing indicators
- Read receipts
- File attachments
- Admin assignment

### Blog CMS
- Rich text editor (TipTap)
- Categories & tags
- SEO optimization
- Comment moderation

### Mobile Admin
- Push notifications (FCM)
- Secure token storage
- Offline support
- Multi-device sync

## 🔐 Security

- JWT authentication with refresh tokens
- Device binding
- Rate limiting
- IP logging
- Optional 2FA

## 📄 Environment Variables

### API (.env)
```
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

### Web (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3001
```

## 📦 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | NestJS, Prisma, Socket.io |
| Frontend | Next.js 14, TailwindCSS |
| Mobile | React Native, Expo |
| Database | PostgreSQL, Redis |
| Push | Firebase Cloud Messaging |

---

Built with ❤️ for jahyeon.com
