import axios from 'axios';

// Ensure the API URL is correct for all teammates
const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically add the auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle 401 Unauthorized errors (logout if token is invalid)
api.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('authToken');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  login: (credentials: Record<string, unknown>) => api.post('/auth/login', credentials),
  register: (userData: Record<string, unknown>) => api.post('/auth/register', userData),
};

export const productsAPI = {
  getAll: () => api.get('/products'),
  create: (data: Record<string, unknown>) => api.post('/products', data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const ordersAPI = {
  getAll: () => api.get('/orders'),
  getStats: () => api.get('/orders/stats'),
  getWeekly: () => api.get('/orders/weekly'),
  create: (data: Record<string, unknown>) => api.post('/orders', data),
  updateStatus: (id: number, status: string) => api.put(`/orders/${id}/status`, { status }),
  delete: (id: number) => api.delete(`/orders/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  create: (data: Record<string, unknown>) => api.post('/inventory', data),
  updateQty: (id: number, quantity: number) => api.put(`/inventory/${id}`, { quantity }),
  delete: (id: number) => api.delete(`/inventory/${id}`),
};

export default api;
