import { connect, StringCodec, NatsConnection } from 'nats'
import { NATS_SUBJECTS, TaskCreatedEvent, TaskUpdatedEvent, TaskDeletedEvent } from '@repo/shared'

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222'
const sc = StringCodec()

let nc: NatsConnection

async function connectNats() {
  console.log(`🔌 Connecting to NATS at ${NATS_URL}...`)
  nc = await connect({ servers: NATS_URL })
  console.log('✅ Connected to NATS\n')
}

async function publish<T>(subject: string, data: T) {
  const json = JSON.stringify(data)
  nc.publish(subject, sc.encode(json))
  console.log(`📤 Published to ${subject}:`)
  console.log(JSON.stringify(data, null, 2))
  console.log('')
}

async function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function testCreateTask() {
  console.log('='.repeat(60))
  console.log('📝 TEST 1: Create Task')
  console.log('='.repeat(60) + '\n')

  const event: TaskCreatedEvent = {
    correlationId: `test-create-${Date.now()}`,
    task: {
      id: `demo-${Date.now()}`,
      title: 'Demo Task from NATS',
      description:
        'This task was created via NATS pub/sub to demonstrate the event-driven architecture.',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }

  await publish(NATS_SUBJECTS.TASK_CREATED, event)
  console.log('⏳ Waiting 2s for microservice to process...\n')
  await wait(2000)

  return event.task.id
}

async function testUpdateTask(taskId: string) {
  console.log('='.repeat(60))
  console.log('✏️ TEST 2: Update Task')
  console.log('='.repeat(60) + '\n')

  const event: TaskUpdatedEvent = {
    correlationId: `test-update-${Date.now()}`,
    id: taskId,
    updates: {
      status: 'in_progress',
      title: 'Demo Task (Updated)',
      description: 'Task status changed to in_progress via NATS update event.',
    },
  }

  await publish(NATS_SUBJECTS.TASK_UPDATED, event)
  console.log('⏳ Waiting 2s for microservice to process...\n')
  await wait(2000)
}

async function testDeleteTask(taskId: string) {
  console.log('='.repeat(60))
  console.log('🗑️ TEST 3: Delete Task')
  console.log('='.repeat(60) + '\n')

  const event: TaskDeletedEvent = {
    correlationId: `test-delete-${Date.now()}`,
    id: taskId,
  }

  await publish(NATS_SUBJECTS.TASK_DELETED, event)
  console.log('⏳ Waiting 2s for microservice to process...\n')
  await wait(2000)
}

async function runFullDemo() {
  console.log('\n🎬 NATS Event Flow Demo')
  console.log('========================\n')
  console.log('This demo will:')
  console.log('  1. Create a new task')
  console.log('  2. Update the task (change status to in_progress)')
  console.log('  3. Delete the task')
  console.log('\nMake sure:')
  console.log('  - NATS server is running (npm run nats:start)')
  console.log('  - Microservice is running (npm run dev:microservice)')
  console.log('  - Worker is running (npm run dev:worker)\n')

  await connectNats()

  const taskId = await testCreateTask()
  console.log(`🔗 View task at: http://localhost:8787/tasks/${taskId}\n`)

  await testUpdateTask(taskId)
  console.log(`🔗 Refresh to see update: http://localhost:8787/tasks/${taskId}\n`)

  await testDeleteTask(taskId)
  console.log('🔗 Task should be deleted. Refresh task list: http://localhost:8787/\n')

  console.log('='.repeat(60))
  console.log('✅ Demo Complete!')
  console.log('='.repeat(60))

  await nc.drain()
}

async function createSampleTasks() {
  console.log('\n🎬 Creating Sample Tasks')
  console.log('========================\n')

  await connectNats()

  const tasks = [
    {
      id: 'sample-001',
      title: 'Setup Development Environment',
      description: 'Install Node.js, configure IDE, and clone the repository.',
      status: 'completed' as const,
    },
    {
      id: 'sample-002',
      title: 'Implement User Authentication',
      description: 'Add JWT-based authentication with refresh tokens.',
      status: 'in_progress' as const,
    },
    {
      id: 'sample-003',
      title: 'Design Database Schema',
      description: 'Create ERD and define table relationships for the task management system.',
      status: 'pending' as const,
    },
    {
      id: 'sample-004',
      title: 'Write API Documentation',
      description: 'Document all REST endpoints using OpenAPI specification.',
      status: 'pending' as const,
    },
  ]

  for (const task of tasks) {
    const event: TaskCreatedEvent = {
      correlationId: `seed-${task.id}`,
      task: {
        ...task,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    }
    await publish(NATS_SUBJECTS.TASK_CREATED, event)
    await wait(500)
  }

  console.log('\n✅ Sample tasks created! View at: http://localhost:8787/\n')
  await nc.drain()
}

const command = process.argv[2]

if (command === 'seed') {
  createSampleTasks().catch(console.error)
} else if (command === 'demo') {
  runFullDemo().catch(console.error)
} else {
  console.log('Usage:')
  console.log('  npx ts-node scripts/test-nats-flow.ts seed  - Create sample tasks')
  console.log('  npx ts-node scripts/test-nats-flow.ts demo  - Run full CRUD demo')
}
