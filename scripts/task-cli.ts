#!/usr/bin/env npx ts-node

import { connect, StringCodec } from 'nats'
import { NATS_SUBJECTS, Task, TaskStatus } from '@repo/shared'

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222'
const sc = StringCodec()

const generateId = () => `task-${Date.now()}`
const generateCorrelationId = () => `cli-${Date.now()}`

async function createTask(title: string, description: string, status: TaskStatus = 'pending') {
  const nc = await connect({ servers: NATS_URL })
  const id = generateId()
  const now = new Date().toISOString()

  const task: Task = {
    id,
    title,
    description,
    status,
    createdAt: now,
    updatedAt: now,
  }

  const event = {
    correlationId: generateCorrelationId(),
    task,
  }

  nc.publish(NATS_SUBJECTS.TASKS_CREATED, sc.encode(JSON.stringify(event)))
  console.log('✅ Task created!')
  console.log(`   ID: ${id}`)
  console.log(`   Title: ${title}`)
  console.log(`   Status: ${status}`)
  console.log(`   View: http://localhost:8787/tasks/${id}`)

  await nc.drain()
  return id
}

async function updateTask(
  id: string,
  updates: { title?: string; description?: string; status?: TaskStatus }
) {
  const nc = await connect({ servers: NATS_URL })

  const event = {
    correlationId: generateCorrelationId(),
    id,
    updates,
  }

  nc.publish(NATS_SUBJECTS.TASKS_UPDATED, sc.encode(JSON.stringify(event)))
  console.log('✅ Task updated!')
  console.log(`   ID: ${id}`)
  console.log(`   Updates:`, updates)
  console.log(`   View: http://localhost:8787/tasks/${id}`)

  await nc.drain()
}

async function deleteTask(id: string) {
  const nc = await connect({ servers: NATS_URL })

  const event = {
    correlationId: generateCorrelationId(),
    id,
  }

  nc.publish(NATS_SUBJECTS.TASKS_DELETED, sc.encode(JSON.stringify(event)))
  console.log('🗑️ Task deleted!')
  console.log(`   ID: ${id}`)

  await nc.drain()
}

function printHelp() {
  console.log(`
📋 Task CLI - Manage tasks via NATS events

Usage:
  npx ts-node scripts/task-cli.ts <command> [options]

Commands:
  create <title> <description> [status]   Create a new task
  update <id> [--title=X] [--desc=X] [--status=X]   Update existing task
  delete <id>                             Delete a task
  help                                    Show this help

Status values: pending | in_progress | completed | cancelled

Examples:
  # Create a new task
  npx ts-node scripts/task-cli.ts create "Fix bug" "Fix login issue"
  
  # Create with specific status
  npx ts-node scripts/task-cli.ts create "Setup CI" "Configure pipeline" in_progress
  
  # Update task status
  npx ts-node scripts/task-cli.ts update task-123 --status=completed
  
  # Update title and description
  npx ts-node scripts/task-cli.ts update task-123 --title="New Title" --desc="New description"
  
  # Delete a task
  npx ts-node scripts/task-cli.ts delete task-123

Shortcuts (npm scripts):
  npm run task:create "Title" "Description"
  npm run task:update <id> --status=completed
  npm run task:delete <id>
`)
}

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (!command || command === 'help') {
    printHelp()
    return
  }

  try {
    switch (command) {
      case 'create': {
        const title = args[1]
        const description = args[2] || ''
        const status = (args[3] as TaskStatus) || 'pending'

        if (!title) {
          console.error('❌ Error: Title is required')
          console.log('Usage: create <title> <description> [status]')
          process.exit(1)
        }

        await createTask(title, description, status)
        break
      }

      case 'update': {
        const id = args[1]
        if (!id) {
          console.error('❌ Error: Task ID is required')
          process.exit(1)
        }

        const updates: { title?: string; description?: string; status?: TaskStatus } = {}

        for (const arg of args.slice(2)) {
          if (arg.startsWith('--title=')) {
            updates.title = arg.replace('--title=', '')
          } else if (arg.startsWith('--desc=')) {
            updates.description = arg.replace('--desc=', '')
          } else if (arg.startsWith('--status=')) {
            updates.status = arg.replace('--status=', '') as TaskStatus
          }
        }

        if (Object.keys(updates).length === 0) {
          console.error('❌ Error: No updates provided')
          console.log('Usage: update <id> [--title=X] [--desc=X] [--status=X]')
          process.exit(1)
        }

        await updateTask(id, updates)
        break
      }

      case 'delete': {
        const id = args[1]
        if (!id) {
          console.error('❌ Error: Task ID is required')
          process.exit(1)
        }

        await deleteTask(id)
        break
      }

      default:
        console.error(`❌ Unknown command: ${command}`)
        printHelp()
        process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
