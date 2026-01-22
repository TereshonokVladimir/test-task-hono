import { Injectable } from '@nestjs/common'
import { BaseEventHandler } from './base.handler'
import { TaskRepository } from '../repositories/task.repository'
import { NATS_SUBJECTS, parseTaskUpdatedEvent } from '@repo/shared'
import type { TaskUpdatedEvent, Task } from '@repo/shared'
import { LogOperation } from '../../common'

@Injectable()
export class TaskUpdatedHandler extends BaseEventHandler<TaskUpdatedEvent> {
  readonly subject = NATS_SUBJECTS.TASKS_UPDATED

  constructor(private readonly repository: TaskRepository) {
    super()
  }

  validate(data: unknown) {
    return parseTaskUpdatedEvent(data)
  }

  @LogOperation('UpdateTask')
  async execute(event: TaskUpdatedEvent, correlationId: string): Promise<void> {
    const { id, ...updates } = event.data
    const existing = await this.repository.findById(id, correlationId)

    if (!existing) return

    const updated: Task = {
      ...existing,
      ...this.filterDefined(updates),
      updatedAt: new Date().toISOString(),
    }

    await this.repository.save(updated, correlationId)
  }

  private filterDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([, v]) => v !== undefined)
    ) as Partial<T>
  }
}
