import axios from 'axios';

// Configure axios with credentials
axios.defaults.withCredentials = true;

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
export const createDiaryPage = async (photoIds, progressCallback) => {
  console.log('API: createDiaryPage called with photoIds:', photoIds);
  
  // Let's use regular POST instead of SSE due to authentication issues with EventSource
  try {
    setTimeout(() => {
      if (progressCallback) {
        progressCallback({
          status: 'starting',
          currentPhoto: 0,
          totalPhotos: photoIds.length,
          percentComplete: 0
        });
      }
    }, 0);
    
    // Set up an interval to simulate progress while the request is processing
    let currentPhoto = 0;
    const progressInterval = setInterval(() => {
      if (progressCallback && currentPhoto < photoIds.length) {
        currentPhoto++;
        progressCallback({
          status: 'processing',
          currentPhoto,
          totalPhotos: photoIds.length,
          percentComplete: Math.round((currentPhoto / photoIds.length) * 100),
          photoId: photoIds[currentPhoto - 1]
        });
      }
    }, 3000); // Update every 3 seconds
    
    // Make the regular POST request
    const response = await axios.post('/api/diary', { photoIds });
    
    // Clear the interval when done
    clearInterval(progressInterval);
    
    // Send final progress update
    if (progressCallback) {
      progressCallback({
        status: 'complete',
        currentPhoto: photoIds.length,
        totalPhotos: photoIds.length,
        percentComplete: 100,
        diaryPage: response.data
      });
    }
    
    console.log('API: createDiaryPage response:', response.data);
    return response.data;
  } catch (error) {
    console.error('API: createDiaryPage error:', error.response?.data || error.message);
    if (progressCallback) {
      progressCallback({
        status: 'error',
        message: error.response?.data?.message || error.message
      });
    }
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
