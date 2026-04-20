import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getTask, createTask, updateTask } from '../api/tasks';
import { getUsers } from '../api/auth';
import toast from 'react-hot-toast';

const EMPTY = {
  title: '', description: '', status: 'pending',
  priority: 'medium', due_date: '', assigned_to_id: '',
};

export default function TaskForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]       = useState(EMPTY);
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    getUsers().then(({ data }) => setUsers(data.results || data)).catch(() => {});
    if (isEdit) {
      getTask(id)
        .then(({ data }) => {
          setForm({
            title:          data.title,
            description:    data.description || '',
            status:         data.status,
            priority:       data.priority,
            due_date:       data.due_date || '',
            assigned_to_id: data.assigned_to?.id || '',
          });
        })
        .catch(() => { toast.error('Task not found'); navigate('/tasks'); })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const onChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((errs) => ({ ...errs, [e.target.name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrors({});

    const payload = { ...form };
    if (!payload.due_date) delete payload.due_date;
    if (!payload.assigned_to_id) payload.assigned_to_id = null;

    try {
      if (isEdit) {
        await updateTask(id, payload);
        toast.success('Task updated!');
        navigate(`/tasks/${id}`);
      } else {
        const { data } = await createTask(payload);
        toast.success('Task created!');
        navigate(`/tasks/${data.id}`);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        setErrors(data);
        toast.error('Please fix the errors below.');
      } else {
        toast.error('Something went wrong.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  const FieldErr = ({ name }) =>
    errors[name] ? (
      <span className="field-error">
        {Array.isArray(errors[name]) ? errors[name].join(' ') : errors[name]}
      </span>
    ) : null;

  return (
    <div className="page task-form-page">
      <div className="breadcrumb">
        <Link to="/tasks">Tasks</Link>
        {isEdit && <><span> / </span><Link to={`/tasks/${id}`}>{form.title || 'Task'}</Link></>}
        <span> / </span>
        <span>{isEdit ? 'Edit' : 'New Task'}</span>
      </div>

      <div className="form-card">
        <h1 className="form-card-title">{isEdit ? 'Edit Task' : 'Create New Task'}</h1>

        <form onSubmit={handleSubmit} className="task-form">
          {/* Title */}
          <div className="field">
            <label className="field-label">Title <span className="required">*</span></label>
            <input
              className={`field-input ${errors.title ? 'error' : ''}`}
              name="title"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={onChange}
              required
            />
            <FieldErr name="title" />
          </div>

          {/* Description */}
          <div className="field">
            <label className="field-label">Description</label>
            <textarea
              className="field-input field-textarea"
              name="description"
              placeholder="Add more details…"
              value={form.description}
              onChange={onChange}
              rows={4}
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="field-row">
            <div className="field">
              <label className="field-label">Status</label>
              <select className="field-input" name="status" value={form.status} onChange={onChange}>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="field">
              <label className="field-label">Priority</label>
              <select className="field-input" name="priority" value={form.priority} onChange={onChange}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          {/* Row: Due date + Assign to */}
          <div className="field-row">
            <div className="field">
              <label className="field-label">Due Date</label>
              <input
                className="field-input"
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={onChange}
              />
            </div>
            <div className="field">
              <label className="field-label">Assign To</label>
              <select className="field-input" name="assigned_to_id" value={form.assigned_to_id} onChange={onChange}>
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name || u.username} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner-sm" /> : isEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
