import axios from 'axios';

const API_BASE_URL = 'https://projectmanager-backend-lo7r.onrender.com/api';

export const getAllUsers = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/users`);
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await axios.put(`${API_BASE_URL}/admin/users/${id}/role`, { role });
  return response.data;
};

export const getAllProjects = async () => {
  const response = await axios.get(`${API_BASE_URL}/admin/projects`);
  return response.data;
};

export const deleteAnyProject = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/admin/projects/${id}`);
  return response.data;
};

export const updateProjectMembers = async (id, members) => {
  const response = await axios.put(`${API_BASE_URL}/admin/projects/${id}/members`, { members });
  return response.data;
};