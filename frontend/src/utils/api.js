import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const experimentAPI = {
  getAll: (params) => api.get('/experiments', { params }),
  getById: (id) => api.get(`/experiments/${id}`),
  create: (data) => api.post('/experiments', data),
  update: (id, data) => api.put(`/experiments/${id}`, data),
  delete: (id) => api.delete(`/experiments/${id}`),
  generateInsights: (id) => api.post(`/experiments/${id}/insights`),
};

export const aiAPI = {
  query: (query) => api.post('/query', { query }),
  suggestHyperparameters: (data) => api.post('/suggest-hyperparameters', data),
  compare: (experimentIds) => api.post('/compare', { experimentIds }),
  getAnomalies: () => api.get('/anomalies'),
};

export const statsAPI = {
  getStats: () => api.get('/stats'),
  getTrends: (params) => api.get('/trends', { params }),
};