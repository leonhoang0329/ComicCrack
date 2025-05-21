import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <CountdownTimer />
      
      <div className="hero-section">
        <h1>Welcome to KinFlick</h1>
        <p className="hero-text">
          Create beautiful diary pages from your daily photos. Capture your memories and let Claude Vision generate meaningful stories.
        </p>
        
        {isAuthenticated ? (
          <div className="cta-buttons">
            <Link to="/upload" className="btn btn-primary cta-btn">Upload Photos</Link>
            <Link to="/diary" className="btn btn-secondary cta-btn">View My Diary</Link>
          </div>
        ) : (
          <div className="cta-buttons">
            <Link to="/register" className="btn btn-primary cta-btn">Get Started</Link>
            <Link to="/login" className="btn btn-secondary cta-btn">Login</Link>
          </div>
        )}
      </div>

      <div className="features-section">
        <h2>How It Works</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📷</div>
            <h3>Upload Photos</h3>
            <p>Upload photos of your day using our easy-to-use interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Daily Countdown</h3>
            <p>A countdown timer helps you track the time left in your day.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <h3>AI-Generated Stories</h3>
            <p>Claude Vision analyzes your photos and creates a personalized diary entry.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Download & Share</h3>
            <p>Download your diary page as a PDF to save or share with others.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;