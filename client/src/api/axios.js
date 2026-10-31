import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, // Send HttpOnly cookies automatically
});

export default api;
