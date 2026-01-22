import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { StatusBadge } from './StatusBadge';
import { formatDate } from '../utils/date';
export const TaskCard = ({ task }) => {
    return (_jsxs("a", { href: `/tasks/${task.id}`, class: "card card-link", children: [_jsxs("div", { class: "card-header", children: [_jsx("span", { class: "card-title", children: task.title }), _jsx(StatusBadge, { status: task.status })] }), _jsx("div", { class: "card-description", children: task.description }), _jsxs("div", { class: "card-meta", children: [_jsxs("span", { class: "card-meta-item", children: [_jsx("span", { children: "ID:" }), _jsx("code", { children: task.id })] }), _jsxs("span", { class: "card-meta-item", children: [_jsx("span", { children: "Created:" }), _jsx("span", { children: formatDate(task.createdAt) })] })] })] }));
};
