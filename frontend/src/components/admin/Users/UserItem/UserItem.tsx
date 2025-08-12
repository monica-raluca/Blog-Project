import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { UserDetail } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteUser, fetchUserById } from '../../../../api/UsersApi';

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
            <div className="flex justify-center items-center min-h-[400px] !p-[40px]">
                <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-white rounded-full animate-spin mb-4"></div>
                <p>Loading user...</p>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="flex justify-center items-center min-h-[400px] !p-[40px]">
                <div className="!bg-[#f8f9fa] !border !border-[#dee2e6] !rounded-lg !p-[16px] !mb-[24px] !text-red-600">
                    <h2>Error Loading User</h2>
                    <p>{error}</p>
                    <Button 
                        onClick={() => navigate('/admin/users')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white !px-3 !py-2 transition-colors hover:bg-[#0056b3]"
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
            <div className="flex justify-center items-center min-h-[400px] !p-[40px]">
                <div className="!bg-[#f8f9fa] !border !border-[#dee2e6] !rounded-lg !p-[16px] !mb-[24px] !text-red-600">
                    <h2>User Not Found</h2>
                    <p>The requested user could not be found.</p>
                    <Button 
                        onClick={() => navigate('/admin/users')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white !px-3 !py-2 transition-colors hover:bg-[#0056b3]"
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
            <div className="!p-[20px] !max-w-[1200px] !mx-auto">
                {useRouteParams && (
                    <div className="!mb-[20px] flex justify-between items-center gap-[16px]">
                        <div className="!flex !gap-3">
                            <Button 
                                onClick={() => navigate('/admin/users')}
                                className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white !px-3 !py-2 transition-colors hover:bg-[#5a6268]"
                            >
                                ← Back to Users
                            </Button>
                        </div>
                        <div className="!flex !gap-3">
                            <Button
                                onClick={() => setShowAdminActions(!showAdminActions)}
                                className={`rounded cursor-pointer text-xs no-underline inline-block ${showAdminActions ? 'bg-[#007bff] text-white' : 'bg-[#6c757d] text-white'} !px-3 !py-2 transition-colors hover:bg-[#0056b3]`}
                            >
                                {showAdminActions ? 'Hide Admin Actions' : 'Show Admin Actions'}
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="bg-white border rounded-lg overflow-hidden">
                    <div className="bg-[#f8f9fa] !p-[24px] border-b-[1px] border-[#dee2e6] flex justify-between items-center align-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden">
                                    {user.profilePicture ? (
                                        <img src={user.profilePicture} alt={user.username} />
                                    ) : (
                                        <div className="w-full h-full bg-[#007bff] text-white flex items-center justify-center">
                                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold">
                                        {user.firstName} {user.lastName}
                                        {isCurrentUser && <span className="ml-2 text-sm bg-[#007bff] text-white px-2 py-1 rounded-full">You</span>}
                                    </h1>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-[#6c757d] text-white !px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold">@{user.username}</span>
                                        <span className={`!px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold ${getRoleBadgeColor(userRole)}`}>
                                            {userRole}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && hasRole("ADMIN") && (
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={handleEdit}
                                    className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white !px-3 !py-2 transition-colors hover:bg-[#0056b3]"
                                    title="Edit User Role"
                                >
                                    Edit Role
                                </Button>
                                {!isCurrentUser && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white !px-3 !py-2 transition-colors hover:bg-[#c82333]"
                                        title="Delete User"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete User'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="!p-[24px]">
                        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            <div className="flex items-center gap-2">
                                <Label className="w-24">User ID:</Label>
                                <span className="text-sm">{user.id}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="w-24">Username:</Label>
                                <span className="text-sm">{user.username}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="w-24">Email:</Label>
                                <a href={`mailto:${user.email}`} className="text-sm text-[#007bff] hover:underline">
                                    {user.email}
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label className="w-24">Role:</Label>
                                <span className={`!px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold ${getRoleBadgeColor(userRole)}`}>
                                    {userRole}
                                </span>
                            </div>
                            {user.authorities && user.authorities.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <Label className="w-24">Authorities:</Label>
                                    <div className="flex items-center gap-1">
                                        {user.authorities.map((authority, index) => (
                                            <span key={index} className="bg-[#6c757d] text-white !px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold">
                                                {authority}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {createdAt && (
                                <div className="flex items-center gap-2">
                                    <Label className="w-24">Created:</Label>
                                    <span className="text-sm">{formatDateTimeToMin(createdAt)}</span>
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
        <div className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-[24px]">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f8f9fa] flex items-center justify-center overflow-hidden">
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.username} />
                    ) : (
                        <div className="w-full h-full bg-[#007bff] text-white flex items-center justify-center">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                    )}
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold">
                        {user.firstName} {user.lastName}
                        {isCurrentUser && <span className="ml-2 text-sm bg-[#007bff] text-white px-2 py-1 rounded-full">You</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="bg-[#6c757d] text-white !px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold">@{user.username}</span>
                        <span className={`!px-[8px] !py-[4px] rounded-full font-mono text-xs font-semibold ${getRoleBadgeColor(userRole)}`}>
                            {userRole}
                        </span>
                    </div>
                </div>
            </div>

            <div className="!p-[24px]">
                <div className="flex items-center gap-2">
                    <Label className="w-24">Email:</Label>
                    <a href={`mailto:${user.email}`} className="text-sm text-[#007bff] hover:underline">
                        {user.email}
                    </a>
                </div>
                {createdAt && (
                    <div className="flex items-center gap-2">
                        <Label className="w-24">Created:</Label>
                        Created: {formatDateTimeToMin(createdAt)}
                    </div>
                )}
            </div>

            {showActions && (
                <div className="flex items-center gap-2 mt-4">
                    <Button
                        onClick={onView}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white !px-3 !py-2 transition-colors hover:bg-[#5a6268]"
                        title="View User"
                    >
                        View
                    </Button>
                    {hasRole("ADMIN") && (
                        <Button
                            onClick={handleEdit}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white !px-3 !py-2 transition-colors hover:bg-[#0056b3]"
                            title="Edit User Role"
                        >
                            Edit Role
                        </Button>
                    )}
                    {hasRole("ADMIN") && !isCurrentUser && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white !px-3 !py-2 transition-colors hover:bg-[#c82333]"
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