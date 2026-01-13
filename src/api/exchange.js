// src/api/exchange.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/exchanges'; // Adjust if your backend runs on a different port

// Helper to get the token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Connect a new exchange
export const connectExchange = (exchangeData) => {
  return axios.post(`${API_URL}/connect`, exchangeData, getAuthHeader());
};

// Get user's connected exchanges
export const getUserExchanges = () => {
  return axios.get(`${API_URL}/my-keys`, getAuthHeader());
};

// Delete a connected exchange key
export const deleteExchange = (id) => {
  return axios.delete(`${API_URL}/${id}`, getAuthHeader());
};