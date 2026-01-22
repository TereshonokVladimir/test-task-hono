import { Injectable, Type } from '@nestjs/common'
import { ModuleRef } from '@nestjs/core'
import type { EventHandler } from './base.handler'

const HANDLER_METADATA_KEY = Symbol('EVENT_HANDLER')

export const EventHandlerMeta = (): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(HANDLER_METADATA_KEY, true, target)
  }
}

export const isEventHandler = (target: Type): boolean => {
  return Reflect.getMetadata(HANDLER_METADATA_KEY, target) === true
}

@Injectable()
export class HandlerRegistry {
  private readonly handlers: EventHandler<unknown>[] = []

  constructor(private readonly moduleRef: ModuleRef) {}

  register(handlerClass: Type<EventHandler<unknown>>): void {
    const instance = this.moduleRef.get(handlerClass, { strict: false })
    this.handlers.push(instance)
  }

  getAll(): EventHandler<unknown>[] {
    return this.handlers
  }
}
