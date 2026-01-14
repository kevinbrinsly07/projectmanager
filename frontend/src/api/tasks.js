import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

export const getTasks = async (projectId) => {
  const response = await axios.get(`${API_BASE_URL}/tasks/project/${projectId}`);
  return response.data;
};

export const getUserTasks = async () => {
  const response = await axios.get(`${API_BASE_URL}/tasks/user`);
  return response.data;
};

export const createTask = async (task) => {
  const response = await axios.post(`${API_BASE_URL}/tasks`, task);
  return response.data;
};

export const updateTask = async (id, task) => {
  const response = await axios.put(`${API_BASE_URL}/tasks/${id}`, task);
  return response.data;
};

export const deleteTask = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/tasks/${id}`);
  return response.data;
};