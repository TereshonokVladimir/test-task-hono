import type { FC } from 'hono/jsx'
import type { Task } from '@repo/shared'
import { TaskCard } from './TaskCard'

interface TaskListProps {
  tasks: Task[]
}

export const TaskList: FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <div class="empty-state-title">No tasks yet</div>
        <div class="empty-state-text">Tasks will appear here when created via NATS events</div>
      </div>
    )
  }

  return (
    <div>
      <h1>Tasks</h1>
      <div class="task-count">
        {tasks.length} task{tasks.length !== 1 ? 's' : ''}
      </div>
      <div class="task-list">
        {tasks.map(task => (
          <TaskCard task={task} key={task.id} />
        ))}
      </div>
    </div>
  )
}
