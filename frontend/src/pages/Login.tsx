import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser } from '../api/AuthApi';
import { Link } from 'react-router';
import { useAuth } from '../api/AuthContext';

import '../format/Login.css';

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const userToken = await loginUser({ username, password });
            login(JSON.stringify(userToken.token), username);
            setError(null);
            navigate('/articles');
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else if (errorMessage.toLowerCase().includes('login')) {
                setError(errorMessage);
            } else {
                navigate('/error');
            }
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
};

export default Login; 