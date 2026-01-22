import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { correlationIdMiddleware } from './middleware/correlation-id'
import { Layout } from './components/Layout'
import { TaskList } from './components/TaskList'
import { TaskDetail } from './components/TaskDetail'
import { isValidTaskStatus } from '@repo/shared'
import { createTaskRepository, applyFilters, paginate, parseParams } from './services/kv.service'
import type { Env } from './types'

const app = new Hono<{ Bindings: Env }>()

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', correlationIdMiddleware)

app.onError((err, c) => c.json({
  error: 'Internal Server Error',
  message: err.message,
  correlationId: c.get('correlationId'),
}, 500))

app.notFound((c) => c.json({
  error: 'Not Found',
  path: c.req.path,
  correlationId: c.get('correlationId'),
}, 404))

app.get('/health', (c) => c.json({
  status: 'healthy',
  timestamp: new Date().toISOString(),
  service: 'tasks-worker',
}))

app.get('/', async (c) => {
  const repo = createTaskRepository(c.env.TASKS_KV)
  const tasks = await repo.getAll()

  return c.html(
    <Layout title="Tasks">
      <TaskList tasks={tasks} />
    </Layout>
  )
})

app.get('/tasks/:id', async (c) => {
  const repo = createTaskRepository(c.env.TASKS_KV)
  const result = await repo.getById(c.req.param('id'))

  if (!result.ok) {
    return c.html(
      <Layout title="Task Not Found">
        <div class="error-container">
          <h1>Task Not Found</h1>
          <p>The task with ID <code>{c.req.param('id')}</code> does not exist.</p>
          <a href="/" class="back-link">← Back to Tasks</a>
        </div>
      </Layout>,
      404
    )
  }

  return c.html(
    <Layout title={result.data.title}>
      <TaskDetail task={result.data} />
    </Layout>
  )
})

app.get('/api/tasks', async (c) => {
  const params = parseParams((key) => c.req.query(key))

  if (params.status && !isValidTaskStatus(params.status)) {
    return c.json({
      error: 'Invalid status',
      valid: ['pending', 'in_progress', 'completed', 'cancelled'],
      correlationId: c.get('correlationId'),
    }, 400)
  }

  const repo = createTaskRepository(c.env.TASKS_KV)
  const all = await repo.getAll()
  const filtered = applyFilters(all, { status: params.status })
  const { data, hasMore } = paginate(filtered, params.offset, params.limit)

  c.header('Cache-Control', 'public, max-age=5, stale-while-revalidate=10')

  return c.json({
    data,
    meta: {
      total: filtered.length,
      offset: params.offset,
      limit: params.limit,
      hasMore,
      correlationId: c.get('correlationId'),
    },
  })
})

app.get('/api/tasks/:id', async (c) => {
  const repo = createTaskRepository(c.env.TASKS_KV)
  const result = await repo.getById(c.req.param('id'))

  if (!result.ok) {
    return c.json({ error: 'Task not found', correlationId: c.get('correlationId') }, 404)
  }

  return c.json({
    data: result.data,
    meta: { correlationId: c.get('correlationId') },
  })
})

export default app
