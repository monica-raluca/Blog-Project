import { useState } from "react";
import { registerUser } from "../api/AuthApi";
import { useNavigate } from "react-router";

export default function Register() {
    const [lastName, setLastName] = useState('');
    const [firstName, setFirstName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
            e.preventDefault();
            try {
                const userToken = await registerUser({ lastName, firstName, username, password, email });
    
                localStorage.setItem('token', JSON.stringify(userToken.token));
                localStorage.setItem('currentUser', username);
                
                console.log(localStorage.getItem('currentUser'));
                console.log(JSON.parse(localStorage.getItem('token')));
                setError(null);
    
                navigate('/articles');
            } catch (err) {
                setError(err.message);
            }
        };

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <div>
					<label>First name:</label>
					<input
						type="text"
						value={firstName}
						onChange={(e) => setFirstName(e.target.value)}
						required
					/>
				</div>
                <div>
					<label>Last name:</label>
					<input
						type="text"
						value={lastName}
						onChange={(e) => setLastName(e.target.value)}
						required
					/>
				</div>
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
                <div>
					<label>Email:</label>
					<input
						type="text"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
				</div>
				<button type="submit">Register</button>
			</form>
			{error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}