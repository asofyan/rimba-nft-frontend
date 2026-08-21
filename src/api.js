import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
});

// Auto-attach token ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Token invalid/kedaluwarsa → bersihkan & paksa login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== '/login') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Ambil pesan error yang ramah dari response backend
export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err.response?.data;
  if (data?.details?.length) return data.details.join(', ');
  return data?.error || fallback;
};

export default api;
