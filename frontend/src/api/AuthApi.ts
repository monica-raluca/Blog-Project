import { jwtDecode } from 'jwt-decode';
import { RegisterUserData, LoginUserData, AuthResponse, User, JwtPayload, ApiError } from './types';

export async function registerUser(userData: RegisterUserData): Promise<AuthResponse> {
	const res = await fetch('/api/users/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(userData),
	});

	if (!res.ok) {
		const errorData: ApiError = await res.json().catch(() => ({}));
		throw new Error(errorData.message || 'Register failed');
	}

	return res.json();
}

export async function loginUser(credentials: LoginUserData): Promise<AuthResponse> {
	const res = await fetch('/api/users/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(credentials),
	});

	if (!res.ok) {
		const errorData: ApiError = await res.json().catch(() => ({}));
		throw new Error(errorData.message || 'Login failed');
	}

	return res.json();
}

export function getCurrentUser(): User | null {
	const token = localStorage.getItem('token');
	if (!token) return null;

	try {
		const decoded = jwtDecode<JwtPayload>(token);
		return {
			username: decoded.sub,
			authorities: decoded.authorities.flatMap(authority => authority.authority),
		};
	} catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
}

export function hasRole(role: string): boolean {
	const user = getCurrentUser();
	if (!user || !user.username || !user.authorities) return false;
	return user.authorities.includes("ROLE_" + role);
}

export function hasUser(username: string): boolean {
	const user = getCurrentUser();
	if (!user || !user.username || !user.authorities) return false;
	console.log("TEST permission" + user + username);
	return user.username === username;
}

export function createAuthHeaders(token: string): HeadersInit {
	return {
		'Content-Type': 'application/json',
		'Authorization': `Bearer ${token}`
	};
} 