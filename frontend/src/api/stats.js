import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.PROD
  ? 'https://projectmanager-backend-lo7r.onrender.com/api'
  : 'http://localhost:5000/api';

export const getStats = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/stats/project/${projectId}`);
  return response.data;
};