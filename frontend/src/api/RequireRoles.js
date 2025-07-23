import { hasRole } from './AuthApi';
import { Navigate } from 'react-router';

export const token = JSON.parse(localStorage.getItem('token'));

const RequireRoles = ({ roles = [], children }) => {
    const hasAccess = roles.some(role => hasRole(role));
    return hasAccess ? children : null;
};

export default RequireRoles;