import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const search = async (query) => {
  const response = await axios.get(`${API_BASE_URL}/search?q=${query}`);
  return response.data;
};