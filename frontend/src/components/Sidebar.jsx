import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { logout } from '../api/auth';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '⬡', label: 'Dashboard' },
  { to: '/tasks', icon: '◈', label: 'All Tasks' },
  { to: '/tasks/assigned', icon: '◎', label: 'Assigned to Me' },
  { to: '/tasks/created', icon: '◆', label: 'Created by Me' },
  { to: '/tasks/new', icon: '+', label: 'New Task' },
];

export default function Sidebar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh = localStorage.getItem('refresh_token');
    try { await logout(refresh); } catch {}
    logoutUser();
    navigate('/login');
    toast.success('Logged out');
  };

  const initials = user
    ? (user.first_name?.[0] || '') + (user.last_name?.[0] || user.username?.[0] || '')
    : '?';

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">◈</span>
        <span className="brand-name">FlowTask</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/dashboard'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span className="nav-label">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/profile" className={({ isActive }) => `user-chip ${isActive ? 'active' : ''}`}>
          <div className="avatar">{initials.toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{user?.first_name || user?.username}</span>
            <span className="user-email">{user?.email}</span>
          </div>
        </NavLink>
        <button className="logout-btn" onClick={handleLogout} title="Sign out">
          ⏏
        </button>
      </div>
    </aside>
  );
}
