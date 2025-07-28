import React from 'react';
import { useNavigate } from 'react-router';
import '../format/Error.css';
import '../format/Login.css';

export default function Forbidden() {
  const navigate = useNavigate();
  return (
    <div className="error-wrapper">
      <div className="error-card">
        <div className="error-code">403</div>
        <div className="error-title">Forbidden</div>
        <div className="error-message">You do not have permission to access this page.</div>
        <button className="btn" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );
} 