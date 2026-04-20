import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getTasks } from '../api/tasks';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

const STATUSES  = ['', 'pending', 'in_progress', 'completed', 'cancelled'];
const PRIORITIES = ['', 'low', 'medium', 'high', 'urgent'];
const SORT_OPTIONS = [
  { value: '-created_at',  label: 'Newest first' },
  { value: 'created_at',   label: 'Oldest first' },
  { value: 'due_date',     label: 'Due date ↑' },
  { value: '-due_date',    label: 'Due date ↓' },
  { value: '-priority',    label: 'Priority ↑' },
  { value: 'title',        label: 'Title A–Z' },
];

export default function TaskList({ mode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks]     = useState([]);
  const [count, setCount]     = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters from URL
  const page     = parseInt(searchParams.get('page') || '1');
  const search   = searchParams.get('search') || '';
  const status   = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const ordering = searchParams.get('ordering') || '-created_at';

  const PAGE_SIZE = 9;

  const setParam = (key, val) => {
    const next = new URLSearchParams(searchParams);
    if (val) next.set(key, val); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, page_size: PAGE_SIZE, ordering };
      if (search)   params.search   = search;
      if (status)   params.status   = status;
      if (priority) params.priority = priority;
      if (mode === 'assigned') params.assigned_to_me = true;
      if (mode === 'created')  params.created_by_me  = true;

      const { data } = await getTasks(params);
      setTasks(data.results || []);
      setCount(data.count || 0);
    } catch {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, priority, ordering, mode]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(count / PAGE_SIZE);
  const setPage = (p) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', p);
    setSearchParams(next);
  };

  const titles = {
    assigned: 'Assigned to Me',
    created:  'Created by Me',
    default:  'All Tasks',
  };
  const pageTitle = titles[mode] || titles.default;

  return (
    <div className="page task-list-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{pageTitle}</h1>
          <p className="page-sub">{count} task{count !== 1 ? 's' : ''} found</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">+ New Task</Link>
      </div>

      {/* ── Toolbar ── */}
      <div className="toolbar">
        <div className="search-wrap">
          <span className="search-icon">⌕</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setParam('search', e.target.value)}
          />
        </div>

        <select className="filter-select" value={status} onChange={(e) => setParam('status', e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.filter(Boolean).map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>

        <select className="filter-select" value={priority} onChange={(e) => setParam('priority', e.target.value)}>
          <option value="">All priorities</option>
          {PRIORITIES.filter(Boolean).map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <select className="filter-select" value={ordering} onChange={(e) => setParam('ordering', e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* ── Active filter chips ── */}
      {(status || priority || search) && (
        <div className="filter-chips">
          {search   && <span className="chip">Search: "{search}" <button onClick={() => setParam('search','')}>×</button></span>}
          {status   && <span className="chip">Status: {status} <button onClick={() => setParam('status','')}>×</button></span>}
          {priority && <span className="chip">Priority: {priority} <button onClick={() => setParam('priority','')}>×</button></span>}
          <button className="chip chip-clear" onClick={() => setSearchParams({})}>Clear all</button>
        </div>
      )}

      {/* ── Task Grid ── */}
      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state large">
          <div className="empty-icon">◈</div>
          <p>No tasks match your filters.</p>
          <Link to="/tasks/new" className="btn btn-ghost">Create a task</Link>
        </div>
      ) : (
        <div className="tasks-grid">
          {tasks.map((t) => <TaskCard key={t.id} task={t} onRefresh={load} />)}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pagination">
          <button className="page-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === page ? 'active' : ''}`}
              onClick={() => setPage(p)}
            >{p}</button>
          ))}
          <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
        </div>
      )}
    </div>
  );
}
