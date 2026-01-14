import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

export const getStats = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/stats/project/${projectId}`);
  return response.data;
};