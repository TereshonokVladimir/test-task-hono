import { jsx as _jsx } from "hono/jsx/jsx-runtime";
const statusLabels = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Cancelled',
};
export const StatusBadge = ({ status }) => {
    return _jsx("span", { class: `badge badge-${status}`, children: statusLabels[status] });
};
