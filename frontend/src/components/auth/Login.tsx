import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { loginUser } from '../../api/AuthApi';
import { Link } from 'react-router';
import { useAuth } from '../../api/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import * as yup from 'yup';

import '../../format/Login.css';
import { Label } from '@/components/ui/label';

interface LoginFormData {
    username: string;
    password: string;
}

const loginSchema = yup.object({
    username: yup.string().required('Username is required'),
    password: yup.string().required('Password is required')
}).required();

type FormData = yup.InferType<typeof loginSchema>;


const Login: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { login } = useAuth();
    
    const { 
        register, 
        handleSubmit, 
        formState: { errors } 
    } = useForm<FormData>({
        resolver: yupResolver(loginSchema)
    });

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
        <div className="flex justify-center items-center min-h-screen">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
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
                    <Button variant="dreamy" size="auth" type="submit">Login</Button>
                    <div><em>Don't have an account? <Link to="/register">Register</Link></em></div>
                </form>
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
};

export default Login; 