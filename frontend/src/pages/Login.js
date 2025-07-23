import { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser } from '../api/AuthApi';
import { Link } from 'react-router';
import { useAuth } from '../api/AuthContext';

import '../format/Login.css';

export default function Login() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState(null);
	const navigate = useNavigate();

	const {login} = useAuth();

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const userToken = await loginUser({ username, password });

			// localStorage.setItem('token', JSON.stringify(userToken.token));
			// localStorage.setItem('currentUser', username);
			login(JSON.stringify(userToken.token), username);

			setError(null);
			navigate('/articles');
		} catch (err) {
			setError(err.message);
		}
	};

	return (
		<div className="login-wrapper">
			<div className="login-box">
				<h2>Login</h2>
				<form onSubmit={handleSubmit}>
					<div className="input-group">
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
						<label>Username</label>
					</div>
					<div className="input-group">
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
						<label>Password</label>
					</div>
					<button type="submit" className="btn">Login</button>
					<div><em>Don't have an account? <Link to="/register">Register</Link></em></div>
				</form>
				{error && <p className="error-message">{error}</p>}
			</div>
		</div>
	);
}
