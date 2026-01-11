import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getLists = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/lists/project/${projectId}`);
  return response.data;
};

export const createList = async (list) => {
  const response = await axios.post(`${API_BASE_URL}/lists`, list);
  return response.data;
};

export const updateList = async (id, list) => {
  const response = await axios.put(`${API_BASE_URL}/lists/${id}`, list);
  return response.data;
};

export const deleteList = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/lists/${id}`);
  return response.data;
};