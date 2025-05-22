import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import PhotoUploader from '../components/PhotoUploader';
import PhotoGrid from '../components/PhotoGrid';
import { getUserPhotos, createDiaryPage, deletePhoto } from '../api';
import './UploadPage.css';

const UploadPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    currentPhoto: 0,
    totalPhotos: 0,
    percentComplete: 0,
    status: null,
    processingPhotoId: null
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const fetchedPhotos = await getUserPhotos();
      setPhotos(fetchedPhotos);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch photos');
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newPhotos) => {
    setPhotos(prevPhotos => [...newPhotos, ...prevPhotos]);
  };

  const handleDeletePhoto = async (photoId) => {
    try {
      await deletePhoto(photoId);
      // Remove the deleted photo from state
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo._id !== photoId));
      // Also remove from selected photos if it was selected
      if (selectedIds.includes(photoId)) {
        setSelectedIds(prevIds => prevIds.filter(id => id !== photoId));
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setError('Failed to delete photo: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleProgressUpdate = (progressData) => {
    console.log('Progress update received:', progressData);
    setProcessingProgress(progressData);
    
    // If complete, navigate to the diary page
    if (progressData.status === 'complete' && progressData.diaryPage) {
      setIsGenerating(false);
      navigate(`/diary/${progressData.diaryPage._id}`);
    }
    
    // Handle errors
    if (progressData.status === 'error') {
      setError(`Error: ${progressData.message || 'Failed to generate diary page'}`);
      setIsGenerating(false);
    }
  };

  const handleGenerateDiaryPage = async () => {
    console.log('Generate diary button clicked', { selectedIds });
    if (selectedIds.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      setProcessingProgress({
        currentPhoto: 0,
        totalPhotos: selectedIds.length,
        percentComplete: 0,
        status: 'starting'
      });
      
      console.log('Calling createDiaryPage API with photoIds:', selectedIds);
      await createDiaryPage(selectedIds, handleProgressUpdate);
      
    } catch (error) {
      console.error('Error generating diary page:', error.response?.data || error.message);
      setError(`Failed to generate diary page: ${error.response?.data?.message || error.message}`);
      setIsGenerating(false);
      setProcessingProgress({
        status: 'error',
        percentComplete: 0
      });
    }
  };

  // Find the photo object by ID
  const getPhotoById = (photoId) => {
    return photos.find(photo => photo._id === photoId);
  };

  return (
    <div className="upload-page">
      <h1>Upload & Create Diary</h1>
      <CountdownTimer />
      
      <div className="upload-section">
        <h2>Upload New Photos</h2>
        <PhotoUploader onUploadSuccess={handleUploadSuccess} />
      </div>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="photos-section">
        <h2>Your Photos</h2>
        <p className="selection-info">
          {selectedIds.length > 0 
            ? `Selected ${selectedIds.length} photo${selectedIds.length > 1 ? 's' : ''}` 
            : 'Select photos to generate a diary page with Claude Vision'}
        </p>
        
        {loading ? (
          <div className="loading-spinner">Loading photos...</div>
        ) : (
          <>
            <PhotoGrid 
              photos={photos} 
              onSelect={setSelectedIds} 
              selectedIds={selectedIds} 
              processingPhotoId={processingProgress.photoId}
              onDelete={handleDeletePhoto}
            />
            
            {isGenerating && (
              <div className="processing-progress">
                <h3>Processing Photos</h3>
                <div className="progress-container">
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${processingProgress.percentComplete}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    {processingProgress.currentPhoto} of {processingProgress.totalPhotos} photos
                    ({processingProgress.percentComplete}% complete)
                  </div>
                </div>
                
                {processingProgress.photoId && (
                  <div className="current-photo">
                    <p>Currently processing:</p>
                    <div className="photo-preview">
                      {getPhotoById(processingProgress.photoId) && (
                        <img 
                          src={`${process.env.REACT_APP_API_URL || ''}/${getPhotoById(processingProgress.photoId)?.path}`} 
                          alt="Processing" 
                        />
                      )}
                    </div>
                    <div className="photo-status">
                      Status: {processingProgress.status || 'processing'}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {photos.length > 0 && (
              <button 
                className="btn btn-success generate-btn"
                onClick={handleGenerateDiaryPage}
                disabled={selectedIds.length === 0 || isGenerating}
              >
                {isGenerating ? 'Generating with Claude Vision...' : 'Generate Diary Page'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UploadPage;