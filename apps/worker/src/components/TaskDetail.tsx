import type { FC } from 'hono/jsx'
import type { Task } from '@repo/shared'

interface TaskDetailProps {
  task: Task
}

export const TaskDetail: FC<TaskDetailProps> = ({ task }) => {
  return (
    <div>
      <a href="/" class="back-link">← Back to Tasks</a>
      <div class="detail-container">
        <div class="detail-header">
          <div>
            <h1 class="detail-title">{task.title}</h1>
            <span class="detail-id">{task.id}</span>
          </div>
          <span class={`status-badge status-${task.status}`}>
            {task.status.replace('_', ' ')}
          </span>
        </div>

        <div class="detail-section">
          <div class="detail-label">Description</div>
          <div class="detail-value">{task.description}</div>
        </div>

        <div class="detail-timestamps">
          <div>
            <div class="detail-label">Created</div>
            <div class="detail-value">{formatDate(task.createdAt)}</div>
          </div>
          <div>
            <div class="detail-label">Last Updated</div>
            <div class="detail-value">{formatDate(task.updatedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}
