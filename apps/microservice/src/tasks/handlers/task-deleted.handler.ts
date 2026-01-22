import { Injectable } from '@nestjs/common'
import { BaseEventHandler } from './base.handler'
import { TaskRepository } from '../repositories/task.repository'
import { NATS_SUBJECTS, parseTaskDeletedEvent } from '@repo/shared'
import type { TaskDeletedEvent } from '@repo/shared'
import { LogOperation } from '../../common'

@Injectable()
export class TaskDeletedHandler extends BaseEventHandler<TaskDeletedEvent> {
  readonly subject = NATS_SUBJECTS.TASKS_DELETED

  constructor(private readonly repository: TaskRepository) {
    super()
  }

  validate(data: unknown) {
    return parseTaskDeletedEvent(data)
  }

  @LogOperation('DeleteTask')
  async execute(event: TaskDeletedEvent, correlationId: string): Promise<void> {
    await this.repository.delete(event.data.id, correlationId)
  }
}
