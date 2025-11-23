import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Candidates
export const getCandidates = () => api.get('/candidates');
export const getCandidate = (id) => api.get(`/candidates/${id}`);
export const createCandidate = (data) => api.post('/candidates', data);
export const updateCandidate = (id, data) => api.put(`/candidates/${id}`, data);
export const deleteCandidate = (id) => api.delete(`/candidates/${id}`);
export const bulkUploadCandidates = (candidates) => api.post('/candidates/bulk', { candidates });

// Voting
export const verifyVotingToken = (token) => api.get(`/votes/verify-token?token=${token}`);
export const submitVote = (token, candidateIds) => api.post('/votes/submit', { token, candidateIds });
export const getResults = () => api.get('/votes/results');
export const exportResults = () => api.get('/votes/export', { responseType: 'blob' });

// Auth
export const adminLogin = (username, password) => api.post('/auth/login', { username, password });
export const changePassword = (currentPassword, newPassword) =>
  api.post('/auth/change-password', { currentPassword, newPassword });

// Facilities
export const getFacilities = () => api.get('/facilities');
export const addFacility = (data) => api.post('/facilities', data);
export const bulkAddFacilities = (facilities) => api.post('/facilities/bulk', { facilities });
export const resendToken = (facilityId) => api.post(`/facilities/${facilityId}/resend-token`);

// Newsletter
export const subscribeNewsletter = (data) => api.post('/newsletter/subscribe', data);
export const unsubscribeNewsletter = (email) => api.post('/newsletter/unsubscribe', { email });
export const getNewsletterSubscribers = () => api.get('/newsletter');

// Audit Log
export const getAuditLogs = (limit = 100, offset = 0) => api.get(`/audit?limit=${limit}&offset=${offset}`);

export default api;
