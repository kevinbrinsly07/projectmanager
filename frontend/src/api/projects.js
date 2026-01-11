import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getProjects = async () => {
  const response = await axios.get(`${API_BASE_URL}/projects`);
  return response.data;
};

export const getProject = async (id) => {
  const response = await axios.get(`${API_BASE_URL}/projects/${id}`);
  return response.data;
};

export const createProject = async (project) => {
  const response = await axios.post(`${API_BASE_URL}/projects`, project);
  return response.data;
};

export const updateProject = async (id, project) => {
  const response = await axios.put(`${API_BASE_URL}/projects/${id}`, project);
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/projects/${id}`);
  return response.data;
};