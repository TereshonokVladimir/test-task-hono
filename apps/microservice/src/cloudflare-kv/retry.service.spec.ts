import { RetryService, calculateBackoffDelay, DEFAULT_BACKOFF_MS } from './retry.service'

describe('RetryService', () => {
  let retryService: RetryService

  beforeEach(() => {
    retryService = new RetryService()
  })

  describe('executeWithRetry', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success')

      const result = await retryService.executeWithRetry(operation, {
        maxAttempts: 3,
        backoffMs: [100, 200, 300],
        correlationId: 'test-123',
      })

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(1)
    })

    it('should retry on failure and succeed', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('First fail'))
        .mockRejectedValueOnce(new Error('Second fail'))
        .mockResolvedValue('success')

      const result = await retryService.executeWithRetry(operation, {
        maxAttempts: 5,
        backoffMs: [10, 20, 30],
        correlationId: 'test-456',
      })

      expect(result).toBe('success')
      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should throw after max attempts exceeded', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Always fails'))

      await expect(
        retryService.executeWithRetry(operation, {
          maxAttempts: 3,
          backoffMs: [10, 20, 30],
          correlationId: 'test-789',
        })
      ).rejects.toThrow('Always fails')

      expect(operation).toHaveBeenCalledTimes(3)
    })

    it('should use last backoff value when attempt exceeds array length', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Fail 1'))
        .mockRejectedValueOnce(new Error('Fail 2'))
        .mockRejectedValueOnce(new Error('Fail 3'))
        .mockRejectedValueOnce(new Error('Fail 4'))
        .mockResolvedValue('success')

      const startTime = Date.now()

      await retryService.executeWithRetry(operation, {
        maxAttempts: 5,
        backoffMs: [10, 20], // Only 2 values, but 4 retries
        correlationId: 'test-backoff',
      })

      const elapsed = Date.now() - startTime
      // Should have waited: 10 + 20 + 20 + 20 = 70ms (using last value for subsequent)
      expect(elapsed).toBeGreaterThanOrEqual(60) // Allow some tolerance
    })
  })

  describe('calculateBackoffDelay', () => {
    it('should return correct delay for each attempt', () => {
      const backoffMs = [1000, 3000, 10000, 20000, 30000]

      expect(calculateBackoffDelay(1, backoffMs)).toBe(1000)
      expect(calculateBackoffDelay(2, backoffMs)).toBe(3000)
      expect(calculateBackoffDelay(3, backoffMs)).toBe(10000)
      expect(calculateBackoffDelay(4, backoffMs)).toBe(20000)
      expect(calculateBackoffDelay(5, backoffMs)).toBe(30000)
    })

    it('should return last value for attempts beyond array length', () => {
      const backoffMs = [1000, 3000]

      expect(calculateBackoffDelay(1, backoffMs)).toBe(1000)
      expect(calculateBackoffDelay(2, backoffMs)).toBe(3000)
      expect(calculateBackoffDelay(3, backoffMs)).toBe(3000)
      expect(calculateBackoffDelay(10, backoffMs)).toBe(3000)
    })

    it('should work with DEFAULT_BACKOFF_MS', () => {
      expect(calculateBackoffDelay(1, DEFAULT_BACKOFF_MS)).toBe(1000)
      expect(calculateBackoffDelay(5, DEFAULT_BACKOFF_MS)).toBe(30000)
    })
  })
})
