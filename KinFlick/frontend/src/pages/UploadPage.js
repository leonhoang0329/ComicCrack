import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import PhotoUploader from '../components/PhotoUploader';
import PhotoGrid from '../components/PhotoGrid';
import { getUserPhotos, createDiaryPage } from '../api';
import './UploadPage.css';

const UploadPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerateDiaryPage = async () => {
    console.log('Generate diary button clicked', { selectedIds });
    if (selectedIds.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    try {
      setError(null);
      setIsGenerating(true);
      console.log('Calling createDiaryPage API with photoIds:', selectedIds);
      
      const diaryPage = await createDiaryPage(selectedIds);
      console.log('Diary page created successfully:', diaryPage);
      
      setIsGenerating(false);
      navigate(`/diary/${diaryPage._id}`);
    } catch (error) {
      console.error('Error generating diary page:', error.response?.data || error.message);
      setError(`Failed to generate diary page: ${error.response?.data?.message || error.message}`);
      setIsGenerating(false);
    }
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
            />
            
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