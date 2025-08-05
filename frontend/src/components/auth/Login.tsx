import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser } from '../../api/AuthApi';
import { Link } from 'react-router';
import { useAuth } from '../../api/AuthContext';
import { useForm } from 'react-hook-form';

import '../../format/Login.css';

interface LoginFormData {
    username: string;
    password: string;
}

const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<LoginFormData>();

    const onSubmit = async (data: LoginFormData): Promise<void> => {
        try {
            const userToken = await loginUser(data);
            login(JSON.stringify(userToken.token), data.username);
            setError(null);
            navigate('/public/articles');
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <input
                            type="text"
                            {...register("username", {required: "Username is required"})}
                        />
                        <label>Username</label>
                        {errors.username && (
                            <p className="field-error">{errors.username.message}</p>
                        )}
                    </div>
                    <div className="input-group">
                        <input
                            type="password"
                            {...register("password", {required: "Password is required"})}
                        />
                        <label>Password</label>
                        {errors.password && (
                            <p className="field-error">{errors.password.message}</p>
                        )}
                    </div>
                    <input type="submit" value="Login" className="btn" />
                    <div><em>Don't have an account? <Link to="/register">Register</Link></em></div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Login; 