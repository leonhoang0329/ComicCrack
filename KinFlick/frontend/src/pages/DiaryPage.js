import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import { getUserDiaryPages, deleteDiaryPage } from '../api';
import './DiaryPage.css';

const DiaryPage = () => {
  const [diaryPages, setDiaryPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDiaryPages();
  }, []);

  const fetchDiaryPages = async () => {
    try {
      setLoading(true);
      const pages = await getUserDiaryPages();
      setDiaryPages(pages);
      setLoading(false);
    } catch (error) {
      setError('Failed to fetch diary pages');
      setLoading(false);
    }
  };

  const handleDeletePage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this diary page?')) {
      return;
    }

    try {
      await deleteDiaryPage(id);
      setDiaryPages(prevPages => prevPages.filter(page => page._id !== id));
    } catch (error) {
      setError('Failed to delete diary page');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="diary-page-list">
      <h1>My Diary</h1>
      <CountdownTimer />
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {loading ? (
        <div className="loading-spinner">Loading diary pages...</div>
      ) : diaryPages.length === 0 ? (
        <div className="no-pages">
          <p>You don't have any diary pages yet.</p>
          <Link to="/upload" className="btn btn-primary">Create Your First Diary Page</Link>
        </div>
      ) : (
        <div className="diary-grid">
          {diaryPages.map(page => (
            <div key={page._id} className="diary-card">
              <div className="diary-card-header">
                <h2>{formatDate(page.createdAt)}</h2>
                <div className="photo-count">{page.photos.length} photos</div>
              </div>
              
              <div className="diary-photos-preview">
                {page.photos.slice(0, 3).map(photo => (
                  <div key={photo._id} className="photo-thumbnail">
                    <img 
                      src={`${process.env.REACT_APP_API_URL || ''}/${photo.path}`} 
                      alt="Diary" 
                    />
                  </div>
                ))}
                {page.photos.length > 3 && (
                  <div className="more-photos">
                    +{page.photos.length - 3} more
                  </div>
                )}
              </div>
              
              <div className="diary-content-preview">
                {page.content.substring(0, 150)}...
              </div>
              
              <div className="diary-actions">
                <Link to={`/diary/${page._id}`} className="btn btn-primary">View</Link>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeletePage(page._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="create-new">
        <Link to="/upload" className="btn btn-success">
          Create New Diary Page
        </Link>
      </div>
    </div>
  );
};

export default DiaryPage;
