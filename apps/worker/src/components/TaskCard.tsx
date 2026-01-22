import type { FC } from 'hono/jsx'
import type { Task } from '@repo/shared'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../utils/date'

interface TaskCardProps {
  task: Task
}

export const TaskCard: FC<TaskCardProps> = ({ task }) => {
  return (
    <a href={`/tasks/${task.id}`} class="card card-link">
      <div class="card-header">
        <span class="card-title">{task.title}</span>
        <StatusBadge status={task.status} />
      </div>
      <div class="card-description">{task.description}</div>
      <div class="card-meta">
        <span class="card-meta-item">
          <span>ID:</span>
          <code>{task.id}</code>
        </span>
        <span class="card-meta-item">
          <span>Created:</span>
          <span>{formatDate(task.createdAt)}</span>
        </span>
      </div>
    </a>
  )
}
