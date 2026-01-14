import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

export const getUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/users`);
  return response.data;
};