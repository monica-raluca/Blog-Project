import { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser } from '../api/AuthApi';

import '../format/Login.css';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const userToken = await loginUser({ username, password });

			localStorage.setItem('token', JSON.stringify(userToken.token));
            localStorage.setItem('currentUser', username);
            
			setError(null);

			navigate('/articles');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div>
			<h2>Login</h2>
			<form onSubmit={handleSubmit}>
				<div>
					<label>Username:</label>
					<input
						type="text"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						required
					/>
				</div>
				<div>
					<label>Password:</label>
					<input
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
				</div>
				<button type="submit">Login</button>
			</form>
			{error && <p style={{ color: 'red' }}>{error}</p>}
		</div>
	);
}
