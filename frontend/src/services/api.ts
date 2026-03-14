import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('medora_token');
      localStorage.removeItem('medora_user');
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
  getAdherenceChart: (days?: number) => api.get('/medicines/adherence/chart', { params: { days: days || 7 } }),
  getReminders: () => api.get('/medicines/reminders'),
  getMissedDoses: () => api.get('/medicines/missed'),
  getHistory: (date?: string) => api.get('/medicines/history', { params: date ? { date } : {} }),
  getLowStock: () => api.get('/medicines/low-stock'),
  add: (data: object) => api.post('/medicines', data),
  update: (id: string, data: object) => api.put(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
  markTaken: (data: { medicineId: string; scheduledDate: string; scheduledTime?: string; markedLate?: boolean }) =>
    api.post('/medicines/mark-taken', data),
  markSkipped: (data: { medicineId: string; scheduledDate: string; scheduledTime?: string }) =>
    api.post('/medicines/mark-skipped', data),
};

export const foodAPI = {
  getToday: () => api.get('/food/today'),
  getWeekly: () => api.get('/food/weekly'),
  getInsights: () => api.get('/food/insights'),
  search: (query: string) => api.get('/food/search', { params: { q: query } }),
  analyzeImage: (imageBase64: string) => api.post('/food/analyze-image', { image: imageBase64 }),
  parseIngredients: (ingredients: string[] | string) => api.post('/food/parse-ingredients', { ingredients }),
  add: (data: object) => api.post('/food', data),
  delete: (id: string) => api.delete(`/food/${id}`),
};

export const wellnessAPI = {
  getAll: () => api.get('/wellness'),
  getToday: () => api.get('/wellness/today'),
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
