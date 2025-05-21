import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CountdownTimer from '../components/CountdownTimer';
import DiaryPageRenderer from '../components/DiaryPageRenderer';
import { getDiaryPage } from '../api';
import './ViewDiaryPage.css';

const ViewDiaryPage = () => {
  const [diaryPage, setDiaryPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchDiaryPage = async () => {
      try {
        setLoading(true);
        const data = await getDiaryPage(id);
        setDiaryPage(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch diary page');
        setLoading(false);
      }
    };

    fetchDiaryPage();
  }, [id]);

  if (loading) {
    return <div className="loading-spinner">Loading diary page...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!diaryPage) {
    return <div className="alert alert-danger">Diary page not found</div>;
  }

  return (
    <div className="view-diary-page">
      <div className="page-header">
        <Link to="/diary" className="back-link">&larr; Back to Diary</Link>
        <CountdownTimer />
      </div>
      
      <DiaryPageRenderer diaryPage={diaryPage} />
    </div>
  );
};

export default ViewDiaryPage;
