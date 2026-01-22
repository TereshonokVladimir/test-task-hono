import type { SafeParseReturnType } from 'zod'

export interface EventPayload {
  correlationId: string
  data: unknown
}

export interface EventHandler<TInput, TOutput = void> {
  readonly subject: string
  validate(data: unknown): SafeParseReturnType<unknown, TInput>
  execute(event: TInput, correlationId: string): Promise<TOutput>
}

export abstract class BaseEventHandler<
  TInput extends EventPayload,
  TOutput = void,
> implements EventHandler<TInput, TOutput> {
  abstract readonly subject: string
  abstract validate(data: unknown): SafeParseReturnType<unknown, TInput>
  abstract execute(event: TInput, correlationId: string): Promise<TOutput>
}
