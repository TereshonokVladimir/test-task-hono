import { Injectable } from '@nestjs/common'
import { BaseEventHandler } from './base.handler'
import { TaskRepository } from '../repositories/task.repository'
import { NATS_SUBJECTS, parseTaskCreatedEvent } from '@repo/shared'
import type { TaskCreatedEvent, Task } from '@repo/shared'
import { LogOperation } from '../../common'

@Injectable()
export class TaskCreatedHandler extends BaseEventHandler<TaskCreatedEvent> {
  readonly subject = NATS_SUBJECTS.TASKS_CREATED

  constructor(private readonly repository: TaskRepository) {
    super()
  }

  validate(data: unknown) {
    return parseTaskCreatedEvent(data)
  }

  @LogOperation('CreateTask')
  async execute(event: TaskCreatedEvent, correlationId: string): Promise<void> {
    const now = new Date().toISOString()
    const task: Task = {
      ...event.data,
      createdAt: now,
      updatedAt: now,
    }
    await this.repository.save(task, correlationId)
  }
}
