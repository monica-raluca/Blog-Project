import React, { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { hasRole } from './AuthApi';

interface AdminRouteProps {
    children: ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
    const isAdmin = hasRole('ADMIN');
    return isAdmin ? <>{children}</> : <Navigate to="/forbidden" replace />;
};

export default AdminRoute;