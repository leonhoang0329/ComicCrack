import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../logo.png';
import './Navbar.css';

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <div className="navbar-brand">
          <Link to="/">
            <img src={logo} alt="ComicCrack Logo" className="navbar-logo" />
            <span className="navbar-title">ComicCrack</span>
          </Link>
        </div>
        <ul className="navbar-menu">
          <li className="navbar-item">
            <Link to="/">Home</Link>
          </li>
          {isAuthenticated ? (
            <>
              <li className="navbar-item">
                <Link to="/upload">Upload Photos</Link>
              </li>
              <li className="navbar-item">
                <Link to="/diary">My Funny Daily Story</Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="btn-link">Logout</button>
              </li>
            </>
          ) : (
            <>
              <li className="navbar-item">
                <Link to="/login">Login</Link>
              </li>
              <li className="navbar-item">
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
