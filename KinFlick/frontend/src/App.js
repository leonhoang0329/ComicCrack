import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import axios from 'axios';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import DiaryPage from './pages/DiaryPage';
import ViewDiaryPage from './pages/ViewDiaryPage';

// Components
import Navbar from './components/Navbar';

// Route protection
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  return !isAuthenticated ? children : <Navigate to="/" />;
};

function App() {
  // Add API health check on app load
  useEffect(() => {
    const checkApiHealth = async () => {
      try {
        // Try to connect to API health check endpoint
        const response = await axios.get('/api/healthcheck');
        console.log('API Health Check:', response.data);
      } catch (error) {
        console.error('API Health Check Failed:', error.message);
      }
    };
    
    checkApiHealth();
  }, []);

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route 
            path="/login" 
            element={
              <PublicOnlyRoute>
                <LoginPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicOnlyRoute>
                <RegisterPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <PrivateRoute>
                <UploadPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/diary" 
            element={
              <PrivateRoute>
                <DiaryPage />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/diary/:id" 
            element={
              <PrivateRoute>
                <ViewDiaryPage />
              </PrivateRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
