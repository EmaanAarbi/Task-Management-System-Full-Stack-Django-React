
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api/auth';
import toast from 'react-hot-toast';

// Reusable Field component (OUTSIDE Register)
const Field = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error
}) => (
  <div className="field">
    <label className="field-label">{label}</label>
    <input
      className={`field-input ${error ? 'error' : ''}`}
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required
    />
    {error && (
      <span className="field-error">
        {Array.isArray(error) ? error.join(' ') : error}
      </span>
    )}
  </div>
);

export default function Register() {
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirm: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    // Clear error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      await register(form);
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err) {
      const data = err.response?.data;

      if (data && typeof data === 'object') {
        setErrors(data);
        toast.error('Please fix the errors below.');
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel wide">
        <div className="auth-brand">
          <span className="brand-icon-lg">◈</span>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-sub">Join FlowTask and start organizing</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <Field
              name="first_name"
              label="First Name"
              placeholder="Jane"
              value={form.first_name}
              onChange={onChange}
              error={errors.first_name}
            />
            <Field
              name="last_name"
              label="Last Name"
              placeholder="Doe"
              value={form.last_name}
              onChange={onChange}
              error={errors.last_name}
            />
          </div>

          <Field
            name="username"
            label="Username"
            placeholder="janedoe"
            value={form.username}
            onChange={onChange}
            error={errors.username}
          />

          <Field
            name="email"
            label="Email"
            type="email"
            placeholder="jane@example.com"
            value={form.email}
            onChange={onChange}
            error={errors.email}
          />

          <Field
            name="password"
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={onChange}
            error={errors.password}
          />

          <Field
            name="password_confirm"
            label="Confirm Password"
            type="password"
            placeholder="Repeat password"
            value={form.password_confirm}
            onChange={onChange}
            error={errors.password_confirm}
          />

          {errors.non_field_errors && (
            <div className="form-error-box">
              {errors.non_field_errors.join(' ')}
            </div>
          )}

          <button className="btn btn-primary btn-full" disabled={loading}>
            {loading ? <span className="spinner-sm" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>

      <div className="auth-visual">
        <div className="visual-grid">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="visual-cell"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>

        <div className="visual-headline">
          <h2>Your team's tasks,<br />perfectly tracked.</h2>
          <p>
            Create tasks, assign them, set deadlines — and never miss a beat.
          </p>
        </div>
      </div>
    </div>
  );
}

