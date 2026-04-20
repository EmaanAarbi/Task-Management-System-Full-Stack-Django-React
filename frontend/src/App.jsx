import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import TaskDetail from './pages/TaskDetail';
import TaskForm from './pages/TaskForm';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e2530', color: '#e2e8f0', border: '1px solid #2d3748', borderRadius: '10px', fontSize: '14px' }, success: { iconTheme: { primary: '#4ade80', secondary: '#1e2530' } }, error: { iconTheme: { primary: '#f87171', secondary: '#1e2530' } } }} />
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard"       element={<Dashboard />} />
              <Route path="/tasks"           element={<TaskList />} />
              <Route path="/tasks/assigned"  element={<TaskList mode="assigned" />} />
              <Route path="/tasks/created"   element={<TaskList mode="created" />} />
              <Route path="/tasks/new"       element={<TaskForm />} />
              <Route path="/tasks/:id"       element={<TaskDetail />} />
              <Route path="/tasks/:id/edit"  element={<TaskForm />} />
              <Route path="/profile"         element={<Profile />} />
              <Route path="/"                element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
