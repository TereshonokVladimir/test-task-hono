import { jsx as _jsx, jsxs as _jsxs } from "hono/jsx/jsx-runtime";
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { correlationIdMiddleware } from './middleware/correlation-id';
import { Layout, TaskList, TaskDetail } from './components';
import { isValidTaskStatus } from '@repo/shared';
import { createTaskRepository, applyFilters, paginate, parseParams } from './services/kv.service';
const app = new Hono();
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', correlationIdMiddleware);
app.onError((err, c) => c.json({
    error: 'Internal Server Error',
    message: err.message,
    correlationId: c.get('correlationId'),
}, 500));
app.notFound(c => c.json({
    error: 'Not Found',
    path: c.req.path,
    correlationId: c.get('correlationId'),
}, 404));
app.get('/health', c => c.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'tasks-worker',
}));
app.get('/', async (c) => {
    const repo = createTaskRepository(c.env.TASKS_KV);
    const tasks = await repo.getAll();
    return c.html(_jsx(Layout, { title: "Tasks", children: _jsx(TaskList, { tasks: tasks }) }));
});
app.get('/tasks/:id', async (c) => {
    const repo = createTaskRepository(c.env.TASKS_KV);
    const result = await repo.getById(c.req.param('id'));
    if (!result.ok) {
        return c.html(_jsx(Layout, { title: "Task Not Found", children: _jsxs("div", { class: "error-container", children: [_jsx("h1", { children: "Task Not Found" }), _jsxs("p", { children: ["The task with ID ", _jsx("code", { children: c.req.param('id') }), " does not exist."] }), _jsx("a", { href: "/", class: "back-link", children: "\u2190 Back to Tasks" })] }) }), 404);
    }
    return c.html(_jsx(Layout, { title: result.data.title, children: _jsx(TaskDetail, { task: result.data }) }));
});
app.get('/api/tasks', async (c) => {
    const params = parseParams(key => c.req.query(key));
    if (params.status && !isValidTaskStatus(params.status)) {
        return c.json({
            error: 'Invalid status',
            valid: ['pending', 'in_progress', 'completed', 'cancelled'],
            correlationId: c.get('correlationId'),
        }, 400);
    }
    const repo = createTaskRepository(c.env.TASKS_KV);
    const all = await repo.getAll();
    const filtered = applyFilters(all, { status: params.status });
    const { data, hasMore } = paginate(filtered, params.offset, params.limit);
    c.header('Cache-Control', 'public, max-age=5, stale-while-revalidate=10');
    return c.json({
        data,
        meta: {
            total: filtered.length,
            offset: params.offset,
            limit: params.limit,
            hasMore,
            correlationId: c.get('correlationId'),
        },
    });
});
app.get('/api/tasks/:id', async (c) => {
    const repo = createTaskRepository(c.env.TASKS_KV);
    const result = await repo.getById(c.req.param('id'));
    if (!result.ok) {
        return c.json({ error: 'Task not found', correlationId: c.get('correlationId') }, 404);
    }
    return c.json({
        data: result.data,
        meta: { correlationId: c.get('correlationId') },
    });
});
export default app;
