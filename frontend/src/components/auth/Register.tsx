import React, { useState } from "react";
import { registerUser } from "../../api/AuthApi";
import { useNavigate } from "react-router";
import { Link } from "react-router";
import { useAuth } from "../../api/AuthContext";
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import * as yup from 'yup';

import '../../format/Login.css';

interface RegisterFormData {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
    email: string;
}

const registerSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required'),
    email: yup.string().email('Invalid email address').required('Email is required')
}).required();

type FormData = yup.InferType<typeof registerSchema>;

const Register: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<FormData>({
        resolver: yupResolver(registerSchema)
    });

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
                        <Input type="text"
                            {...register("firstName")}
                        />
                        <Label>First name</Label>
                        <p className="field-error">{errors.firstName?.message}</p>
                    </div>
                    <div className="input-group">
                        <Input type="text"
                            {...register("lastName")}
                        />
                        <Label>Last name</Label>
                        <p className="field-error">{errors.lastName?.message}</p>
                    </div>
                    <div className="input-group">                    
                        <Input
                            type="text"
                            {...register("username")}
                        />
                        <Label>Username</Label>
                        <p className="field-error">{errors.username?.message}</p>
                    </div>
                    <div className="input-group">
                        <Input
                            type="password"
                            {...register("password")}
                        />
                        <Label>Password</Label>
                        <p className="field-error">{errors.password?.message}</p>
                    </div>
                    <div className="input-group">                     
                        <Input
                            type="email"
                            {...register("email")}
                        />
                        <Label>Email</Label>
                        <p className="field-error">{errors.email?.message}</p>
                    </div>
                    <Button variant="sunset" size="auth" type="submit">Register</Button>
                    <div><em>Already have an account? <Link to="/login">Login</Link></em></div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Register; 