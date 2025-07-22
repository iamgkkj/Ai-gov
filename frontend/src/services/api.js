/**
 * AI-Gov API Client
 * 
 * This module provides a client for interacting with the AI-Gov backend API.
 */

import axios from 'axios';

// Create axios instance with base URL from environment variables
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => Promise.reject(error)
);

// API endpoints
const api = {
  // Proposal endpoints
  proposals: {
    getAll: (params) => apiClient.get('/proposals', { params }),
    getById: (id) => apiClient.get(`/proposals/${id}`),
    getFullProposal: (id) => apiClient.get(`/proposal-full/${id}`),
    create: (data) => apiClient.post('/proposals', data),
  },
  
  // Voting endpoints
  votes: {
    create: (data) => apiClient.post('/votes', data),
  },
  
  // Delegate endpoints
  delegates: {
    getPreferences: (address) => apiClient.get(`/delegate-preferences/${address}`),
    setPreferences: (data) => apiClient.post('/delegate-preferences', data),
    getHistory: (address) => apiClient.get(`/delegate-history/${address}`),
  },
  
  // Health check
  health: () => apiClient.get('/health'),
};

// Helper function to format IPFS URLs
export const getIpfsUrl = (hash) => {
  const gateway = process.env.REACT_APP_IPFS_GATEWAY || 'http://localhost:8080/ipfs/';
  return `${gateway}${hash}`;
};

export default api;