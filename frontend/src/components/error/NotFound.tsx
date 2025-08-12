import React from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../../../components/ui/button';
import '../../format/Error.css';
import '../../format/Login.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-[400px] backdrop-blur-[20px] shadow-[0_0_30px_rgba(0,0,0,0.5)] text-[#162938] !p-10 rounded-[20px] bg-[rgba(255,255,255,0.1)]">
        <div className="text-center text-[2em] mb-5 text-[#d32f2f] font-bold">404</div>
        <div className="text-center text-[1em] mb-5 text-[#d32f2f]">Page Not Found</div>
        <div className="text-center text-[1em] mb-5">The page you are looking for does not exist.</div>
        <Button className="w-full flex justify-center items-center mx-auto !mt-5" variant="cloud" size="elegant" onClick={() => navigate('/')}>Go Home</Button>
      </div>
    </div>
  );
};

export default NotFound; 