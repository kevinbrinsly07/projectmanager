import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const getStats = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/stats/project/${projectId}`);
  return response.data;
};