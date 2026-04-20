import { Link } from 'react-router-dom';
import { format, isPast, parseISO } from 'date-fns';
import { markComplete, reopenTask, deleteTask } from '../api/tasks';
import toast from 'react-hot-toast';

const STATUS_META = {
  pending:     { label: 'Pending',     cls: 'status-pending' },
  in_progress: { label: 'In Progress', cls: 'status-progress' },
  completed:   { label: 'Completed',   cls: 'status-done' },
  cancelled:   { label: 'Cancelled',   cls: 'status-cancelled' },
};

const PRIORITY_META = {
  low:    { label: 'Low',    cls: 'pri-low' },
  medium: { label: 'Med',    cls: 'pri-medium' },
  high:   { label: 'High',   cls: 'pri-high' },
  urgent: { label: 'Urgent', cls: 'pri-urgent' },
};

export default function TaskCard({ task, onRefresh }) {
  const status = STATUS_META[task.status] || STATUS_META.pending;
  const priority = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const overdue = task.due_date && task.status !== 'completed' && isPast(parseISO(task.due_date));

  const handleComplete = async (e) => {
    e.preventDefault();
    try {
      await markComplete(task.id);
      toast.success('Task completed!');
      onRefresh?.();
    } catch { toast.error('Failed to update task'); }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    try {
      await reopenTask(task.id);
      toast.success('Task reopened');
      onRefresh?.();
    } catch { toast.error('Failed to reopen task'); }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(task.id);
      toast.success('Task deleted');
      onRefresh?.();
    } catch { toast.error('Failed to delete task'); }
  };

  return (
    <div className={`task-card ${task.status === 'completed' ? 'done' : ''} ${overdue ? 'overdue' : ''}`}>
      <div className="task-card-header">
        <div className="task-badges">
          <span className={`badge ${status.cls}`}>{status.label}</span>
          <span className={`badge ${priority.cls}`}>{priority.label}</span>
          {overdue && <span className="badge badge-overdue">Overdue</span>}
        </div>
        <div className="task-actions">
          {task.status !== 'completed' ? (
            <button className="action-btn done-btn" onClick={handleComplete} title="Mark complete">✓</button>
          ) : (
            <button className="action-btn reopen-btn" onClick={handleReopen} title="Reopen">↺</button>
          )}
          <Link to={`/tasks/${task.id}/edit`} className="action-btn edit-btn" title="Edit">✎</Link>
          <button className="action-btn del-btn" onClick={handleDelete} title="Delete">✕</button>
        </div>
      </div>

      <Link to={`/tasks/${task.id}`} className="task-title-link">
        <h3 className="task-title">{task.title}</h3>
      </Link>

      <div className="task-meta">
        {task.due_date && (
          <span className={`meta-item ${overdue ? 'text-danger' : ''}`}>
            📅 {format(parseISO(task.due_date), 'MMM d, yyyy')}
          </span>
        )}
        {task.assigned_to_name && (
          <span className="meta-item">→ {task.assigned_to_name}</span>
        )}
        {task.created_by_name && (
          <span className="meta-item muted">by {task.created_by_name}</span>
        )}
      </div>
    </div>
  );
}
