import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { getTask, markComplete, reopenTask, deleteTask } from '../api/tasks';
import toast from 'react-hot-toast';

const STATUS_META = {
  pending:     { label: 'Pending',     cls: 'status-pending' },
  in_progress: { label: 'In Progress', cls: 'status-progress' },
  completed:   { label: 'Completed',   cls: 'status-done' },
  cancelled:   { label: 'Cancelled',   cls: 'status-cancelled' },
};

const PRIORITY_META = {
  low:    { label: 'Low',    cls: 'pri-low' },
  medium: { label: 'Medium', cls: 'pri-medium' },
  high:   { label: 'High',   cls: 'pri-high' },
  urgent: { label: 'Urgent', cls: 'pri-urgent' },
};

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await getTask(id);
      setTask(data);
    } catch {
      toast.error('Task not found');
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleComplete = async () => {
    await markComplete(task.id);
    toast.success('Marked as complete!');
    load();
  };

  const handleReopen = async () => {
    await reopenTask(task.id);
    toast.success('Task reopened');
    load();
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    await deleteTask(task.id);
    toast.success('Task deleted');
    navigate('/tasks');
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!task) return null;

  const status = STATUS_META[task.status] || STATUS_META.pending;
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const overdue = task.is_overdue;

  return (
    <div className="page task-detail-page">
      <div className="breadcrumb">
        <Link to="/tasks">Tasks</Link>
        <span> / </span>
        <span>{task.title}</span>
      </div>

      <div className="detail-card">
        <div className="detail-header">
          <div className="detail-badges">
            <span className={`badge ${status.cls}`}>{status.label}</span>
            <span className={`badge ${priority.cls}`}>{priority.label}</span>
            {overdue && <span className="badge badge-overdue">Overdue</span>}
          </div>
          <div className="detail-actions">
            {task.status !== 'completed' ? (
              <button className="btn btn-success" onClick={handleComplete}>✓ Mark Complete</button>
            ) : (
              <button className="btn btn-ghost" onClick={handleReopen}>↺ Reopen</button>
            )}
            <Link to={`/tasks/${task.id}/edit`} className="btn btn-secondary">✎ Edit</Link>
            <button className="btn btn-danger" onClick={handleDelete}>✕ Delete</button>
          </div>
        </div>

        <h1 className="detail-title">{task.title}</h1>

        {task.description && (
          <div className="detail-description">
            <p>{task.description}</p>
          </div>
        )}

        <div className="detail-meta-grid">
          <div className="meta-block">
            <span className="meta-label">Created by</span>
            <span className="meta-val">{task.created_by?.full_name || task.created_by?.username || '—'}</span>
          </div>
          <div className="meta-block">
            <span className="meta-label">Assigned to</span>
            <span className="meta-val">{task.assigned_to?.full_name || task.assigned_to?.username || 'Unassigned'}</span>
          </div>
          <div className="meta-block">
            <span className="meta-label">Due date</span>
            <span className={`meta-val ${overdue ? 'text-danger' : ''}`}>
              {task.due_date ? format(parseISO(task.due_date), 'MMMM d, yyyy') : 'No due date'}
            </span>
          </div>
          <div className="meta-block">
            <span className="meta-label">Created at</span>
            <span className="meta-val">{format(parseISO(task.created_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
          <div className="meta-block">
            <span className="meta-label">Last updated</span>
            <span className="meta-val">{format(parseISO(task.updated_at), 'MMM d, yyyy HH:mm')}</span>
          </div>
          {task.completed_at && (
            <div className="meta-block">
              <span className="meta-label">Completed at</span>
              <span className="meta-val">{format(parseISO(task.completed_at), 'MMM d, yyyy HH:mm')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
