import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateMe } from '../api/auth';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, reloadUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    bio:        user?.bio        || '',
  });
  const [saving, setSaving]   = useState(false);
  const [editing, setEditing] = useState(false);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMe(form);
      await reloadUser();
      toast.success('Profile updated!');
      setEditing(false);
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || user?.username?.[0] || '')).toUpperCase();

  return (
    <div className="page profile-page">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
      </div>

      <div className="profile-card">
        <div className="profile-avatar-section">
          <div className="profile-avatar">{initials}</div>
          <div>
            <h2 className="profile-name">{user?.full_name || user?.username}</h2>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-username">@{user?.username}</p>
          </div>
        </div>

        {!editing ? (
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">Bio</span>
              <span className="info-val">{user?.bio || <em className="muted">No bio set.</em>}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Tasks Created</span>
              <span className="info-val">{user?.task_count ?? '—'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Member Since</span>
              <span className="info-val">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                  : '—'}
              </span>
            </div>
            <button className="btn btn-secondary mt-4" onClick={() => setEditing(true)}>
              ✎ Edit Profile
            </button>
          </div>
        ) : (
          <form className="profile-form" onSubmit={handleSave}>
            <div className="field-row">
              <div className="field">
                <label className="field-label">First Name</label>
                <input className="field-input" name="first_name" value={form.first_name} onChange={onChange} />
              </div>
              <div className="field">
                <label className="field-label">Last Name</label>
                <input className="field-input" name="last_name"  value={form.last_name}  onChange={onChange} />
              </div>
            </div>
            <div className="field">
              <label className="field-label">Bio</label>
              <textarea className="field-input field-textarea" name="bio" value={form.bio} onChange={onChange} rows={3} placeholder="Tell your team a little about yourself…" />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner-sm" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
