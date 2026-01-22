import {
  validateTaskCreatedEvent,
  validateTaskUpdatedEvent,
  validateTaskDeletedEvent,
  parseTaskCreatedEvent,
  parseTaskUpdatedEvent,
  parseTaskDeletedEvent,
  isValidTaskStatus,
  getTaskKey,
  parseTaskKey,
  TaskStatusSchema,
} from './index'

describe('Validation helpers', () => {
  describe('isValidTaskStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isValidTaskStatus('pending')).toBe(true)
      expect(isValidTaskStatus('in_progress')).toBe(true)
      expect(isValidTaskStatus('completed')).toBe(true)
      expect(isValidTaskStatus('cancelled')).toBe(true)
    })

    it('should return false for invalid statuses', () => {
      expect(isValidTaskStatus('invalid')).toBe(false)
      expect(isValidTaskStatus('')).toBe(false)
      expect(isValidTaskStatus('PENDING')).toBe(false)
    })
  })

  describe('TaskStatusSchema', () => {
    it('should parse valid status', () => {
      const result = TaskStatusSchema.safeParse('pending')
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBe('pending')
      }
    })

    it('should fail for invalid status', () => {
      const result = TaskStatusSchema.safeParse('invalid')
      expect(result.success).toBe(false)
    })
  })

  describe('validateTaskCreatedEvent', () => {
    const validEvent = {
      correlationId: '550e8400-e29b-41d4-a716-446655440000',
      data: {
        id: 'task-1',
        title: 'Test Task',
        description: 'Description',
        status: 'pending',
      },
    }

    it('should return true for valid event', () => {
      expect(validateTaskCreatedEvent(validEvent)).toBe(true)
    })

    it('should return false for missing correlationId', () => {
      const event = {
        data: validEvent.data,
      }
      expect(validateTaskCreatedEvent(event)).toBe(false)
    })

    it('should return false for invalid correlationId format', () => {
      const event = {
        ...validEvent,
        correlationId: 'not-a-uuid',
      }
      expect(validateTaskCreatedEvent(event)).toBe(false)
    })

    it('should return false for invalid status', () => {
      const event = {
        ...validEvent,
        data: {
          ...validEvent.data,
          status: 'invalid_status',
        },
      }
      expect(validateTaskCreatedEvent(event)).toBe(false)
    })

    it('should return false for empty title', () => {
      const event = {
        ...validEvent,
        data: {
          ...validEvent.data,
          title: '',
        },
      }
      expect(validateTaskCreatedEvent(event)).toBe(false)
    })

    it('should return false for null/undefined', () => {
      expect(validateTaskCreatedEvent(null)).toBe(false)
      expect(validateTaskCreatedEvent(undefined)).toBe(false)
    })
  })

  describe('parseTaskCreatedEvent', () => {
    it('should return success with data for valid event', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
          title: 'Test Task',
          description: 'Description',
          status: 'pending',
        },
      }
      const result = parseTaskCreatedEvent(event)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.data.id).toBe('task-1')
      }
    })

    it('should return error details for invalid event', () => {
      const event = {
        correlationId: 'invalid',
        data: { id: '' },
      }
      const result = parseTaskCreatedEvent(event)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0)
      }
    })
  })

  describe('validateTaskUpdatedEvent', () => {
    it('should return true for valid event with partial data', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
          title: 'Updated Title',
        },
      }
      expect(validateTaskUpdatedEvent(event)).toBe(true)
    })

    it('should return true for event with only id', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
        },
      }
      expect(validateTaskUpdatedEvent(event)).toBe(true)
    })

    it('should return true for event with status update', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
          status: 'completed',
        },
      }
      expect(validateTaskUpdatedEvent(event)).toBe(true)
    })

    it('should return false for invalid status in update', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
          status: 'invalid',
        },
      }
      expect(validateTaskUpdatedEvent(event)).toBe(false)
    })
  })

  describe('validateTaskDeletedEvent', () => {
    it('should return true for valid event', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: 'task-1',
        },
      }
      expect(validateTaskDeletedEvent(event)).toBe(true)
    })

    it('should return false for empty id', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {
          id: '',
        },
      }
      expect(validateTaskDeletedEvent(event)).toBe(false)
    })

    it('should return false for missing id', () => {
      const event = {
        correlationId: '550e8400-e29b-41d4-a716-446655440000',
        data: {},
      }
      expect(validateTaskDeletedEvent(event)).toBe(false)
    })
  })

  describe('KV key helpers', () => {
    it('getTaskKey should generate correct key', () => {
      expect(getTaskKey('abc123')).toBe('tasks:abc123')
      expect(getTaskKey('my-task-id')).toBe('tasks:my-task-id')
    })

    it('parseTaskKey should extract id from valid key', () => {
      expect(parseTaskKey('tasks:abc123')).toBe('abc123')
      expect(parseTaskKey('tasks:my-task-id')).toBe('my-task-id')
    })

    it('parseTaskKey should return null for invalid key', () => {
      expect(parseTaskKey('invalid:abc123')).toBe(null)
      expect(parseTaskKey('abc123')).toBe(null)
    })
  })
})
