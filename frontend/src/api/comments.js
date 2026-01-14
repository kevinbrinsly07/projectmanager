import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

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