import { hasRole } from './AuthApi';
import { Navigate } from 'react-router';

export const token = JSON.parse(localStorage.getItem('token'));

const RequireRoles = ({ roles = [], children }) => {
    console.log(roles);
    // console.log(hasRole(role));
    const hasAccess = roles.some(role => hasRole(role));
    console.log(hasAccess);
    return hasAccess ? children : null;
};

export default RequireRoles;