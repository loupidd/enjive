# Enjive CMMS

Enterprise-grade **Computerized Maintenance Management System** built with a modern full-stack monorepo architecture.

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Vue 3 · Vite · TypeScript · Pinia · Vue Router · TailwindCSS |
| Backend    | Node.js · Fastify · Prisma ORM      |
| Database   | MySQL 8                             |
| DevOps     | Docker · docker-compose · Nginx     |

---

## Project Structure

```
enjive/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # All models + enums
│   │   └── seed.ts
│   └── src/
│       ├── config/                # env validation, Prisma client
│       ├── controllers/           # Request handlers
│       ├── middlewares/           # Auth, error, logger
│       ├── repositories/          # DB access layer (Prisma)
│       ├── routes/                # Fastify route registration
│       ├── schemas/               # Zod validation schemas
│       ├── services/              # Business logic layer
│       ├── types/                 # Shared types, enums, API helpers
│       ├── utils/                 # Storage abstraction
│       └── server.ts              # Fastify bootstrap
├── frontend/
│   └── src/
│       ├── assets/                # Global CSS (Tailwind)
│       ├── components/
│       │   ├── common/            # StatusBadge, ProgressBar, BaseModal
│       │   ├── forms/             # EquipmentForm, etc.
│       │   └── layout/            # AppLayout, NavItem
│       ├── composables/           # useEquipment, etc.
│       ├── pages/                 # One folder per module
│       ├── router/                # Vue Router + route guards
│       ├── stores/                # Pinia stores
│       ├── types/                 # TypeScript interfaces
│       └── utils/                 # Axios client
├── nginx/                         # Reverse proxy config
├── docker/                        # MySQL init scripts
├── docker-compose.yml
├── .env.example
└── package.json                   # Workspace root
```

---

## Modules

| Module          | Backend Routes             | Frontend Page          |
|-----------------|----------------------------|------------------------|
| Auth            | `/api/v1/auth`             | `/login`               |
| Users           | `/api/v1/users`            | `/users`               |
| Equipment       | `/api/v1/equipment`        | `/equipment`           |
| Activities      | `/api/v1/activities`       | `/activities`          |
| Schedule        | `/api/v1/schedules`        | `/schedule`            |
| Work Orders     | `/api/v1/work-orders`      | `/work-orders`         |
| Work Reports    | `/api/v1/work-reports`     | `/reports`             |
| Trouble Reports | `/api/v1/trouble-reports`  | `/trouble`             |
| Dashboard       | `/api/v1/dashboard`        | `/dashboard`           |

---

## Getting Started

### Prerequisites

- Docker & docker-compose
- Node.js 20+

### 1. Clone and configure

```bash
git clone <repo>
cd enjive
cp .env.example .env
# Edit .env with your values
```

### 2. Start with Docker

```bash
docker-compose up --build
```

Services:
- Frontend: http://localhost (via Nginx) or http://localhost:5173 (direct)
- Backend API: http://localhost/api/v1 or http://localhost:3000
- MySQL: localhost:3306

### 3. Run migrations & seed

```bash
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

Default admin: `admin@enjive.com` / `Admin@1234`

---

## Architecture

### Backend Layers

```
Request → Route → Middleware (auth/validate) → Controller → Service → Repository → Prisma → MySQL
```

### State Machines

**WorkOrder statuses:**
```
DRAFT → OPEN → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED
                    ↘          ↓            ↓
                   ON_HOLD  ON_HOLD     CANCELLED
```

**TroubleReport statuses:**
```
OPEN → ACKNOWLEDGED → IN_PROGRESS → RESOLVED → CLOSED
  ↘         ↘
REJECTED  REJECTED
```

### Role Hierarchy

```
VIEWER < TECHNICIAN < MANAGER < ADMIN < SUPER_ADMIN
```

---

## API Response Format

All endpoints return:

```json
// Success
{ "success": true, "data": {}, "meta": { "page": 1, "total": 100 }, "message": "..." }

// Error
{ "success": false, "error": { "code": "NOT_FOUND", "message": "...", "details": {} } }
```

---

## File Upload

Storage is abstracted in `backend/src/utils/storage.ts`.  
Set `UPLOAD_DRIVER=local` (default) or `UPLOAD_DRIVER=s3` in `.env`.  
S3 driver stub is ready for implementation.

---

## Development (without Docker)

```bash
# Install all workspaces
npm install

# Backend
cd backend
cp ../.env.example ../.env
npm run db:generate
npm run dev

# Frontend (separate terminal)
cd frontend
npm run dev
```
