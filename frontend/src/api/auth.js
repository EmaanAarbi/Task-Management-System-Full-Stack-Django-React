import api from './axios';

export const register = (data) => api.post('/accounts/register/', data);
export const login = (data) => api.post('/accounts/login/', data);
export const logout = (refresh) => api.post('/auth/logout/', { refresh });
export const getMe = () => api.get('/accounts/me/');
export const updateMe = (data) => api.patch('/accounts/me/', data);
export const getUsers = (q = '') => api.get(`/accounts/users/${q ? `?q=${q}` : ''}`);
