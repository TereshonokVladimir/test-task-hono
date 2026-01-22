import { Module, OnModuleInit, Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import { TaskRepository } from './repositories'
import { EventDispatcherService } from './services'
import { TaskCreatedHandler, TaskUpdatedHandler, TaskDeletedHandler } from './handlers'
import type { EventHandler } from './handlers'

const EVENT_HANDLERS: Type<EventHandler<unknown>>[] = [
  TaskCreatedHandler,
  TaskUpdatedHandler,
  TaskDeletedHandler,
]

@Module({
  providers: [TaskRepository, EventDispatcherService, ...EVENT_HANDLERS],
})
export class TasksModule implements OnModuleInit {
  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly dispatcher: EventDispatcherService
  ) {}

  async onModuleInit() {
    EVENT_HANDLERS.map(Handler => this.moduleRef.get(Handler, { strict: false })).forEach(handler =>
      this.dispatcher.registerHandler(handler)
    )

    await this.dispatcher.initialize()
  }
}
