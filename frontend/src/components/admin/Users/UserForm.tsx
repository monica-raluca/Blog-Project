import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { updateUserRole, fetchUserById, updateUser } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { UserDetail, UserEditRequest, UserRole } from '../../../api/types';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../../../components/ui/button';
import * as yup from 'yup';

import { Label } from '@/components/ui/label';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import ProfileUpload from '../../ui/ProfileUpload';

interface UserFormProps {
    userId?: string;
    initialUser?: UserDetail;
    onSubmit?: (user: UserDetail) => void;
    onCancel?: () => void;
}

interface UserFormData {
    role: string;
}

const userFormSchema = yup.object({
    firstName: yup.string().required('First name is required'),
    lastName: yup.string().required('Last name is required'),
    email: yup.string().email('Invalid email address').required('Email is required'),
    username: yup.string().required('Username is required'),
    role: yup.string().required('Role is required')
}).required();

type FormData = yup.InferType<typeof userFormSchema>;

const UserForm: React.FC<UserFormProps> = ({
    userId,
    initialUser,
    onSubmit,
    onCancel
}) => {
    const { id: routeId } = useParams<{ id: string }>();
    const finalId = userId || routeId;
    
    const [user, setUser] = useState<UserDetail | null>(initialUser || null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const { token, currentUser } = useAuth();

    const { 
        register, 
        handleSubmit, 
        watch, 
        setValue,
        control,
        formState: { errors } 
    } = useForm<FormData>({
        resolver: yupResolver(userFormSchema),
        defaultValues: {
            firstName: initialUser?.firstName || '',
            lastName: initialUser?.lastName || '',
            email: initialUser?.email || '',
            username: initialUser?.username || '',
            role: initialUser?.role || ''
        }
    });

    const watchedFormData = useWatch({ control });
    const selectedRole = watchedFormData.role;
    const formData = watch();

    const availableRoles = [
        { value: 'ROLE_USER', label: 'User', description: 'Can view and comment on articles' },
        { value: 'ROLE_AUTHOR', label: 'Author', description: 'Can create and edit their own articles' },
        { value: 'ROLE_ADMIN', label: 'Admin', description: 'Full access to all system features' }
    ];



    useEffect(() => {
        if (finalId && !initialUser) {
            loadUser();
        } else if (initialUser) {
            setUser(initialUser);
            setValue('firstName', initialUser.firstName);
            setValue('lastName', initialUser.lastName);
            setValue('email', initialUser.email);
            setValue('username', initialUser.username);
            setValue('role', getCurrentRole(initialUser));
        }
    }, [finalId, initialUser, setValue]);

    useEffect(() => {
        if (user && watchedFormData) {
            const currentRole = getCurrentRole(user);
            const hasChanges = 
                watchedFormData.role !== currentRole ||
                watchedFormData.firstName !== user.firstName ||
                watchedFormData.lastName !== user.lastName ||
                watchedFormData.email !== user.email ||
                watchedFormData.username !== user.username;
            setIsDirty(hasChanges);
        }
    }, [watchedFormData, user]);

    const getCurrentRole = (userData: UserDetail): string => {
        if (userData.role) return userData.role;
        if (userData.authorities && userData.authorities.length > 0) {
            // Return the highest authority with ROLE_ prefix
            if (userData.authorities.includes('ADMIN')) return 'ROLE_ADMIN';
            if (userData.authorities.includes('AUTHOR')) return 'ROLE_AUTHOR';
            return 'ROLE_USER';
        }
        return 'ROLE_USER';
    };

    const loadUser = async (): Promise<void> => {
        if (!finalId) return;
        
        try {
            setLoading(true);
            setError(null);
            const userData = await fetchUserById(finalId);
            setUser(userData);
            setValue('firstName', userData.firstName);
            setValue('lastName', userData.lastName);
            setValue('email', userData.email);
            setValue('username', userData.username);
            setValue('role', getCurrentRole(userData));
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            setError(errorMessage);
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (data: FormData): Promise<void> => {
        if (!token || !user) {
            setError('Authentication required or user not loaded.');
            return;
        }

        // Prevent changing own role to non-admin
        if (user.username === currentUser && data.role !== 'ROLE_ADMIN') {
            setError('You cannot remove your own admin privileges.');
            return;
        }

        setLoading(true);
        setError(null);

        const userUpdate: UserEditRequest = { 
            role: data.role, 
            firstName: data.firstName, 
            lastName: data.lastName, 
            email: data.email, 
            username: data.username,
            profilePicture: user.profilePicture // Preserve existing profile picture
        };

        try {
            console.log('Updating user role:', {
                userId: user.id,
                currentRole: getCurrentRole(user),
                newRole: data.role,
                userUpdate,
                token: token ? token : 'Missing'
            });
            console.log(token);
            const updatedUser = await updateUser(user.id, userUpdate, token);
            console.log(updatedUser);
            setIsDirty(false);
            
            if (onSubmit) {
                onSubmit(updatedUser);
            } else {
                navigate('/admin/users');
            }
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            setError(errorMessage);
            
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (): void => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
        
        if (onCancel) {
            onCancel();
        } else {
            navigate('/admin/users');
        }
    };

    if (loading && !user) {
        return (
            <div className="admin-form-loading">
                <div className="admin-loading-spinner"></div>
                <p>Loading user...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>User Not Found</h2>
                    <p>The requested user could not be found.</p>
                    <Button 
                        onClick={() => navigate('/admin/users')}
                        className="admin-btn admin-btn-primary"
                    >
                        Back to Users
                    </Button>
                </div>
            </div>
        );
    }

    const isCurrentUser = user.username === currentUser;

    // Create role options for combobox
    const roleOptions: ComboboxOption[] = availableRoles.map(role => ({
        value: role.value,
        label: `${role.label} - ${role.description}`,
        disabled: loading || (isCurrentUser && role.value !== 'ROLE_ADMIN')
    }));

    return (
        <div className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-[24px]">
            <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Edit User Details</h2>
            </div>

            {error && (
                <div className="!bg-red-500 !text-white !p-4 !rounded-lg !mb-4">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="!p-[24px] !pb-[40px]">
                <div className="!mb-[32px] !pb-[24px] !border-b !border-[#dee2e6]">
                    
                    <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="relative">
                            <Label htmlFor="firstName" className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                First Name <span className="admin-required">*</span>
                            </Label>
                            <input
                                type="text"
                                {...register("firstName")}
                                disabled={loading}
                                className="w-full !p-2 border border-[#ced4da] rounded-md"
                                placeholder="Enter first name"
                            />
                            <p className="!text-red-500 !text-sm !mt-1">{errors.firstName?.message}</p>
                        </div>
                        
                        <div className="relative">
                            <Label htmlFor="lastName" className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                Last Name <span className="admin-required">*</span>
                            </Label>
                            <input
                                type="text"
                                {...register("lastName")}
                                disabled={loading}
                                className="w-full !p-2 border border-[#ced4da] rounded-md"
                                placeholder="Enter last name"
                            />
                            <p className="!text-red-500 !text-sm !mt-1">{errors.lastName?.message}</p>
                        </div>
                    
                        <div className="relative">
                            <Label htmlFor="email" className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                Email <span className="admin-required">*</span>
                            </Label>
                            <input
                                type="email"
                                {...register("email")}
                                disabled={loading}
                                className="w-full !p-2 border border-[#ced4da] rounded-md"
                                placeholder="Enter email address"
                            />
                            <p className="!text-red-500 !text-sm !mt-1">{errors.email?.message}</p>
                        </div>
                        
                        <div className="relative">
                            <Label htmlFor="username" className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                Username <span className="admin-required">*</span>
                            </Label>
                            <input
                                type="text"
                                {...register("username")}
                                 disabled={loading}
                                className="w-full !p-2 border border-[#ced4da] rounded-md"
                                placeholder="Enter username"
                            />
                            <p className="!text-red-500 !text-sm !mt-1">{errors.username?.message}</p>
                        </div>

                        <div className="relative">
                            <Label htmlFor="role" className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                Role <span className="admin-required">*</span>
                            </Label>
                            <Combobox
                                options={roleOptions}
                                value={selectedRole}
                                onValueChange={(value) => setValue("role", value)}
                                placeholder="Select a role..."
                                searchPlaceholder="Search roles..."
                                className="w-full !p-2 border border-[#ced4da] rounded-md"
                                disabled={loading}
                            />
                            {isCurrentUser && selectedRole !== 'ROLE_ADMIN' && (
                                <p className="!text-sm !text-gray-500 !mt-1">
                                    Note: You cannot remove your own admin access
                                </p>
                            )}
                            <p className="!text-red-500 !text-sm !mt-1">{errors.role?.message}</p>
                        </div>

                        <div className="relative">
                            <Label className="flex justify-between items-center !mb-[8px] !text-sm text-[#495057] font-semibold">
                                Profile Picture
                            </Label>
                            <div className="flex justify-center">
                                {user && token && (
                                    <ProfileUpload
                                        userId={user.id}
                                        currentImageUrl={user.profilePicture}
                                        // currentImageUrl="/profile-pictures/user-83192b2b-3046-408e-bb82-2836ef1a6db8.png"
                                        // currentImageUrl={`http://localhost:8080/profile-pictures/${user.profilePicture}`}
                                        token={token}
                                        onUploadSuccess={(updatedUser) => {
                                            setUser(updatedUser);
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        variant="cloud"
                        size="cloud"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !watchedFormData?.firstName || !watchedFormData?.lastName || !watchedFormData?.email || !watchedFormData?.username || !selectedRole || !isDirty}
                        variant="success"
                        size="cloud"
                    >
                        {loading ? (
                            <>
                                <span className="!w-4 !h-4 !border-2 !border-gray-500 !border-t-transparent !rounded-full !animate-spin"></span>
                                Updating User...
                            </>
                        ) : (
                            'Update User'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
