import { NestFactory } from '@nestjs/core'
import { Logger } from '@nestjs/common'
import { AppModule } from './app.module'
import { NatsService } from './nats/nats.service'

async function bootstrap() {
  const logger = new Logger('Bootstrap')

  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  })

  const nats = app.get(NatsService)

  app.getHttpAdapter().get('/health', (req, res) => {
    const connected = nats.isConnected()
    res.status(connected ? 200 : 503).json({
      status: connected ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: { nats: connected ? 'connected' : 'disconnected' },
    })
  })

  app.getHttpAdapter().get('/ready', (req, res) => {
    const ready = nats.isConnected()
    res.status(ready ? 200 : 503).json({ ready })
  })

  app.enableShutdownHooks()

  const port = process.env.PORT || 3001
  await app.listen(port)

  logger.log(`Microservice running on port ${port}`)
  logger.log(`NATS: ${process.env.NATS_URL || 'nats://localhost:4222'}`)
  logger.log(`Health: http://localhost:${port}/health`)
}

bootstrap().catch(error => {
  console.error('Failed to start:', error)
  process.exit(1)
})
