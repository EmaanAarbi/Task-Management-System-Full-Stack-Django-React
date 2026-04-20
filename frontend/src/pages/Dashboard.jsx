import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getTasks } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import TaskCard from '../components/TaskCard';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentTasks, setRecentTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([
        getStats(),
        getTasks({ page_size: 5, ordering: '-created_at' }),
      ]);
      setStats(statsRes.data);
      setRecentTasks(tasksRes.data.results || []);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting}, {user?.first_name || user?.username} 👋</h1>
          <p className="page-sub">Here's what's happening with your tasks today.</p>
        </div>
        <Link to="/tasks/new" className="btn btn-primary">
          <span>+</span> New Task
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard icon="◈" label="Total Tasks"   value={stats?.total}        accent="blue"   />
        <StatCard icon="◎" label="Pending"        value={stats?.pending}      accent="yellow" />
        <StatCard icon="⬡" label="In Progress"   value={stats?.in_progress}  accent="purple" />
        <StatCard icon="✓" label="Completed"      value={stats?.completed}    accent="green"  />
        <StatCard icon="⚠" label="Overdue"        value={stats?.overdue}      accent="red"    />
        <StatCard icon="→" label="Assigned to Me" value={stats?.assigned_to_me} accent="teal" />
      </div>

      <div className="dashboard-bottom">
        <div className="recent-section">
          <div className="section-header">
            <h2 className="section-title">Recent Tasks</h2>
            <Link to="/tasks" className="section-link">View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">
              <p>No tasks yet.</p>
              <Link to="/tasks/new" className="btn btn-ghost">Create your first task</Link>
            </div>
          ) : (
            <div className="task-list">
              {recentTasks.map((t) => (
                <TaskCard key={t.id} task={t} onRefresh={load} />
              ))}
            </div>
          )}
        </div>

        <div className="quick-links-section">
          <h2 className="section-title">Quick Access</h2>
          <div className="quick-links">
            <Link to="/tasks?status=pending" className="quick-link">
              <span className="ql-icon">◎</span>
              <span>Pending Tasks</span>
              <span className="ql-count">{stats?.pending}</span>
            </Link>
            <Link to="/tasks/assigned" className="quick-link">
              <span className="ql-icon">→</span>
              <span>Assigned to Me</span>
              <span className="ql-count">{stats?.assigned_to_me}</span>
            </Link>
            <Link to="/tasks/created" className="quick-link">
              <span className="ql-icon">◆</span>
              <span>Created by Me</span>
              <span className="ql-count">{stats?.created_by_me}</span>
            </Link>
            <Link to="/tasks?is_overdue=true" className="quick-link danger">
              <span className="ql-icon">⚠</span>
              <span>Overdue</span>
              <span className="ql-count">{stats?.overdue}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
