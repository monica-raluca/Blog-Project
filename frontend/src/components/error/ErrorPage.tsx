import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/button';
import '../../format/Error.css';
import '../../format/Login.css';
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
        <Button variant="cloud" size="elegant" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
};

export default ErrorPage; 