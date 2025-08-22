import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchCurrentUser, updateUser } from '../../api/UsersApi';
import { useAuth } from '../../api/AuthContext';
import { UserDetail, UserEditRequest } from '../../api/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Separator } from '../../../components/ui/separator';
import { Loader2, Save, ArrowLeft, User, Mail, UserCheck } from 'lucide-react';
import * as yup from 'yup';
import ProfileUpload from '../ui/ProfileUpload';

const profileFormSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    username: yup.string().required('Username is required')
}).required();

type ProfileFormData = yup.InferType<typeof profileFormSchema>;

const UserProfile: React.FC = () => {
    const { currentUser, token, updateProfilePicture } = useAuth();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        reset,
        setValue
    } = useForm<ProfileFormData>({
        resolver: yupResolver(profileFormSchema)
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        
        if (!currentUser) {
            setError('Unable to identify current user');
            setLoading(false);
            return;
        }

        fetchUserData();
    }, [currentUser, token, navigate]);

    const fetchUserData = async () => {
        if (!currentUser) return;
        
        try {
            setLoading(true);
            setError(null);

            console.log("currentUser");
            console.log(currentUser);
            const userData = await fetchCurrentUser(currentUser);
            
            setUser(userData);
            
            reset({
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                username: userData.username
            });
            
            // Update profile picture in auth context
            updateProfilePicture(userData.profilePicture || null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load user data');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        if (!user || !token) return;

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            const updateData: UserEditRequest = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                username: data.username,
                role: user.role || 'USER' // Preserve current role
            };

            const updatedUser = await updateUser(user.id, updateData, token);
            setUser(updatedUser);
            setSuccessMessage('Profile updated successfully!');
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const userInitials = user 
        ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase()
        : 'U';

    if (loading) {
        return (
            <div className="!min-h-screen !flex !items-center !justify-center !p-4">
                <div className="flex items-center gap-3 text-[#162938]">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="text-lg font-medium">Loading your profile...</span>
                </div>
            </div>
        );
    }

    if (error && !user) {
        navigate('/error');
    }

    return (
        <div className="!min-h-screen !flex !flex-col !p-4">
            <div className="max-w-4xl mx-auto py-8 flex-1">
                {/* Header */}
                <div className="mb-8">
                    <Button 
                        onClick={() => navigate('/public/articles')} 
                        variant="ghost" 
                        className="mb-4 text-[#162938] hover:text-[#270023] hover:bg-white/60"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Articles
                    </Button>
                    
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-[#162938] mb-2">My Profile</h1>
                        <p className="text-[#6a6a6a] text-lg">Manage your personal information and preferences</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Picture Section */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/90 backdrop-blur-xl border-white/60 shadow-xl shadow-purple-100/50">
                            <CardHeader className="text-center">
                                <CardTitle className="text-[#162938] flex items-center justify-center gap-2">
                                    <User className="h-5 w-5" />
                                    Profile Picture
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center space-y-6">
                                <div className="relative">
                                    <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                        <AvatarImage 
                                            src={user?.profilePicture ? `http://localhost:8080/profile-pictures/${user.profilePicture}` : `https://avatar.vercel.sh/${user?.username}`} 
                                            alt={`${user?.firstName} ${user?.lastName}`}
                                        />
                                        <AvatarFallback className="bg-gradient-to-r from-[#fbeffb] to-[#e3f0ff] text-[#162938] text-2xl font-bold">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                                
                                <div className="text-center">
                                    <h3 className="text-xl font-semibold text-[#162938]">
                                        {user?.firstName} {user?.lastName}
                                    </h3>
                                    <p className="text-[#6a6a6a]">@{user?.username}</p>
                                    <div className="mt-2 flex items-center justify-center">
                                        <span className="bg-[#e3f0ff] text-[#162938] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                            <UserCheck className="h-3 w-3" />
                                            {user?.role || 'User'}
                                        </span>
                                    </div>
                                </div>

                                {user && token && (
                                    <div className="w-full">
                                        <ProfileUpload
                                            userId={user.id}
                                            currentImageUrl={user.profilePicture}
                                            token={token}
                                            onUploadSuccess={(updatedUser) => {
                                                setUser(updatedUser);
                                                updateProfilePicture(updatedUser.profilePicture || null);
                                            }}
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Profile Information Section */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white/90 backdrop-blur-xl border-white/60 shadow-xl shadow-purple-100/50">
                            <CardHeader>
                                <CardTitle className="text-[#162938] flex items-center gap-2">
                                    <Mail className="h-5 w-5" />
                                    Personal Information
                                </CardTitle>
                                <CardDescription>
                                    Update your personal details below. Password changes are not available through this interface.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-800 text-sm font-medium">{error}</p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName" className="text-sm font-semibold text-[#162938]">
                                                First Name
                                            </Label>
                                            <Input
                                                id="firstName"
                                                {...register('firstName')}
                                                className="border-[#ececec] focus:border-[#162938] focus:ring-[#162938]"
                                                disabled={saving}
                                            />
                                            {errors.firstName && (
                                                <p className="text-red-600 text-sm">{errors.firstName.message}</p>
                                            )}
                                        </div>

                                        {/* Last Name */}
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName" className="text-sm font-semibold text-[#162938]">
                                                Last Name
                                            </Label>
                                            <Input
                                                id="lastName"
                                                {...register('lastName')}
                                                className="border-[#ececec] focus:border-[#162938] focus:ring-[#162938]"
                                                disabled={saving}
                                            />
                                            {errors.lastName && (
                                                <p className="text-red-600 text-sm">{errors.lastName.message}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="text-sm font-semibold text-[#162938]">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            {...register('username')}
                                            className="border-[#ececec] focus:border-[#162938] focus:ring-[#162938]"
                                            disabled={saving}
                                        />
                                        {errors.username && (
                                            <p className="text-red-600 text-sm">{errors.username.message}</p>
                                        )}
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-[#162938]">
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...register('email')}
                                            className="border-[#ececec] focus:border-[#162938] focus:ring-[#162938]"
                                            disabled={saving}
                                        />
                                        {errors.email && (
                                            <p className="text-red-600 text-sm">{errors.email.message}</p>
                                        )}
                                    </div>

                                    <Separator className="my-6" />

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 justify-end">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => navigate('/public/articles')}
                                            disabled={saving}
                                            className="border-[#ececec] text-[#162938] hover:bg-[#ececec]"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={saving || !isDirty}
                                            className="bg-[#162938] text-white hover:bg-[#270023] disabled:opacity-50"
                                        >
                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4 mr-2" />
                                                    Save Changes
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;