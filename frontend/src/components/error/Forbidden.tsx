import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/button';
import '../../format/Error.css';
import '../../format/Login.css';

const Forbidden: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="error-wrapper">
      <div className="error-card">
        <div className="error-code">403</div>
        <div className="error-title">Forbidden</div>
        <div className="error-message">You do not have permission to access this page.</div>
        <Button variant="cloud" size="elegant" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
};

export default Forbidden; 