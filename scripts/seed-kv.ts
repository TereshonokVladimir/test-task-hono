import { Task, TaskStatus, getTaskKey } from '@repo/shared'

const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID
const CF_NAMESPACE_ID = process.env.CF_NAMESPACE_ID
const CF_API_TOKEN = process.env.CF_API_TOKEN

const mockTasks: Task[] = [
  {
    id: 'task-001',
    title: 'Setup CI/CD Pipeline',
    description:
      'Configure GitHub Actions workflow for automated testing, linting, and deployment to Cloudflare Workers.',
    status: 'completed' as TaskStatus,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-002',
    title: 'Implement NATS Event Handlers',
    description:
      'Create handlers for tasks.created, tasks.updated, and tasks.deleted NATS subjects with proper validation.',
    status: 'completed' as TaskStatus,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-003',
    title: 'Add Retry Logic for KV Writes',
    description:
      'Implement exponential backoff retry mechanism for Cloudflare KV API calls with configurable delays.',
    status: 'in_progress' as TaskStatus,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-004',
    title: 'Design Dark Theme UI',
    description:
      'Create a modern dark theme with CSS custom properties, proper spacing scale, and accessible color contrast.',
    status: 'in_progress' as TaskStatus,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-005',
    title: 'Write Unit Tests',
    description:
      'Add Jest tests for retry service, validation schemas, and event handlers with good coverage.',
    status: 'pending' as TaskStatus,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-006',
    title: 'Add Observability',
    description:
      'Implement X-Correlation-Id propagation across all services and structured logging for debugging.',
    status: 'pending' as TaskStatus,
    createdAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-007',
    title: 'Documentation',
    description:
      'Write comprehensive README with architecture overview, runbook, and API documentation.',
    status: 'cancelled' as TaskStatus,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

async function seedCloudflareKV() {
  if (!CF_ACCOUNT_ID || !CF_NAMESPACE_ID || !CF_API_TOKEN) {
    console.error(
      '❌ Missing Cloudflare credentials. Set CF_ACCOUNT_ID, CF_NAMESPACE_ID, CF_API_TOKEN'
    )
    console.log('\n📝 Running in local mode - outputting mock data for manual testing...\n')
    printLocalInstructions()
    return
  }

  console.log('🚀 Seeding Cloudflare KV with mock tasks...\n')

  for (const task of mockTasks) {
    const key = getTaskKey(task.id)
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/storage/kv/namespaces/${CF_NAMESPACE_ID}/values/${key}`

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${CF_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })

    if (response.ok) {
      console.log(`✅ ${task.id}: ${task.title} (${task.status})`)
    } else {
      const error = await response.text()
      console.error(`❌ Failed to seed ${task.id}: ${error}`)
    }
  }

  console.log('\n✨ Seeding complete!')
}

function printLocalInstructions() {
  console.log('📦 Mock Tasks Data:\n')
  console.log(JSON.stringify(mockTasks, null, 2))
  console.log('\n' + '='.repeat(60))
  console.log('\n🔧 To seed local KV (wrangler dev), use wrangler CLI:\n')

  mockTasks.forEach(task => {
    const key = getTaskKey(task.id)
    console.log(`wrangler kv:key put --binding=TASKS_KV "${key}" '${JSON.stringify(task)}'`)
  })

  console.log('\n' + '='.repeat(60))
  console.log('\n📡 Or publish via NATS (requires NATS server running):\n')

  mockTasks.forEach(task => {
    const event = {
      correlationId: `seed-${task.id}`,
      task,
    }
    console.log(`nats pub tasks.created '${JSON.stringify(event)}'`)
  })
}

seedCloudflareKV()
