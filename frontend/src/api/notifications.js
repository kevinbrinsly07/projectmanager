import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

export const getNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/notifications`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
  return response.data;
};