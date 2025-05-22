import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CountdownTimer from '../components/CountdownTimer';
import logo from '../logo.png';
import './HomePage.css';

const HomePage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-page">
      <CountdownTimer />
      
      <div className="hero-section">
        <div className="hero-logo-container">
          <img src={logo} alt="ComicCrack Logo" className="hero-logo" />
        </div>
        <h1>Welcome to ComicCrack</h1>
        <p className="hero-text">
          Create hilarious daily stories from your photos. Capture your memories and transform them into fun, shareable moments that will make everyone smile.
        </p>
        
        {isAuthenticated ? (
          <div className="cta-buttons">
            <Link to="/upload" className="btn btn-primary cta-btn">Upload Photos</Link>
            <Link to="/diary" className="btn btn-secondary cta-btn">View My Funny Daily Story</Link>
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
            <h3>Funny Story Creator</h3>
            <p>Our advanced technology transforms your photos into hilarious daily stories you'll love to share.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Download & Share</h3>
            <p>Download your funny daily stories as PDFs to save or share with friends and family.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;