// API utility functions for ESG app
const API_BASE = 'http://localhost:3004/api';

// Get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// API request wrapper
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  login: (credentials) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),
  
  signup: (userData) => apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),
  
  getPendingUsers: () => apiRequest('/auth/pending-users'),
  
  approveUser: (email) => apiRequest(`/auth/approve-user/${email}`, {
    method: 'PUT',
  }),
  
  rejectUser: (email) => apiRequest(`/auth/reject-user/${email}`, {
    method: 'DELETE',
  }),
};

// ESG Data API
export const esgAPI = {
  saveData: (esgData) => apiRequest('/esg/data', {
    method: 'POST',
    body: JSON.stringify(esgData),
  }),
  
  getData: (userId) => apiRequest(`/esg/data/${userId}`),
  
  getScores: (userId) => apiRequest(`/esg/scores/${userId}`),
  
  getKPIs: (userId) => apiRequest(`/esg/kpis/${userId}`),
};

// Health check
export const healthCheck = () => apiRequest('/health');

export default { authAPI, esgAPI, healthCheck };