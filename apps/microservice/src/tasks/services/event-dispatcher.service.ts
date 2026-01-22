import { Injectable, Logger } from '@nestjs/common'
import { NatsService } from '../../nats/nats.service'
import type { EventHandler } from '../handlers'

@Injectable()
export class EventDispatcherService {
  private readonly logger = new Logger(EventDispatcherService.name)
  private readonly handlers = new Map<string, EventHandler<unknown>>()
  private initialized = false

  constructor(private readonly nats: NatsService) {}

  registerHandler(handler: EventHandler<unknown>): void {
    this.handlers.set(handler.subject, handler)
  }

  async initialize(): Promise<void> {
    if (this.initialized) return
    this.initialized = true

    const subscriptions = Array.from(this.handlers.entries()).map(([subject, handler]) =>
      this.subscribe(subject, handler)
    )
    await Promise.all(subscriptions)
    this.logger.log(`Subscribed to ${this.handlers.size} subjects`)
  }

  private async subscribe(subject: string, handler: EventHandler<unknown>): Promise<void> {
    await this.nats.subscribe(subject, async (data, correlationId) => {
      await this.dispatch(handler, data, correlationId)
    })
  }

  private async dispatch(
    handler: EventHandler<unknown>,
    data: unknown,
    correlationId: string
  ): Promise<void> {
    const result = handler.validate(data)

    if (!result.success) {
      this.logger.warn(`[${correlationId}] Validation failed: ${result.error?.message}`)
      return
    }

    await handler.execute(result.data, correlationId)
  }
}
