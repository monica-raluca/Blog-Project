import React from 'react';
import { useNavigate } from 'react-router';
import '../format/Error.css';
import '../format/Login.css';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="error-wrapper">
      <div className="error-card">
        <div className="error-code">404</div>
        <div className="error-title">Page Not Found</div>
        <div className="error-message">The page you are looking for does not exist.</div>
        <button className="btn" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );
} 