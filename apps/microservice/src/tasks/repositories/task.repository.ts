import { Injectable } from '@nestjs/common'
import { CloudflareKvService } from '../../cloudflare-kv/cloudflare-kv.service'
import { getTaskKey } from '@repo/shared'
import type { Task } from '@repo/shared'
import { LogOperation } from '../../common'

export const TASK_REPOSITORY = Symbol('TASK_REPOSITORY')

export interface ITaskRepository {
  findById(id: string, correlationId: string): Promise<Task | null>
  save(task: Task, correlationId: string): Promise<void>
  delete(id: string, correlationId: string): Promise<void>
}

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(private readonly kv: CloudflareKvService) {}

  @LogOperation('Repository.FindById', { correlationIdIndex: 1 })
  async findById(id: string, correlationId: string): Promise<Task | null> {
    return this.kv.get<Task>(getTaskKey(id), correlationId)
  }

  @LogOperation('Repository.Save', { correlationIdIndex: 1 })
  async save(task: Task, correlationId: string): Promise<void> {
    await this.kv.put(getTaskKey(task.id), task, { correlationId })
  }

  @LogOperation('Repository.Delete', { correlationIdIndex: 1 })
  async delete(id: string, correlationId: string): Promise<void> {
    await this.kv.delete(getTaskKey(id), { correlationId })
  }
}
