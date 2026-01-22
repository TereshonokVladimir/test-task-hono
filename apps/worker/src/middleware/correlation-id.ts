import type { MiddlewareHandler } from 'hono'

export const correlationIdMiddleware: MiddlewareHandler = async (c, next) => {
  const correlationId = c.req.header('X-Correlation-Id') || crypto.randomUUID()

  c.set('correlationId', correlationId)
  c.header('X-Correlation-Id', correlationId)

  // Log is handled by hono/logger middleware

  await next()
}
