import type { FC } from 'hono/jsx'
import type { TaskStatus } from '@repo/shared'

interface StatusBadgeProps {
  status: TaskStatus
}

const statusLabels: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  return <span class={`badge badge-${status}`}>{statusLabels[status]}</span>
}
