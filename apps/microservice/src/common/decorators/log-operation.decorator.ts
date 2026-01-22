import { Logger } from '@nestjs/common'

const loggers = new Map<string, Logger>()

const getLogger = (context: string): Logger => {
  if (!loggers.has(context)) {
    loggers.set(context, new Logger(context))
  }
  return loggers.get(context)!
}

interface LogOperationOptions {
  correlationIdIndex?: number
}

export function LogOperation(operationName?: string, options: LogOperationOptions = {}) {
  const { correlationIdIndex } = options

  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value
    const className = target.constructor.name
    const operation = operationName || propertyKey

    descriptor.value = async function (...args: unknown[]) {
      const logger = getLogger(className)
      const correlationId = correlationIdIndex !== undefined
        ? String(args[correlationIdIndex] || 'unknown')
        : extractCorrelationId(args)
      const startTime = Date.now()

      logger.log(`[${correlationId}] → ${operation}`)

      try {
        const result = await originalMethod.apply(this, args)
        const duration = Date.now() - startTime
        logger.log(`[${correlationId}] ✓ ${operation} (${duration}ms)`)
        return result
      } catch (error) {
        const duration = Date.now() - startTime
        const message = error instanceof Error ? error.message : String(error)
        logger.error(`[${correlationId}] ✗ ${operation} (${duration}ms): ${message}`)
        throw error
      }
    }

    return descriptor
  }
}

function extractCorrelationId(args: unknown[]): string {
  for (const arg of args) {
    if (isUUID(arg)) return arg
    if (typeof arg === 'object' && arg !== null) {
      const obj = arg as Record<string, unknown>
      if (typeof obj.correlationId === 'string') return obj.correlationId
    }
  }
  return 'unknown'
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isUUID(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value)
}
