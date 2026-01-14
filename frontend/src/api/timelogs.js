import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.PROD
  ? 'https://projectmanager-backend-lo7r.onrender.com/api'
  : 'http://localhost:5000/api';

export const getTimeLogs = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/timelogs/task/${taskId}`);
  return response.data;
};

export const startTimeTracking = async (taskId, description) => {
  const response = await axios.post(`${API_BASE_URL}/timelogs/start`, { task: taskId, description });
  return response.data;
};

export const stopTimeTracking = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/timelogs/stop/${id}`);
  return response.data;
};