import api from './axios';

export const getTasks = (params = {}) => api.get('/tasks/', { params });
export const getTask = (id) => api.get(`/tasks/${id}/`);
export const createTask = (data) => api.post('/tasks/', data);
export const updateTask = (id, data) => api.patch(`/tasks/${id}/`, data);
export const deleteTask = (id) => api.delete(`/tasks/${id}/`);
export const markComplete = (id) => api.patch(`/tasks/${id}/complete/`);
export const reopenTask = (id) => api.patch(`/tasks/${id}/reopen/`);
export const assignTask = (id, assigned_to_id) => api.patch(`/tasks/${id}/assign/`, { assigned_to_id });
export const getStats = () => api.get('/tasks/stats/');
