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
            <div className="w-[400px] backdrop-blur-[20px] shadow-[0_0_30px_rgba(0,0,0,0.5)] text-[#162938] !p-10 rounded-[20px] bg-[rgba(255,255,255,0.1)]">
                <h2 className="text-center text-[2em] mb-5">Login</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="relative !mx-0 !my-[30px]">
                        <Label className="!text-sm !text-[#495057] !font-semibold">Username</Label>
                        <Input
                            type="text"
                            {...register("username")}
                        />
                        <p className="!text-red-500 !text-sm !mt-1">{errors.username?.message}</p>
                    </div>
                    <div className="relative !mx-0 !my-[30px]">
                        <Label className="!text-sm !text-[#495057] !font-semibold">Password</Label>
                        <Input
                            type="password"
                            {...register("password")}
                        />
                        <p className="!text-red-500 !text-sm !mt-1">{errors.password?.message}</p>
                    </div>
                    <Button variant="dreamy" size="auth" type="submit">Login</Button>
                    <div><em>Don't have an account? <Link to="/register">Register</Link></em></div>
                </form>
                {error && <p className="!text-red-500 !text-sm !mt-1">{error}</p>}
            </div>
        </div>
    );
};

export default Login; 