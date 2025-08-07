import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/button';
import '../../format/Error.css';
import '../../format/Login.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="error-wrapper">
      <div className="error-card">
        <div className="error-code">404</div>
        <div className="error-title">Page Not Found</div>
        <div className="error-message">The page you are looking for does not exist.</div>
        <Button variant="cloud" size="elegant" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
};

export default NotFound; 