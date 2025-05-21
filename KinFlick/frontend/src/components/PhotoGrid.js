import React from 'react';
import './PhotoGrid.css';

const PhotoGrid = ({ photos, onSelect, selectedIds = [] }) => {
  const toggleSelect = (id) => {
    if (onSelect) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(photoId => photoId !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    }
  };

  if (!photos || photos.length === 0) {
    return <p className="no-photos-message">No photos available</p>;
  }

  return (
    <div className="photo-grid">
      {photos.map(photo => (
        <div 
          key={photo._id} 
          className={`photo-item ${selectedIds.includes(photo._id) ? 'selected' : ''}`}
          onClick={() => toggleSelect(photo._id)}
        >
          <img 
            src={`${process.env.REACT_APP_API_URL || ''}/${photo.path}`} 
            alt={photo.caption || 'Photo'} 
          />
          {onSelect && (
            <div className="select-overlay">
              <div className="checkbox">
                {selectedIds.includes(photo._id) && <span>✓</span>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PhotoGrid;
