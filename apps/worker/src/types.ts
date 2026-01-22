export interface Env {
  TASKS_KV: KVNamespace
  ENVIRONMENT: string
}

declare module 'hono' {
  interface ContextVariableMap {
    correlationId: string
  }
}
