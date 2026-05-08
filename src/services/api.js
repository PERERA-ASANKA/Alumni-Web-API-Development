import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  verifyEmail: (token) => api.get(`/auth/verify/${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  validateResetToken: (token) => api.get(`/auth/reset-password/${token}/validate`),
  resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const profileAPI = {
  getProfile: () => api.get('/profile/me'),
  createProfile: (data) => api.post('/profile', data),
  updateProfile: (data) => api.put('/profile', data),
  uploadProfileImage: (formData) => api.post('/profile/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),

  addDegree: (data) => api.post('/profile/degrees', data),
  updateDegree: (id, data) => api.put(`/profile/degrees/${id}`, data),
  deleteDegree: (id) => api.delete(`/profile/degrees/${id}`),

  addCertification: (data) => api.post('/profile/certifications', data),
  updateCertification: (id, data) => api.put(`/profile/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/profile/certifications/${id}`),

  addLicence: (data) => api.post('/profile/licences', data),
  updateLicence: (id, data) => api.put(`/profile/licences/${id}`, data),
  deleteLicence: (id) => api.delete(`/profile/licences/${id}`),

  addCourse: (data) => api.post('/profile/courses', data),
  updateCourse: (id, data) => api.put(`/profile/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/profile/courses/${id}`),

  addEmployment: (data) => api.post('/profile/employment', data),
  updateEmployment: (id, data) => api.put(`/profile/employment/${id}`, data),
  deleteEmployment: (id) => api.delete(`/profile/employment/${id}`),
};

export const bidAPI = {
  getBids: () => api.get('/bids'),
  getBid: (id) => api.get(`/bids/${id}`),
  createBid: (data) => api.post('/bids', data),
  updateBid: (id, data) => api.patch(`/bids/${id}`, data),
  deleteBid: (id) => api.delete(`/bids/${id}`),
  getTomorrowStatus: () => api.get('/bids/status/tomorrow'),
  getMonthlyLimit: () => api.get('/bids/monthly-limit'),
};

export const apiKeyAPI = {
  getApiKeys: () => api.get('/keys'),
  createApiKey: (data) => api.post('/keys', data),
  updateApiKey: (id, data) => api.put(`/keys/${id}`, data),
  deleteApiKey: (id) => api.delete(`/keys/${id}`),
  revokeApiKey: (id) => api.patch(`/keys/${id}/revoke`),
  getApiKeyLogs: () => api.get('/keys/logs'),
};

export const publicAPI = {
  getAlumni: (filters) => api.get('/public/alumni', { params: filters }),
  getAlumniByProgram: (program) => api.get('/public/alumni/by-program', { params: { program } }),
  getAnalytics: (filters) => api.get('/public/analytics', { params: filters }),
  getSkillsGaps: (filters) => api.get('/public/skills-gaps', { params: filters }),
  getCourseStats: (filters) => api.get('/public/course-stats', { params: filters }),
  getIndustrySectors: () => api.get('/public/industry-sectors'),
  getPrograms: () => api.get('/public/programs'),
  getJobTitles: (filters) => api.get('/public/job-titles', { params: filters }),
  getTopEmployers: (filters) => api.get('/public/top-employers', { params: filters }),
  getGeographicData: (filters) => api.get('/public/geographic', { params: filters }),
  getAlumniOfTheDay: (params) => api.get('/public/alumni-of-the-day', { params }),
};

export default api;
