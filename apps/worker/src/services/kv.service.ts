import { getTaskKey, KV_PREFIX } from '@repo/shared'
import type { Task, TaskStatus } from '@repo/shared'

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export const createTaskRepository = (kv: KVNamespace) => ({
  async getById(id: string): Promise<Result<Task>> {
    const data = await kv.get(getTaskKey(id))
    return data
      ? { ok: true, data: JSON.parse(data) as Task }
      : { ok: false, error: `Task not found: ${id}` }
  },

  async getAll(): Promise<Task[]> {
    const list = await kv.list({ prefix: `${KV_PREFIX}:` })
    const tasks = await Promise.all(list.keys.map(key => kv.get(key.name).then(parse)))
    return tasks.filter(Boolean).sort(byDateDesc) as Task[]
  },
})

const parse = (data: string | null): Task | null =>
  data ? JSON.parse(data) as Task : null

const byDateDesc = (a: Task | null, b: Task | null): number =>
  a && b ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0

export const applyFilters = (tasks: Task[], filters: { status?: string }): Task[] =>
  filters.status ? tasks.filter(t => t.status === filters.status as TaskStatus) : tasks

export const paginate = <T>(items: T[], offset: number, limit: number) => ({
  data: items.slice(offset, offset + limit),
  hasMore: offset + limit < items.length,
})

export const parseParams = (get: (key: string) => string | undefined) => ({
  status: get('status'),
  offset: clamp(parseInt(get('offset') || '0', 10), 0, Infinity),
  limit: clamp(parseInt(get('limit') || '50', 10), 1, 100),
})

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

export type TaskRepository = ReturnType<typeof createTaskRepository>
