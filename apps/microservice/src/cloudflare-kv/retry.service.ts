import { Injectable, Logger } from '@nestjs/common'

export interface RetryOptions {
  maxAttempts: number
  backoffMs: number[]
  correlationId: string
}

export const DEFAULT_BACKOFF_MS = [1000, 3000, 10000, 20000, 30000]

export const calculateBackoffDelay = (attempt: number, delays: number[]): number =>
  delays[Math.min(attempt - 1, delays.length - 1)]

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms))

type TryResult<T> =
  | { success: true; value: T }
  | { success: false; error: Error }

@Injectable()
export class RetryService {
  private readonly logger = new Logger(RetryService.name)

  async executeWithRetry<T>(operation: () => Promise<T>, options: RetryOptions): Promise<T> {
    const { maxAttempts, backoffMs, correlationId } = options

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      this.logger.log(`[${correlationId}] Attempt ${attempt}/${maxAttempts}`)

      const result = await this.tryOnce(operation)

      if (result.success) {
        if (attempt > 1) {
          this.logger.log(`[${correlationId}] ✅ Succeeded on attempt ${attempt}`)
        }
        return result.value
      }

      if (attempt === maxAttempts) {
        this.logger.error(`[${correlationId}] ❌ All ${maxAttempts} attempts failed`)
        throw result.error
      }

      const delay = calculateBackoffDelay(attempt, backoffMs)
      this.logger.warn(`[${correlationId}] ⚠️ Attempt ${attempt} failed: ${result.error.message}`)
      this.logger.log(`[${correlationId}] ⏳ Retrying in ${delay}ms...`)
      await sleep(delay)
    }

    throw new Error('Unexpected loop exit')
  }

  private async tryOnce<T>(operation: () => Promise<T>): Promise<TryResult<T>> {
    try {
      return { success: true, value: await operation() }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error : new Error(String(error)) }
    }
  }
}
