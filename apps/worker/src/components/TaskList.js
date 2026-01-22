import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { TaskCard } from './TaskCard';
export const TaskList = ({ tasks }) => {
    if (tasks.length === 0) {
        return (_jsxs("div", { class: "empty-state", children: [_jsx("div", { class: "empty-state-icon", children: "\uD83D\uDCED" }), _jsx("div", { class: "empty-state-title", children: "No tasks yet" }), _jsx("div", { class: "empty-state-text", children: "Tasks will appear here when created via NATS events" })] }));
    }
    return (_jsxs("div", { children: [_jsx("h1", { children: "Tasks" }), _jsxs("div", { class: "task-count", children: [tasks.length, " task", tasks.length !== 1 ? 's' : ''] }), _jsx("div", { class: "task-list", children: tasks.map(task => (_jsx(TaskCard, { task: task }, task.id))) })] }));
};
