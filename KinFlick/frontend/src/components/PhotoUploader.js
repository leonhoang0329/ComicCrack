import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPhotos } from '../api';
import './PhotoUploader.css';

const PhotoUploader = ({ onUploadSuccess }) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = acceptedFiles => {
    // Create previews for each file
    const newFiles = acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    }));
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': []
    },
    maxSize: 10485760, // 10MB
  });

  const removeFile = (index) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setError('Please select at least one photo to upload');
      return;
    }

    try {
      setUploading(true);
      setError(null);

      // Log upload process
      console.log(`Preparing to upload ${files.length} files`);
      
      const formData = new FormData();
      files.forEach((file, index) => {
        console.log(`Adding file ${index + 1}/${files.length}: ${file.name} (${file.size} bytes)`);
        formData.append('photos', file);
      });

      // Simulate progress with slower progress to allow more time for actual upload
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 80) {
            // Cap at 80% for simulated progress - the final 20% will be set when upload completes
            return 80;
          }
          return prev + 5;
        });
      }, 500);

      console.log('Starting upload to server...');
      const response = await uploadPhotos(formData);
      console.log('Upload completed successfully:', response);

      clearInterval(interval);
      setUploadProgress(100);

      // Clean up previews
      files.forEach(file => URL.revokeObjectURL(file.preview));
      
      setFiles([]);
      setUploading(false);
      setUploadProgress(0);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.photos);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="photo-uploader">
      <div 
        {...getRootProps()} 
        className={`dropzone ${isDragActive ? 'active' : ''}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the photos here...</p>
        ) : (
          <p>Drag 'n' drop some photos here, or click to select files</p>
        )}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {files.length > 0 && (
        <div className="preview-container">
          <h3>Selected Photos ({files.length})</h3>
          <div className="photo-previews">
            {files.map((file, index) => (
              <div key={index} className="photo-preview">
                <img src={file.preview} alt={`Preview ${index}`} />
                <button 
                  className="remove-btn" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          {uploading ? (
            <div className="upload-progress">
              <div 
                className="progress-bar" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <span>{uploadProgress}%</span>
            </div>
          ) : (
            <button 
              className="btn btn-primary upload-btn" 
              onClick={handleUpload}
              disabled={files.length === 0}
            >
              Upload Photos
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PhotoUploader;
