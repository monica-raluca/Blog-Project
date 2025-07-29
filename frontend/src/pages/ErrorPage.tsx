import React from 'react';
import { useNavigate } from 'react-router';
import '../format/Error.css';
import '../format/Login.css';

interface ErrorPageProps {
  message?: string;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  const navigate = useNavigate();
  return (
    <div className="error-wrapper">
      <div className="error-card">
        <div className="error-title">Something went wrong</div>
        <div className="error-message">{message || 'An unexpected error occurred.'}</div>
        <button className="btn" onClick={() => navigate('/')}>Go Home</button>
      </div>
    </div>
  );
};

export default ErrorPage; 