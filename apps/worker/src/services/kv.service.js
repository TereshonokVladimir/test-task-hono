import { getTaskKey, KV_PREFIX } from '@repo/shared';
export const createTaskRepository = (kv) => ({
    async getById(id) {
        const data = await kv.get(getTaskKey(id));
        return data
            ? { ok: true, data: JSON.parse(data) }
            : { ok: false, error: `Task not found: ${id}` };
    },
    async getAll() {
        const list = await kv.list({ prefix: `${KV_PREFIX}:` });
        const tasks = await Promise.all(list.keys.map(key => kv.get(key.name).then(parse)));
        return tasks.filter(Boolean).sort(byDateDesc);
    },
});
const parse = (data) => (data ? JSON.parse(data) : null);
const byDateDesc = (a, b) => a && b ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() : 0;
export const applyFilters = (tasks, filters) => filters.status ? tasks.filter(t => t.status === filters.status) : tasks;
export const paginate = (items, offset, limit) => ({
    data: items.slice(offset, offset + limit),
    hasMore: offset + limit < items.length,
});
export const parseParams = (get) => ({
    status: get('status'),
    offset: clamp(parseInt(get('offset') || '0', 10), 0, Infinity),
    limit: clamp(parseInt(get('limit') || '50', 10), 1, 100),
});
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
