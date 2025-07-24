import { createContext, useContext, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [token, setToken] = useState(() => JSON.parse(localStorage.getItem('token')));
	const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('currentUser'));

	const login = (userToken, username) => {
		localStorage.setItem('token', userToken);
        localStorage.setItem('currentUser', username);
		setToken(userToken);
        setCurrentUser(username);
	};

	const logout = () => {
		localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
		setToken(null);
		setCurrentUser(null);
	};

	// const hasRole = (role) => {
	// 	return user?.authorities?.includes(role) || false;
	// };

    const value = {
        token,
        currentUser,
        login,
        logout
    };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
