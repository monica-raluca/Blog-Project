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
        <div className="flex justify-center items-center min-h-screen">
            <div className="w-[400px] backdrop-blur-[20px] shadow-[0_0_30px_rgba(0,0,0,0.5)] text-[#162938] !p-10 rounded-[20px] bg-[rgba(255,255,255,0.1)]">
                <h2 className="text-center text-[2em] mb-5">Register</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="relative !mx-0 !my-[30px]">                   
                        <Label className="!text-sm !text-[#495057] !font-semibold">First name</Label>
                        <Input type="text"
                            {...register("firstName")}
                        />
                        <p className="!text-red-500 !text-sm !mt-1">{errors.firstName?.message}</p>
                    </div>
                    <div className="relative !mx-0 !my-[30px]">
                        <Label className="!text-sm !text-[#495057] !font-semibold">Last name</Label>
                        <Input type="text"
                            {...register("lastName")}
                        />
                        <p className="!text-red-500 !text-sm !mt-1">{errors.lastName?.message}</p>
                    </div>
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
                    <div className="relative !mx-0 !my-[30px]">                     
                        <Label className="!text-sm !text-[#495057] !font-semibold">Email</Label>
                        <Input
                            type="email"
                            {...register("email")}
                        />
                        <p className="!text-red-500 !text-sm !mt-1">{errors.email?.message}</p>
                    </div>
                    <Button variant="sunset" size="auth" type="submit">Register</Button>
                    <div><em>Already have an account? <Link to="/login">Login</Link></em></div>
                </form>
                {error && <p className="!text-red-500 !text-sm !mt-1">{error}</p>}
            </div>
        </div>
    );
};

export default Register; 