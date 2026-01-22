import { z } from 'zod'

// Task Status enum
export const TaskStatusSchema = z.enum(['pending', 'in_progress', 'completed', 'cancelled'])
export type TaskStatus = z.infer<typeof TaskStatusSchema>

// Task entity
export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(2000),
  status: TaskStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Task = z.infer<typeof TaskSchema>

// NATS Subjects
export const NATS_SUBJECTS = {
  TASKS_CREATED: 'tasks.created',
  TASKS_UPDATED: 'tasks.updated',
  TASKS_DELETED: 'tasks.deleted',
} as const

// NATS Event Schemas
export const TaskCreatedEventSchema = z.object({
  correlationId: z.string().uuid(),
  data: z.object({
    id: z.string().min(1),
    title: z.string().min(1).max(200),
    description: z.string().max(2000),
    status: TaskStatusSchema,
  }),
})

export const TaskUpdatedEventSchema = z.object({
  correlationId: z.string().uuid(),
  data: z.object({
    id: z.string().min(1),
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).optional(),
    status: TaskStatusSchema.optional(),
  }),
})

export const TaskDeletedEventSchema = z.object({
  correlationId: z.string().uuid(),
  data: z.object({
    id: z.string().min(1),
  }),
})

// Types
export type TaskCreatedEvent = z.infer<typeof TaskCreatedEventSchema>
export type TaskUpdatedEvent = z.infer<typeof TaskUpdatedEventSchema>
export type TaskDeletedEvent = z.infer<typeof TaskDeletedEventSchema>

// KV Key helpers
export const KV_PREFIX = 'tasks'

export const getTaskKey = (id: string): string => `${KV_PREFIX}:${id}`

export const parseTaskKey = (key: string): string | null => {
  if (key.startsWith(`${KV_PREFIX}:`)) {
    return key.slice(KV_PREFIX.length + 1)
  }
  return null
}

// Validation helpers with Zod (returns typed result)
export const isValidTaskStatus = (status: string): status is TaskStatus => {
  return TaskStatusSchema.safeParse(status).success
}

export const validateTaskCreatedEvent = (data: unknown): data is TaskCreatedEvent => {
  return TaskCreatedEventSchema.safeParse(data).success
}

export const validateTaskUpdatedEvent = (data: unknown): data is TaskUpdatedEvent => {
  return TaskUpdatedEventSchema.safeParse(data).success
}

export const validateTaskDeletedEvent = (data: unknown): data is TaskDeletedEvent => {
  return TaskDeletedEventSchema.safeParse(data).success
}

// Safe parse functions that return detailed errors
export const parseTaskCreatedEvent = (data: unknown) => {
  return TaskCreatedEventSchema.safeParse(data)
}

export const parseTaskUpdatedEvent = (data: unknown) => {
  return TaskUpdatedEventSchema.safeParse(data)
}

export const parseTaskDeletedEvent = (data: unknown) => {
  return TaskDeletedEventSchema.safeParse(data)
}

// Export Zod for use in apps if needed
export { z }
