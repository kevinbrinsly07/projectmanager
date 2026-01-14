import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.PROD
  ? 'https://projectmanager-backend-lo7r.onrender.com/api'
  : 'http://localhost:5000/api';

export const getComments = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/comments/task/${taskId}`);
  return response.data;
};

export const createComment = async (comment) => {
  const response = await axios.post(`${API_BASE_URL}/comments`, comment);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/comments/${id}`);
  return response.data;
};