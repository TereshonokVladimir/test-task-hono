import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { connect, NatsConnection, Subscription, StringCodec, Events } from 'nats'

type MessageHandler = (data: unknown, correlationId: string) => Promise<void>
type ErrorHandler = (error: Error, data: unknown, correlationId: string) => Promise<void>

interface SubscribeOptions {
  onError?: ErrorHandler
}

@Injectable()
export class NatsService implements OnModuleInit, OnModuleDestroy {
  private connection: NatsConnection | null = null
  private subscriptions: Subscription[] = []
  private readonly logger = new Logger(NatsService.name)
  private readonly codec = StringCodec()
  private isShuttingDown = false

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const url = this.config.get<string>('NATS_URL', 'nats://localhost:4222')

    this.connection = await connect({
      servers: url,
      reconnect: true,
      maxReconnectAttempts: 10,
      reconnectTimeWait: 2000,
      timeout: 10000,
    })

    this.logger.log(`Connected to NATS at ${url}`)
    this.monitorConnection()
  }

  async onModuleDestroy() {
    this.isShuttingDown = true
    this.logger.log('Shutting down NATS...')

    await Promise.all(this.subscriptions.map(sub => sub.drain()))

    if (this.connection) {
      await this.connection.drain()
      this.logger.log('NATS disconnected')
    }
  }

  async subscribe(
    subject: string,
    handler: MessageHandler,
    options: SubscribeOptions = {}
  ): Promise<void> {
    if (!this.connection) throw new Error('NATS not connected')

    const subscription = this.connection.subscribe(subject, { queue: 'tasks-service' })
    this.subscriptions.push(subscription)
    this.logger.log(`Subscribed to ${subject}`)

    this.processMessages(subscription, subject, handler, options.onError)
  }

  isConnected(): boolean {
    return this.connection !== null && !this.connection.isClosed()
  }

  private async monitorConnection() {
    if (!this.connection) return

    for await (const status of this.connection.status()) {
      if (this.isShuttingDown) break

      const handlers: Record<string, () => void> = {
        [Events.Reconnect]: () => this.logger.log('Reconnected to NATS'),
        [Events.Disconnect]: () => this.logger.warn('Disconnected from NATS'),
        [Events.Error]: () => this.logger.error(`NATS error: ${status.data}`),
      }

      handlers[status.type]?.()
    }
  }

  private async processMessages(
    subscription: Subscription,
    subject: string,
    handler: MessageHandler,
    onError?: ErrorHandler
  ): Promise<void> {
    for await (const msg of subscription) {
      if (this.isShuttingDown) break

      const start = Date.now()
      let correlationId = 'unknown'
      let parsedData: unknown = null

      try {
        const payload = this.codec.decode(msg.data)
        parsedData = JSON.parse(payload)
        correlationId = (parsedData as Record<string, unknown>)?.correlationId as string || crypto.randomUUID()

        this.logger.log(`[${correlationId}] Received on ${subject}`)
        await handler(parsedData, correlationId)
        this.logger.log(`[${correlationId}] Processed in ${Date.now() - start}ms`)
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error))
        this.logger.error(`[${correlationId}] Error on ${subject}: ${err.message}`)

        if (onError) {
          try {
            await onError(err, parsedData, correlationId)
          } catch (dlqError) {
            this.logger.error(`[${correlationId}] DLQ handler failed: ${dlqError}`)
          }
        }
      }
    }
  }
}
