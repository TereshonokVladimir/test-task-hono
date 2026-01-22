import type { FC } from 'hono/jsx'
import type { Task } from '@repo/shared'
import { StatusBadge } from './StatusBadge'
import { formatDateLong } from '../utils/date'

interface TaskDetailProps {
  task: Task
}

export const TaskDetail: FC<TaskDetailProps> = ({ task }) => {
  return (
    <div>
      <a href="/" class="back-link">
        ← Back to Tasks
      </a>
      <div class="detail-container">
        <div class="detail-header">
          <div>
            <h1 class="detail-title">{task.title}</h1>
            <span class="detail-id">{task.id}</span>
          </div>
          <StatusBadge status={task.status} />
        </div>

        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">{task.description}</div>
        </div>

        <div class="detail-timestamps">
          <div>
            <div class="detail-label">Created</div>
            <div class="detail-value">{formatDateLong(task.createdAt)}</div>
          </div>
          <div>
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">{formatDateLong(task.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
