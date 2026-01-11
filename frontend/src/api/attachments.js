import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAttachments = async (taskId) => {
  const response = await axios.get(`${API_BASE_URL}/attachments/task/${taskId}`);
  return response.data;
};

export const uploadAttachment = async (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('task', taskId);
  const response = await axios.post(`${API_BASE_URL}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const deleteAttachment = async (id) => {
  const response = await axios.delete(`${API_BASE_URL}/attachments/${id}`);
  return response.data;
};