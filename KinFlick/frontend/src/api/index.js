import axios from 'axios';

// Photo API calls
export const uploadPhotos = async (formData) => {
  const response = await axios.post('/api/photos/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const getUserPhotos = async () => {
  const response = await axios.get('/api/photos');
  return response.data;
};

export const deletePhoto = async (id) => {
  const response = await axios.delete(`/api/photos/${id}`);
  return response.data;
};

// Diary API calls
export const createDiaryPage = async (photoIds) => {
  console.log('API: createDiaryPage called with photoIds:', photoIds);
  try {
    const response = await axios.post('/api/diary', { photoIds });
    console.log('API: createDiaryPage response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: createDiaryPage error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserDiaryPages = async () => {
  const response = await axios.get('/api/diary');
  return response.data;
};

export const getDiaryPage = async (id) => {
  const response = await axios.get(`/api/diary/${id}`);
  return response.data;
};

export const deleteDiaryPage = async (id) => {
  const response = await axios.delete(`/api/diary/${id}`);
  return response.data;
};
