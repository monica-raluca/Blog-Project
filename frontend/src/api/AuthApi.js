import { jwtDecode } from 'jwt-decode';
// import { useEffect } from 'react';

// const token = JSON.parse(localStorage.getItem('token'));
// const currentUser = getCurrentUser() ? getCurrentUser().username : null;


export async function registerUser({ lastName, firstName, username, password, email }) {
	const res = await fetch('/api/users/register', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ lastName, firstName, username, password, email }),
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.message || 'Register failed');
	}

	return res.json();
}

export async function loginUser({ username, password }) {
	const res = await fetch('/api/users/login', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ username, password }),
	});

	if (!res.ok) {
		const errorData = await res.json().catch(() => ({}));
		throw new Error(errorData.message || 'Login failed');
	}

	return res.json();
}

export function getCurrentUser() {
	const token = localStorage.getItem('token');
	if (!token) return null;

	try {
		return {
			username: jwtDecode(token).sub,
			authorities: jwtDecode(token).authorities.flatMap(authority => authority.authority),
		}
	} catch (error) {
		console.error('Error decoding token:', error);
		return null;
	}
}

export function hasRole(role) {
	const user = getCurrentUser();
	if (!user || !user.username || !user.authorities) return false;
	return user.authorities.includes("ROLE_" + role);
}
