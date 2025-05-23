import axios from 'axios';

// Configure axios base URL for Vercel
// Use empty string for production (same-origin requests)
// Use localhost:5000 for development
const apiUrl = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000';

// Create axios instance with defaults
const api = axios.create({
  baseURL: apiUrl,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Photo API calls
export const uploadPhotos = async (formData) => {
  // For multipart/form-data, we need different headers
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'multipart/form-data'
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  console.log('Starting photo upload process...');
  
  try {
    // First check if Cloudinary is working by calling the test endpoint
    const testResponse = await axios.get(`${apiUrl}/api/cloudinary-test`);
    console.log('Cloudinary test result:', testResponse.data);
    
    // If test successful, proceed with the actual upload
    const response = await axios.post(`${apiUrl}/api/photos/upload`, formData, { 
      headers,
      timeout: 60000 // Increase timeout to 60 seconds for larger uploads
    });
    
    console.log('Upload successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload error:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserPhotos = async () => {
  const response = await api.get('/api/photos');
  return response.data;
};

export const deletePhoto = async (id) => {
  const response = await api.delete(`/api/photos/${id}`);
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
    const response = await api.post('/api/diary', { photoIds });
    
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
  const response = await api.get('/api/diary');
  return response.data;
};

export const getDiaryPage = async (id) => {
  const response = await api.get(`/api/diary/${id}`);
  return response.data;
};

export const deleteDiaryPage = async (id) => {
  const response = await api.delete(`/api/diary/${id}`);
  return response.data;
};
