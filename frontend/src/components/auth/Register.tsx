import React, { useState } from "react";
import { registerUser } from "../../api/AuthApi";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useAuth } from "../../api/AuthContext";
import { useForm } from 'react-hook-form';

import '../../format/Login.css';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
}

const Register: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<RegisterFormData>();

    const onSubmit = async (data: RegisterFormData): Promise<void> => {
        try {
            const userToken = await registerUser(data);
            login(JSON.stringify(userToken.token), data.username);
            setError(null);
            navigate('/public/articles');
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
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">                   
                        <input type="text"
                            {...register("firstName", {required: "First name is required" })}
                        />
                        <label>First name</label>
                        {errors.firstName && (
                            <p className="field-error">{errors.firstName.message}</p>
                        )}
                    </div>
                    <div className="input-group">
                        <input type="text"
                            {...register("lastName", {required: "Last name is required"})}
                        />
                        <label>Last name</label>
                        {errors.lastName && (
                            <p className="field-error">{errors.lastName.message}</p>
                        )}
                    </div>
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
                    <div className="input-group">                     
                        <input
                            type="email"
                            {...register("email", {required: "Email is required", pattern: /^\S+@\S+$/i})}
                        />
                        <label>Email</label>
                        {errors.email && (
                            <p className="field-error">{errors.email.message}</p>
                        )}
                    </div>
                    <input type="submit" value="Register" className="btn" />
                    <div><em>Already have an account? <Link to="/login">Login</Link></em></div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Register; 