import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getNotifications = async () => {
  const response = await axios.get(`${API_BASE_URL}/notifications`);
  return response.data;
};

export const markAsRead = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
  return response.data;
};