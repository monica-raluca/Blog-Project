import React, { ReactNode } from 'react';
import { hasRole } from './AuthApi';
import { Navigate } from 'react-router';

export const token: string | null = JSON.parse(localStorage.getItem('token') || 'null');

interface RequireRolesProps {
    roles?: string[];
    children: ReactNode;
}

const RequireRoles: React.FC<RequireRolesProps> = ({ roles = [], children }) => {
    console.log(roles);
    // console.log(hasRole(role));
    const hasAccess = roles.some(role => hasRole(role));
    console.log(hasAccess);
    return hasAccess ? <>{children}</> : null;
};

export default RequireRoles; 