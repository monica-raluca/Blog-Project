import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface AuthContextType {
	token: string | null;
	currentUser: string | null;
	profilePicture: string | null;
	login: (userToken: string, username: string) => void;
	logout: () => void;
	updateProfilePicture: (profilePicture: string | null) => void;
}

interface AuthProviderProps {
	children: ReactNode;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [token, setToken] = useState<string | null>(() => {
		const savedToken = localStorage.getItem('token');
		return savedToken ? JSON.parse(savedToken) : null;
	});
	const [currentUser, setCurrentUser] = useState<string | null>(() => 
		localStorage.getItem('currentUser')
	);
	const [profilePicture, setProfilePicture] = useState<string | null>(() => 
		localStorage.getItem('profilePicture')
	);

	const login = (userToken: string, username: string): void => {
		localStorage.setItem('token', userToken);
        localStorage.setItem('currentUser', username);
		setToken(JSON.parse(localStorage.getItem('token') || 'null'));
        setCurrentUser(username);
	};

	const logout = (): void => {
		localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('profilePicture');
		setToken(null);
		setCurrentUser(null);
		setProfilePicture(null);
	};

	const updateProfilePicture = (newProfilePicture: string | null): void => {
		if (newProfilePicture) {
			localStorage.setItem('profilePicture', newProfilePicture);
		} else {
			localStorage.removeItem('profilePicture');
		}
		setProfilePicture(newProfilePicture);
	};

	// const hasRole = (role: string): boolean => {
	// 	return user?.authorities?.includes(role) || false;
	// };

    const value: AuthContextType = {
        token,
        currentUser,
        profilePicture,
        login,
        logout,
        updateProfilePicture
    };

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
}; 