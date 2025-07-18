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
