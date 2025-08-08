import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { UserDetail } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteUser, fetchUserById } from '../../../../api/UsersApi';

import '../../Articles/AdminArticles.css';
import '../AdminUsers.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface UserItemProps {
    user?: UserDetail;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    showActions?: boolean;
    variant?: 'card' | 'detailed';
    useRouteParams?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
    user: propUser,
    onEdit,
    onDelete,
    onView,
    showActions = true,
    variant = 'card',
    useRouteParams = false
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [user, setUser] = useState<UserDetail | null>(propUser || null);
    const [loading, setLoading] = useState<boolean>(useRouteParams && !propUser);
    const [error, setError] = useState<string | null>(null);
    const [showAdminActions, setShowAdminActions] = useState<boolean>(true);

    // Load user from route params if needed
    useEffect(() => {
        if (useRouteParams && id && !propUser) {
            loadUserFromRoute();
        } else if (propUser) {
            setUser(propUser);
            setLoading(false);
        }
    }, [id, propUser, useRouteParams]);

    const loadUserFromRoute = async (): Promise<void> => {
        if (!id) {
            navigate('/admin/users');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userData = await fetchUserById(id);
            setUser(userData);
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

    const formatDateTimeToMin = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + 
               (d.getMonth() + 1).toString().padStart(2, '0') + '-' + 
               d.getDate().toString().padStart(2, '0') + ' ' + 
               d.getHours().toString().padStart(2, '0') + ':' + 
               d.getMinutes().toString().padStart(2, '0');
    };

    const getRoleDisplay = (userData: UserDetail): string => {
        if (userData.role) {
            // Remove ROLE_ prefix for display
            return userData.role.replace('ROLE_', '');
        }
        if (userData.authorities && userData.authorities.length > 0) {
            if (userData.authorities.includes('ADMIN')) return 'ADMIN';
            if (userData.authorities.includes('AUTHOR')) return 'AUTHOR';
            return userData.authorities.join(', ');
        }
        return 'USER';
    };

    const getRoleBadgeColor = (role: string): string => {
        switch (role.toUpperCase()) {
            case 'ADMIN': return 'admin-role-admin';
            case 'AUTHOR': return 'admin-role-author';
            case 'USER': return 'admin-role-user';
            default: return 'admin-role-default';
        }
    };

    const handleDelete = async (): Promise<void> => {
        if (!user) return;
        
        if (user.username === currentUser) {
            alert('You cannot delete your own account.');
            return;
        }

        if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
            return;
        }

        if (!token) return;

        try {
            setIsDeleting(true);
            await deleteUser(user.id, token);
            if (onDelete) {
                onDelete();
            } else if (useRouteParams) {
                navigate('/admin/users');
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
            alert('Failed to delete user. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (): void => {
        if (onEdit) {
            onEdit();
        } else if (user?.id) {
            navigate(`/admin/users/${user.id}/edit`);
        }
    };

    // Loading state for route-based usage
    if (useRouteParams && loading) {
        return (
            <div className="admin-page-loading">
                <div className="admin-loading-container">
                    <div className="admin-loading-spinner"></div>
                    <p>Loading user...</p>
                </div>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>Error Loading User</h2>
                    <p>{error}</p>
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

    // Not found state for route-based usage
    if (useRouteParams && !user) {
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

    if (!user) return null;

    const createdAt = user.createdDate || user.createdAt || '';
    const userRole = getRoleDisplay(user);
    const isCurrentUser = user.username === currentUser;

    if (variant === 'detailed') {
        return (
            <div className="admin-user-detail-page">
                {useRouteParams && (
                    <div className="admin-page-header">
                        <div className="admin-page-header-left">
                            <Button 
                                onClick={() => navigate('/admin/users')}
                                className="admin-btn admin-btn-secondary admin-back-btn"
                            >
                                ← Back to Users
                            </Button>
                        </div>
                        <div className="admin-page-header-right">
                            <Button
                                onClick={() => setShowAdminActions(!showAdminActions)}
                                className={`admin-btn ${showAdminActions ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                            >
                                {showAdminActions ? 'Hide Admin Actions' : 'Show Admin Actions'}
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="admin-user-detailed">
                    <div className="admin-user-header-detailed">
                        <div className="admin-user-title-section">
                            <div className="admin-user-title-with-avatar">
                                <div className="admin-user-avatar">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.username} />
                                    ) : (
                                        <div className="admin-user-avatar-placeholder">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="admin-user-title-content">
                                    <h1 className="admin-user-title-large">
                                        {user.firstName} {user.lastName}
                                        {isCurrentUser && <span className="admin-current-user-badge">You</span>}
                                    </h1>
                                    <div className="admin-user-meta-detailed">
                                        <span className="admin-user-username-badge">@{user.username}</span>
                                        <span className={`admin-role-badge ${getRoleBadgeColor(userRole)}`}>
                                            {userRole}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && hasRole("ADMIN") && (
                            <div className="admin-user-actions-detailed">
                                <Button
                                    onClick={handleEdit}
                                    className="admin-btn admin-btn-primary"
                                    title="Edit User Role"
                                >
                                    Edit Role
                                </Button>
                                {!isCurrentUser && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="admin-btn admin-btn-danger"
                                        title="Delete User"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete User'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="admin-user-content-detailed">
                        <div className="admin-user-info-grid">
                            <div className="admin-info-item">
                                <Label>User ID:</Label>
                                <span className="admin-user-id">{user.id}</span>
                            </div>
                            <div className="admin-info-item">
                                <Label>Username:</Label>
                                <span>{user.username}</span>
                            </div>
                            <div className="admin-info-item">
                                <Label>Email:</Label>
                                <a href={`mailto:${user.email}`} className="admin-email-link">
                                    {user.email}
                                </a>
                            </div>
                            <div className="admin-info-item">
                                <Label>Role:</Label>
                                <span className={`admin-role-badge ${getRoleBadgeColor(userRole)}`}>
                                    {userRole}
                                </span>
                            </div>
                            {user.authorities && user.authorities.length > 0 && (
                                <div className="admin-info-item admin-authorities-item">
                                    <Label>Authorities:</Label>
                                    <div className="admin-authorities-list">
                                        {user.authorities.map((authority, index) => (
                                            <span key={index} className="admin-authority-badge">
                                                {authority}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {createdAt && (
                                <div className="admin-info-item">
                                    <Label>Created:</Label>
                                    <span>{formatDateTimeToMin(createdAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="admin-user-card">
            <div className="admin-user-card-header">
                <div className="admin-user-card-avatar">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} />
                    ) : (
                        <div className="admin-user-avatar-placeholder">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="admin-user-card-info">
                    <h3 className="admin-user-card-title">
                        {user.firstName} {user.lastName}
                        {isCurrentUser && <span className="admin-current-user-badge">You</span>}
                    </h3>
                    <div className="admin-user-card-meta">
                        <span className="admin-user-username">@{user.username}</span>
                        <span className={`admin-role-badge ${getRoleBadgeColor(userRole)}`}>
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>

            <div className="admin-user-card-content">
                <div className="admin-user-card-email">
                    <a href={`mailto:${user.email}`} className="admin-email-link">
                        {user.email}
                    </a>
                </div>
                {createdAt && (
                    <div className="admin-user-card-created">
                        Created: {formatDateTimeToMin(createdAt)}
                    </div>
                )}
            </div>

            {showActions && (
                <div className="admin-user-card-actions">
                    <Button
                        onClick={onView}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="View User"
                    >
                        View
                    </Button>
                    {hasRole("ADMIN") && (
                        <Button
                            onClick={handleEdit}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                            title="Edit User Role"
                        >
                            Edit Role
                        </Button>
                    )}
                    {hasRole("ADMIN") && !isCurrentUser && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            title="Delete User"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default UserItem; 