import type { FC } from 'hono/jsx'
import type { Task } from '@repo/shared'

interface TaskListProps {
  tasks: Task[]
}

export const TaskList: FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No tasks yet</div>
        <div class="empty-state-text">
          Tasks will appear here when created via NATS events
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Tasks</h1>
      <div class="task-count">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</div>
      <div class="task-list">
        {tasks.map(task => (
          <a href={`/tasks/${task.id}`} class="task-card" key={task.id}>
            <div class="task-header">
              <span class="task-title">{task.title}</span>
              <span class={`status-badge status-${task.status}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <div class="task-description">{task.description}</div>
            <div class="task-meta">
              <span>ID: {task.id}</span>
              <span>Created: {formatDate(task.createdAt)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
