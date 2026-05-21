import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const searchUserByPhone = (phone) =>
  api.get('/users/search', { params: { phone } });

export const assignRole = (userId, role) =>
  api.patch(`/users/${userId}/role`, { role });
