import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { updateUserRole, fetchUserById, updateUser } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { UserDetail, UserRole } from '../../../api/types';
import { useForm } from 'react-hook-form';

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
        formState: { errors } 
    } = useForm<UserFormData>();

    const selectedRole = watch('role');

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
            setValue('role', getCurrentRole(initialUser));
        }
    }, [finalId, initialUser, setValue]);

    useEffect(() => {
        if (user) {
            const currentRole = getCurrentRole(user);
            const hasChanges = selectedRole !== currentRole;
            setIsDirty(hasChanges);
        }
    }, [selectedRole, user]);

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

    const handleFormSubmit = async (data: UserFormData): Promise<void> => {
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

        const roleUpdate: UserRole = { role: data.role };

        try {
            console.log('Updating user role:', {
                userId: user.id,
                currentRole: getCurrentRole(user),
                newRole: data.role,
                roleUpdate,
                token: token ? token : 'Missing'
            });
            console.log(token);
            const updatedUser = await updateUserRole(user.id, roleUpdate, token);
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
                <h2>Edit User Role</h2>
            </div>

            {error && (
                <div className="admin-error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="admin-user-info-section">
                <h3>User Information</h3>
                <div className="admin-user-info-grid">
                    <div className="admin-info-item">
                        <label>Username:</label>
                        <span className="admin-user-username">
                            {user.username}
                            {isCurrentUser && <span className="admin-current-user-badge">You</span>}
                        </span>
                    </div>
                    <div className="admin-info-item">
                        <label>Full Name:</label>
                        <span>{`${user.firstName} ${user.lastName}`}</span>
                    </div>
                    <div className="admin-info-item">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="admin-info-item">
                        <label>User ID:</label>
                        <span className="admin-user-id">{user.id}</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit(handleFormSubmit)} className="admin-user-form">
                <div className="admin-form-row">
                    <div className="admin-form-group">
                                                 <label className="admin-form-label">
                             Current Role: <span className={`admin-role-badge admin-role-${getCurrentRole(user).replace('ROLE_', '').toLowerCase()}`}>
                                 {getCurrentRole(user).replace('ROLE_', '')}
                             </span>
                         </label>
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label htmlFor="role" className="admin-form-label">
                            New Role <span className="admin-required">*</span>
                        </label>
                        <div className="admin-role-selection">
                            {availableRoles.map((role) => (
                                <div key={role.value} className="admin-role-option">
                                    <label className="admin-role-option-label">
                                        <input
                                            type="radio"
                                            value={role.value}
                                            {...register("role", { required: "Please select a role" })}
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
                        {errors.role && (
                            <p className="admin-field-error">{errors.role.message}</p>
                        )}
                    </div>
                </div>

                {isCurrentUser && (
                    <div className="admin-warning-box">
                        <strong>⚠️ Warning:</strong> You are editing your own user account. 
                        Removing admin privileges will restrict your access to admin features.
                    </div>
                )}

                <div className="admin-form-actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="admin-btn admin-btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedRole || !isDirty}
                        className="admin-btn admin-btn-primary"
                    >
                        {loading ? (
                            <>
                                <span className="admin-loading-spinner-small"></span>
                                Updating Role...
                            </>
                        ) : (
                            'Update User Role'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default UserForm;
