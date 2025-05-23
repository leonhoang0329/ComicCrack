import React from 'react';
import './PhotoGrid.css';

const PhotoGrid = ({ photos, onSelect, selectedIds = [], processingPhotoId = null, onDelete }) => {
  const toggleSelect = (id) => {
    if (onSelect) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(photoId => photoId !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    }
  };

  const handleDelete = (e, id) => {
    // Stop propagation to prevent selection when clicking delete
    e.stopPropagation();
    if (onDelete) {
      // Confirm before deletion
      if (window.confirm('Are you sure you want to delete this photo?')) {
        onDelete(id);
      }
    }
  };

  // Ensure photos is an array
  const photoArray = Array.isArray(photos) ? photos : [];
  
  if (!photoArray.length) {
    return <p className="no-photos-message">No photos available</p>;
  }

  return (
    <div className="photo-grid">
      {photoArray.map(photo => (
        <div 
          key={photo._id} 
          className={`photo-item ${selectedIds.includes(photo._id) ? 'selected' : ''} ${processingPhotoId === photo._id ? 'processing' : ''}`}
          onClick={() => toggleSelect(photo._id)}
        >
          <img 
            src={photo.cloudinaryUrl || photo.path || ''} 
            alt={photo.caption || 'Photo'} 
            onError={(e) => {
              console.log('Error loading image, attempting data URL fallback');
              // If regular URL fails and we have a data URL path format, use it directly
              if (e.target.src && !e.target.src.startsWith('data:') && photo.path && photo.path.startsWith('data:')) {
                e.target.src = photo.path;
              }
            }}
          />
          {onSelect && (
            <div className="select-overlay">
              <div className="checkbox">
                {selectedIds.includes(photo._id) && <span>✓</span>}
              </div>
            </div>
          )}
          {processingPhotoId === photo._id && (
            <div className="processing-overlay">
              <div className="processing-indicator">
                <div className="spinner"></div>
                <span>Processing...</span>
              </div>
            </div>
          )}
          {onDelete && (
            <div className="delete-button" onClick={(e) => handleDelete(e, photo._id)}>
              <span>×</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
