import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { updateUserRole, fetchUserById, updateUser } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { UserDetail, UserEditRequest, UserRole } from '../../../api/types';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../../../components/ui/button';
import * as yup from 'yup';

import '../Articles/AdminArticles.css';
import './AdminUsers.css';

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

        const userUpdate: UserEditRequest = { role: data.role, firstName: data.firstName, lastName: data.lastName, email: data.email, username: data.username };

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
                    <button 
                        onClick={() => navigate('/admin/users')}
                        className="admin-btn admin-btn-primary"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    const isCurrentUser = user.username === currentUser;

    return (
        <div className="admin-user-form-container">
            <div className="admin-form-header">
                <h2>Edit User</h2>
            </div>

            {error && (
                <div className="admin-error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="admin-user-form">
                <div className="admin-form-section">
                    <h3>Edit User Details</h3>
                    
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="firstName" className="admin-form-label">
                                First Name <span className="admin-required">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("firstName")}
                                disabled={loading}
                                className="admin-form-input"
                                placeholder="Enter first name"
                            />
                            <p className="admin-field-error">{errors.firstName?.message}</p>
                        </div>
                        
                        <div className="admin-form-group">
                            <label htmlFor="lastName" className="admin-form-label">
                                Last Name <span className="admin-required">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("lastName")}
                                disabled={loading}
                                className="admin-form-input"
                                placeholder="Enter last name"
                            />
                            <p className="admin-field-error">{errors.lastName?.message}</p>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="email" className="admin-form-label">
                                Email <span className="admin-required">*</span>
                            </label>
                            <input
                                type="email"
                                {...register("email")}
                                disabled={loading}
                                className="admin-form-input"
                                placeholder="Enter email address"
                            />
                            <p className="admin-field-error">{errors.email?.message}</p>
                        </div>
                        
                        <div className="admin-form-group">
                            <label htmlFor="username" className="admin-form-label">
                                Username <span className="admin-required">*</span>
                            </label>
                            <input
                                type="text"
                                {...register("username")}
                                 disabled={loading}
                                className="admin-form-input"
                                placeholder="Enter username"
                            />
                            <p className="admin-field-error">{errors.username?.message}</p>
                        </div>
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label htmlFor="role" className="admin-form-label">
                            Role <span className="admin-required">*</span>
                        </label>
                        <div className="admin-role-selection">
                            {availableRoles.map((role) => (
                                <div key={role.value} className="admin-role-option">
                                    <label className="admin-role-option-label">
                                        <input
                                            type="radio"
                                            value={role.value}
                                            {...register("role")}
                                            disabled={loading || (isCurrentUser && role.value !== 'ROLE_ADMIN')}
                                            className="admin-radio-input"
                                        />
                                        <div className="admin-role-option-content">
                                            <div className="admin-role-option-header">
                                                <span className={`admin-role-badge admin-role-${role.value.replace('ROLE_', '').toLowerCase()}`}>
                                                    {role.label}
                                                </span>
                                                {isCurrentUser && role.value !== 'ROLE_ADMIN' && (
                                                    <span className="admin-disabled-notice">(Cannot remove own admin access)</span>
                                                )}
                                            </div>
                                            <div className="admin-role-option-description">
                                                {role.description}
                                            </div>
                                        </div>
                                    </label>
                                </div>
                            ))}
                        </div>
                        <p className="admin-field-error">{errors.role?.message}</p>
                    </div>
                </div>

                <div className="admin-form-actions">
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
                                <span className="admin-loading-spinner-small"></span>
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
