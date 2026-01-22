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
- **ESLint + Prettier** for code quality
- **CI/CD Pipeline** with GitHub Actions
- **Task CLI** for easy testing

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
│  │  • GET /health     → Health check                               │    │
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
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │ Subscribe
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                           NATS SERVER                                    │
│                      (nats://localhost:4222)                             │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  Subjects: tasks.created | tasks.updated | tasks.deleted        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                     ▲
                                     │ Publish
                                     │
┌─────────────────────────────────────────────────────────────────────────┐
│                    CLI / External System / Producer                      │
│               npm run task:create / npm run local:create                 │
└─────────────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker (for NATS)
- Cloudflare account with KV namespace (for production)

### 1. Clone & Install

```bash
git clone <repo-url>
cd hono-nestjs-nats-kv
npm install
```

### 2. Start Services

```bash
# Terminal 1: Start NATS
npm run nats:start

# Terminal 2: Start Worker (http://localhost:8787)
npm run dev:worker

# Terminal 3: Start Microservice (http://localhost:3001)
npm run dev:microservice
```

### 3. Seed Demo Data

```bash
# Add sample tasks to local KV
npm run local:create -- demo-1 "Setup Project" "Initialize the repository" completed
npm run local:create -- demo-2 "Implement Features" "Build core functionality" in_progress
npm run local:create -- demo-3 "Write Tests" "Add unit tests" pending
```

### 4. Open Browser

Visit http://localhost:8787 to see tasks!

---

## 📋 Task CLI

### Local Task CLI (for development)

Works directly with local KV storage:

```bash
# Create task
npm run local:create -- <id> <title> <description> [status]
npm run local:create -- task-1 "Fix Bug" "Fix login issue" pending

# Update task
npm run local:update -- <id> <title> <description> <status>
npm run local:update -- task-1 "Bug Fixed" "Login working" completed

# Delete task
npm run local:delete -- <id>
npm run local:delete -- task-1

# List all keys
npm run local:list

# Help
npm run local:task
```

### NATS Event CLI (for production)

Publishes events to NATS (requires Cloudflare credentials):

```bash
# Create task
npm run task:create -- "Task Title" "Description" pending

# Update task
npm run task:update -- task-123 --status=completed --title="New Title"

# Delete task
npm run task:delete -- task-123

# Help
npm run task:help
```

### Status Values

`pending` | `in_progress` | `completed` | `cancelled`

---

## 🌐 API Endpoints

### Web Pages (SSR)

| Route | Description |
|-------|-------------|
| `GET /` | Task list page |
| `GET /tasks/:id` | Task detail page |

### REST API

| Route | Description |
|-------|-------------|
| `GET /api/tasks` | List all tasks |
| `GET /api/tasks?status=pending` | Filter by status |
| `GET /api/tasks?offset=0&limit=10` | Pagination |
| `GET /api/tasks/:id` | Get single task |
| `GET /health` | Health check |

### Examples

```bash
# List all tasks
curl http://localhost:8787/api/tasks | jq

# Filter by status
curl "http://localhost:8787/api/tasks?status=in_progress" | jq

# Get single task
curl http://localhost:8787/api/tasks/demo-1 | jq

# Health check
curl http://localhost:8787/health
curl http://localhost:3001/health
```

---

## 🔧 Development

### Scripts

```bash
# Development
npm run dev:worker        # Start worker locally
npm run dev:microservice  # Start microservice locally
npm run nats:start        # Start NATS server
npm run nats:stop         # Stop NATS server

# Code Quality
npm run lint              # Run ESLint
npm run lint:fix          # Fix ESLint errors
npm run format            # Format with Prettier
npm run format:check      # Check formatting
npm run typecheck         # TypeScript check
npm run test              # Run all tests
npm run validate          # Run all checks

# Build & Deploy
npm run build             # Build all packages
npm run deploy:worker     # Deploy to Cloudflare
```

### Code Quality

The project uses:
- **ESLint** with TypeScript support
- **Prettier** for formatting (no semicolons, single quotes)
- **TypeScript** strict mode

```bash
# Run all quality checks
npm run validate
```

---

## 🚢 CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/ci.yml`):

```yaml
Jobs:
  ├── lint      # ESLint check
  ├── format    # Prettier check
  ├── typecheck # TypeScript check
  ├── test      # Jest tests
  ├── build     # Build all packages
  └── deploy    # Deploy to Cloudflare (disabled by default)
```

The pipeline runs on:
- Push to `main`
- Pull requests to `main`

### Enable Cloudflare Deployment

Deploy is **disabled by default**. To enable:

1. **Add GitHub Secret:**
   - Go to repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `CLOUDFLARE_API_TOKEN`
   - Value: Your Cloudflare API token (with Workers edit permission)

2. **Update `apps/worker/wrangler.toml`:**
   ```toml
   [[kv_namespaces]]
   binding = "TASKS_KV"
   id = "your_real_kv_namespace_id"
   preview_id = "your_real_kv_preview_id"
   ```

3. **Enable deploy job in `.github/workflows/ci.yml`:**
   ```yaml
   # Change this line:
   if: false  # Disabled until Cloudflare credentials are configured
   
   # To this:
   if: github.ref == 'refs/heads/main' && github.event_name == 'push'
   ```

4. **Push changes** — deploy will run automatically on main branch

---

## ⚙️ Configuration

### Worker (apps/worker/wrangler.toml)

```toml
[[kv_namespaces]]
binding = "TASKS_KV"
id = "YOUR_KV_NAMESPACE_ID"
preview_id = "YOUR_KV_PREVIEW_NAMESPACE_ID"
```

### Microservice (apps/microservice/.env)

```bash
NATS_URL=nats://localhost:4222
CF_ACCOUNT_ID=your_account_id
CF_NAMESPACE_ID=your_namespace_id
CF_API_TOKEN=your_api_token
HTTP_TIMEOUT_MS=5000
```

---

## 🔄 Retry & Backoff

KV writes use exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | — |
| 2 | 1s |
| 3 | 3s |
| 4 | 10s |
| 5 | 20s |

Max 5 attempts with full logging.

---

## 📁 Project Structure

```
.
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD
├── apps/
│   ├── worker/                 # Hono Cloudflare Worker
│   │   ├── src/
│   │   │   ├── components/     # React SSR components
│   │   │   ├── middleware/     # Correlation ID middleware
│   │   │   ├── services/       # KV service
│   │   │   ├── styles/         # CSS-in-JS styles
│   │   │   ├── utils/          # Date formatters
│   │   │   └── index.tsx       # Main app entry
│   │   └── wrangler.toml
│   │
│   └── microservice/           # NestJS + Bun microservice
│       ├── src/
│       │   ├── nats/           # NATS connection
│       │   ├── cloudflare-kv/  # KV REST API + retry
│       │   ├── tasks/
│       │   │   ├── handlers/   # Event handlers
│       │   │   ├── repositories/
│       │   │   └── services/
│       │   └── common/         # Shared utilities
│       └── .env.example
│
├── packages/
│   └── shared/                 # Shared types & validation
│       └── src/
│           └── index.ts        # Zod schemas, types
│
├── scripts/
│   ├── task-cli.ts             # NATS event CLI
│   ├── local-task-cli.sh       # Local KV CLI
│   ├── seed-kv.ts              # Seed script
│   └── test-nats-flow.ts       # Demo script
│
├── .eslintrc.js                # ESLint config
├── .prettierrc                 # Prettier config
├── docker-compose.yml          # NATS server
└── package.json                # Workspace root
```

---

## 🎬 Demo Flow

### 1. Setup

```bash
npm run nats:start
npm run dev:worker
npm run dev:microservice
```

### 2. Create Tasks

```bash
npm run local:create -- task-1 "Setup CI/CD" "Configure GitHub Actions" completed
npm run local:create -- task-2 "Write Tests" "Add unit tests" in_progress
npm run local:create -- task-3 "Deploy" "Deploy to production" pending
```

### 3. View

Open http://localhost:8787

### 4. Update

```bash
npm run local:update -- task-3 "Deployed!" "Successfully deployed" completed
```

### 5. Delete

```bash
npm run local:delete -- task-1
```

---

## 📋 NATS Event Contracts

### tasks.created

```json
{
  "correlationId": "uuid-v4",
  "task": {
    "id": "task-123",
    "title": "My Task",
    "description": "Description",
    "status": "pending",
    "createdAt": "2026-01-22T00:00:00.000Z",
    "updatedAt": "2026-01-22T00:00:00.000Z"
  }
}
```

### tasks.updated

```json
{
  "correlationId": "uuid-v4",
  "id": "task-123",
  "updates": {
    "title": "New Title",
    "status": "completed"
  }
}
```

### tasks.deleted

```json
{
  "correlationId": "uuid-v4",
  "id": "task-123"
}
```

---

## 📝 License

MIT
