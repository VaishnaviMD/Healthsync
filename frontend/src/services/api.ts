import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('healthsync_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('healthsync_token');
      localStorage.removeItem('healthsync_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

export const authAPI = {
  register: (data: object) => api.post('/auth/register', data),
  login: (data: object) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: object) => api.put('/auth/profile', data),
};

export const medicineAPI = {
  getAll: () => api.get('/medicines'),
  getAdherence: () => api.get('/medicines/adherence'),
  add: (data: object) => api.post('/medicines', data),
  update: (id: string, data: object) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
};

export const foodAPI = {
  getToday: () => api.get('/food/today'),
  getWeekly: () => api.get('/food/weekly'),
  add: (data: object) => api.post('/food', data),
  delete: (id: string) => api.delete(`/food/${id}`),
};

export const wellnessAPI = {
  getAll: () => api.get('/wellness'),
  add: (data: object) => api.post('/wellness', data),
};

export const vaccinationAPI = {
  getAll: () => api.get('/vaccinations'),
  add: (data: object) => api.post('/vaccinations', data),
  update: (id: string, data: object) => api.put(`/vaccinations/${id}`, data),
  delete: (id: string) => api.delete(`/vaccinations/${id}`),
};

export const surveyAPI = {
  getStatus: () => api.get('/survey/status'),
  submit: (data: object) => api.post('/survey/submit', data),
};

export const healthReportAPI = {
  get: () => api.get('/health-report'),
};

export const menstrualAPI = {
  get: () => api.get('/womens-health'),
  getPredictions: () => api.get('/womens-health/predictions'),
  save: (data: object) => api.post('/womens-health', data),
};

export const fitnessAPI = {
  getAll: () => api.get('/fitness'),
  getStreak: () => api.get('/fitness/streak'),
  add: (data: object) => api.post('/fitness', data),
  update: (id: string, data: object) => api.put(`/fitness/${id}`, data),
  delete: (id: string) => api.delete(`/fitness/${id}`),
};

export const aiAPI = {
  chat: (messages: object[]) => api.post('/ai/chat', { messages }),
};

export const interactionAPI = {
  check: (medicine: string) => api.post('/interactions/check', { medicine }),
};
