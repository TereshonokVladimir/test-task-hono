# Hono + NestJS + NATS + Cloudflare KV

A minimal production-minded microservice system with:
- **SSR Web App** (Hono 4.6 on Cloudflare Workers) — read-only task management UI
- **Background Microservice** (NestJS 11 + Bun) — event-driven task processor
- **NATS** 2.10 (core) — message broker for task events
- **Cloudflare KV** — persistent storage
- **Zod** — runtime validation with TypeScript inference

## ✨ Key Features

- **Type-safe validation** with Zod schemas
- **Parallel KV fetching** for optimized performance
- **Queue groups** for horizontal scaling of microservice
- **Graceful shutdown** with proper message draining
- **Health checks** with service status monitoring
- **Secure headers** middleware
- **Cache headers** for API responses

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USER / CLIENT                               │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     CLOUDFLARE WORKERS (Hono SSR)                        │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Routes:                                                         │    │
│  │  • GET /           → SSR Task List Page                         │    │
│  │  • GET /tasks/:id  → SSR Task Detail Page                       │    │
│  │  • GET /api/tasks  → JSON Task List                             │    │
│  │  • GET /api/tasks/:id → JSON Task Detail                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼ READ                                │
│                         ┌─────────────────────┐                          │
│                         │   CLOUDFLARE KV     │                          │
│                         │   (tasks:*)         │                          │
│                         └─────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    ▲
                                    │ WRITE (REST API v4)
                                    │
┌─────────────────────────────────────────────────────────────────────────┐
│                      NESTJS MICROSERVICE (Bun)                           │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  NATS Subscribers:                                               │    │
│  │  • tasks.created  → Create task in KV                           │    │
│  │  • tasks.updated  → Update task in KV (GET + merge + PUT)       │    │
│  │  • tasks.deleted  → Delete task from KV                         │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    ▲                                     │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     │ Subscribe
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                           NATS SERVER                                    │
│                      (nats://localhost:4222)                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Subjects:                                                       │    │
│  │  • tasks.created                                                 │    │
│  │  • tasks.updated                                                 │    │
│  │  • tasks.deleted                                                 │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Publish (CLI / External System)
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                         NATS CLI / Producer                              │
│                    nats pub tasks.created '{...}'                        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🗂️ Data Flow

### Create Task
1. External system publishes to `tasks.created`
2. Microservice receives event, validates payload
3. Microservice writes to Cloudflare KV via REST API (with retry/backoff)
4. User refreshes `/` page to see new task

### Update Task
1. External system publishes to `tasks.updated`
2. Microservice fetches existing task from KV (GET)
3. Merges updates and writes back (PUT with retry/backoff)
4. User refreshes `/tasks/:id` to see updated data

### Delete Task
1. External system publishes to `tasks.deleted`
2. Microservice deletes from KV (DELETE with retry/backoff)
3. User refreshes `/` to confirm task is gone

## 📋 NATS Subjects & Contracts

### `tasks.created`
```json
{
  "correlationId": "uuid-v4",
  "data": {
    "id": "task-123",
    "title": "My Task",
    "description": "Task description",
    "status": "pending" | "in_progress" | "completed" | "cancelled"
  }
}
```

### `tasks.updated`
```json
{
  "correlationId": "uuid-v4",
  "data": {
    "id": "task-123",
    "title": "Updated Title",        // optional
    "description": "New desc",       // optional
    "status": "completed"            // optional
  }
}
```

### `tasks.deleted`
```json
{
  "correlationId": "uuid-v4",
  "data": {
    "id": "task-123"
  }
}
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Bun 1.0+
- Docker (for NATS)
- Cloudflare account with KV namespace
- NATS CLI (optional, for publishing events)

### 1. Clone & Install

```bash
git clone <repo-url>
cd hono-nestjs-nats-kv
npm install
```

### 2. Start NATS Server

```bash
npm run nats:start
# or directly:
docker-compose up -d nats
```

### 3. Configure Cloudflare KV

Create a KV namespace in Cloudflare dashboard:
1. Go to Workers & Pages → KV
2. Create namespace: `tasks-kv`
3. Copy namespace ID

Update `apps/worker/wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "TASKS_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_PREVIEW_NAMESPACE_ID"
```

### 4. Configure Microservice

```bash
cd apps/microservice
cp .env.example .env.local
```

Edit `.env.local`:
```bash
NATS_URL=nats://localhost:4222
CF_ACCOUNT_ID=your_account_id
CF_NAMESPACE_ID=your_namespace_id
CF_API_TOKEN=your_api_token
```

### 5. Run Locally

**Terminal 1 — Worker (development):**
```bash
npm run dev:worker
# Runs at http://localhost:8787
```

**Terminal 2 — Microservice:**
```bash
cd apps/microservice
bun run start:dev
# Runs at http://localhost:3001
```

### 6. Test the Pipeline

**Create a task:**
```bash
nats pub tasks.created '{
  "correlationId": "test-001",
  "data": {
    "id": "task-1",
    "title": "My First Task",
    "description": "This is a test task",
    "status": "pending"
  }
}'
```

**Update the task:**
```bash
nats pub tasks.updated '{
  "correlationId": "test-002",
  "data": {
    "id": "task-1",
    "status": "completed",
    "title": "My First Task (Done!)"
  }
}'
```

**Delete the task:**
```bash
nats pub tasks.deleted '{
  "correlationId": "test-003",
  "data": {
    "id": "task-1"
  }
}'
```

Open http://localhost:8787 and refresh after each command.

## 🌐 Deploy to Cloudflare

### Deploy Worker

```bash
npm run deploy:worker
# or
cd apps/worker && npx wrangler deploy
```

### Deploy Microservice

The microservice needs to run on a server with network access to NATS and Cloudflare API. Options:
- Fly.io
- Railway
- Any VPS with Docker

Example Dockerfile for microservice:
```dockerfile
FROM oven/bun:1
WORKDIR /app
COPY . .
RUN bun install
CMD ["bun", "run", "start:prod"]
```

## 🔄 Retry & Backoff

The microservice implements retry with exponential backoff for KV writes:

| Attempt | Delay |
|---------|-------|
| 1 | — |
| 2 | 1s |
| 3 | 3s |
| 4 | 10s |
| 5 | 20s |
| 6+ | 30s |

Max 5 retry attempts. All attempts are logged with `X-Correlation-Id`.

## 🔍 Observability

### X-Correlation-Id

- Worker: Reads from request header or generates UUID, includes in response
- Microservice: Reads from NATS message payload, logs all operations with it

### Logs

```
[abc-123] 📨 Received message on tasks.created
[abc-123] Processing tasks.created event
[abc-123] PUT tasks:task-1
[abc-123] Attempt 1/5
[abc-123] ✅ PUT tasks:task-1 successful
[abc-123] ✅ Task created: task-1
```

## 🧪 Tests

```bash
# Run all tests
npm test

# Run microservice tests
cd apps/microservice && bun test

# Run specific test file
bun test retry.service.spec.ts
```

## 📁 Project Structure

```
.
├── apps/
│   ├── worker/                  # Hono Cloudflare Worker
│   │   ├── src/
│   │   │   ├── components/      # JSX SSR components
│   │   │   ├── middleware/      # Correlation ID middleware
│   │   │   ├── index.tsx        # Main app entry
│   │   │   └── types.ts         # TypeScript types
│   │   ├── wrangler.toml        # Cloudflare config
│   │   └── package.json
│   │
│   └── microservice/            # NestJS + Bun microservice
│       ├── src/
│       │   ├── nats/            # NATS connection & subscriptions
│       │   ├── cloudflare-kv/   # KV REST API client + retry logic
│       │   ├── tasks/           # Task event handlers
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── .env.example
│       └── package.json
│
├── packages/
│   └── shared/                  # Shared types & validation
│       └── src/
│           └── index.ts
│
├── docker-compose.yml           # NATS server
├── package.json                 # Workspace root
└── README.md
```

## 📝 License

MIT
