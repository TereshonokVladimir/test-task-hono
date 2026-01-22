import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RetryService, DEFAULT_BACKOFF_MS } from './retry.service'
import { LogOperation } from '../common'

interface KvWriteOptions {
  correlationId: string
}

type HttpMethod = 'GET' | 'PUT' | 'DELETE'

type Result<T> = { ok: true; value: T } | { ok: false; error: Error }

@Injectable()
export class CloudflareKvService {
  private readonly logger = new Logger(CloudflareKvService.name)
  private readonly baseUrl: string
  private readonly apiToken: string
  private readonly httpTimeoutMs: number
  private readonly maxRetries = 5

  private readonly methodConfigs: Record<HttpMethod, (value?: unknown) => Partial<RequestInit>> = {
    GET: () => ({}),
    PUT: value => ({
      body: JSON.stringify(value),
      headers: { 'Content-Type': 'application/json' },
    }),
    DELETE: () => ({}),
  }

  constructor(
    private readonly config: ConfigService,
    private readonly retry: RetryService
  ) {
    const accountId = this.config.get<string>('CF_ACCOUNT_ID')
    const namespaceId = this.config.get<string>('CF_NAMESPACE_ID')
    this.apiToken = this.config.get<string>('CF_API_TOKEN', '')
    this.httpTimeoutMs = this.config.get<number>('HTTP_TIMEOUT_MS', 10000)

    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`

    if (!accountId || !namespaceId) {
      this.logger.warn('Cloudflare KV credentials not configured')
    }
  }

  async get<T>(key: string, correlationId: string): Promise<T | null> {
    const result = await this.request<string>(key, 'GET', correlationId)
    return result.ok ? this.parseJson<T>(result.value) : null
  }

  @LogOperation('KV.Put')
  async put(key: string, value: unknown, options: KvWriteOptions): Promise<void> {
    await this.retry.executeWithRetry(
      () => this.executeRequest(key, 'PUT', options.correlationId, value),
      {
        maxAttempts: this.maxRetries,
        backoffMs: DEFAULT_BACKOFF_MS,
        correlationId: options.correlationId,
      }
    )
  }

  @LogOperation('KV.Delete')
  async delete(key: string, options: KvWriteOptions): Promise<void> {
    await this.retry.executeWithRetry(
      () => this.executeRequest(key, 'DELETE', options.correlationId),
      {
        maxAttempts: this.maxRetries,
        backoffMs: DEFAULT_BACKOFF_MS,
        correlationId: options.correlationId,
      }
    )
  }

  private async request<T>(
    key: string,
    method: HttpMethod,
    correlationId: string,
    value?: unknown
  ): Promise<Result<T>> {
    const config = this.buildConfig(method, value)
    const response = await this.fetch(this.buildUrl(key), config, correlationId)

    if (response.status === 404) {
      return { ok: false, error: new Error('Not found') }
    }

    if (!response.ok) {
      const text = await response.text()
      return { ok: false, error: new Error(`${method} failed: ${response.status} - ${text}`) }
    }

    const text = await response.text()
    return { ok: true, value: text as T }
  }

  private async executeRequest(
    key: string,
    method: HttpMethod,
    correlationId: string,
    value?: unknown
  ): Promise<void> {
    const result = await this.request<string>(key, method, correlationId, value)

    if (!result.ok && !result.error.message.includes('Not found')) {
      throw result.error
    }
  }

  private buildConfig(method: HttpMethod, value?: unknown): RequestInit {
    const extra = this.methodConfigs[method](value)
    return {
      method,
      headers: {
        Authorization: `Bearer ${this.apiToken}`,
        ...(extra.headers as Record<string, string>),
      },
      body: extra.body as string | undefined,
    }
  }

  private buildUrl(key: string): string {
    return `${this.baseUrl}/values/${encodeURIComponent(key)}`
  }

  private parseJson<T>(text: string): T | null {
    try {
      return JSON.parse(text) as T
    } catch {
      return null
    }
  }

  private async fetch(
    url: string,
    options: RequestInit,
    _correlationId: string
  ): Promise<Response> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.httpTimeoutMs)

    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } catch (error) {
      const isTimeout = error instanceof Error && error.name === 'AbortError'
      throw new Error(isTimeout ? `Timeout after ${this.httpTimeoutMs}ms` : String(error))
    } finally {
      clearTimeout(timeout)
    }
  }
}
