import React, { useState } from "react";
import { registerUser } from "../api/AuthApi";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useAuth } from "../api/AuthContext";

const Register: React.FC = () => {
    const [lastName, setLastName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        try {
            const userToken = await registerUser({ lastName, firstName, username, password, email });
            login(JSON.stringify(userToken.token), username);
            setError(null);
            navigate('/articles');
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else if (errorMessage.toLowerCase().includes('register')) {
                setError(errorMessage);
            } else {
                navigate('/error');
            }
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">                   
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                        />
                        <label>First name</label>
                    </div>
                    <div className="input-group">
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                        />
                        <label>Last name</label>
                    </div>
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
                    <div className="input-group">                     
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label>Email</label>
                    </div>
                    <button type="submit" className="btn">Register</button>
                    <div><em>Already have an account? <Link to="/login">Login</Link></em></div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Register; 