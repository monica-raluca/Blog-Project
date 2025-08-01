import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchUsers, deleteUser } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { UserDetail } from '../../../api/types';
import UserItem from './UserItem/UserItem';

import '../Articles/AdminArticles.css';
import './AdminUsers.css';

interface UsersProps {
    onEdit?: (user: UserDetail) => void;
    onView?: (user: UserDetail) => void;
    filterByRole?: string;
}

const Users: React.FC<UsersProps> = ({
    onEdit,
    onView,
    filterByRole
}) => {
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedRole, setSelectedRole] = useState<string>(filterByRole || '');
    const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 15;
    
    const { token, currentUser } = useAuth();
    const navigate = useNavigate();
    const lastUserRef = React.useRef<HTMLTableRowElement>(null);

    // Available roles for filtering
    const availableRoles = ['ADMIN', 'AUTHOR', 'USER'];

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, selectedRole, currentPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setShowBottomBar(true);
                else setShowBottomBar(false);
            },
            { threshold: 0.1 }
        );
        if (lastUserRef.current) observer.observe(lastUserRef.current);
        return () => observer.disconnect();
    }, [filteredUsers]);

    const loadUsers = async (): Promise<void> => {
        if (!token) return;
        
        try {
            setLoading(true);
            const usersData = await fetchUsers(token);
            setUsers(usersData);
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
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

    const filterUsers = (): void => {
        let filtered = users;
        
        if (selectedRole) {
            filtered = users.filter(user => {
                // Check authorities (without ROLE_ prefix)
                const hasAuthority = user.authorities?.includes(selectedRole);
                // Check role (with or without ROLE_ prefix)
                const hasRole = user.role === selectedRole || user.role === `ROLE_${selectedRole}`;
                return hasAuthority || hasRole;
            });
        }
        
        // Implement pagination
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        setFilteredUsers(filtered.slice(startIndex, endIndex));
    };

    const handleDelete = async (user: UserDetail): Promise<void> => {
        if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`) || !token) return;

        // Prevent self-deletion
        if (user.username === currentUser) {
            alert('You cannot delete your own account.');
            return;
        }

        try {
            await deleteUser(user.id, token);
            await loadUsers(); // Reload the users list
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        }
    };

    const handleEdit = (user: UserDetail): void => {
        if (onEdit) {
            onEdit(user);
        } else {
            navigate(`/admin/users/${user.id}/edit`);
        }
    };

    const handleView = (user: UserDetail): void => {
        if (onView) {
            onView(user);
        } else {
            navigate(`/admin/users/${user.id}`);
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

    const getRoleDisplay = (user: UserDetail): string => {
        if (user.role) {
            // Remove ROLE_ prefix for display
            return user.role.replace('ROLE_', '');
        }
        if (user.authorities && user.authorities.length > 0) {
            // Get the highest authority for display
            if (user.authorities.includes('ADMIN')) return 'ADMIN';
            if (user.authorities.includes('AUTHOR')) return 'AUTHOR';
            return user.authorities.join(', ');
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

    const goToPrev = (): void => setCurrentPage(Math.max(0, currentPage - 1));
    const goToNext = (): void => setCurrentPage(currentPage + 1);

    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) setCurrentPage(val - 1);
    };

    if (loading) {
        return <div className="admin-loading">Loading users...</div>;
    }

    return (
        <>
        <div className="admin-users-container">
            <div className="admin-header">
                <h2>Users Management</h2>
                <div className="admin-actions">
                    <div className="admin-filter-section">
                        <label htmlFor="role-filter">Filter by Role:</label>
                        <select
                            id="role-filter"
                            value={selectedRole}
                            onChange={(e) => {
                                setSelectedRole(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="admin-filter-select"
                        >
                            <option value="">All Roles</option>
                            {availableRoles.map((role) => (
                                <option key={role} value={role}>
                                    {role}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="admin-stats">
                        <span className="admin-stat-item">
                            Total Users: <strong>{users.length}</strong>
                        </span>
                        {selectedRole && (
                            <span className="admin-stat-item">
                                {selectedRole}: <strong>{users.filter(u => {
                                    const hasAuthority = u.authorities?.includes(selectedRole);
                                    const hasRole = u.role === selectedRole || u.role === `ROLE_${selectedRole}`;
                                    return hasAuthority || hasRole;
                                }).length}</strong>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Created Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="admin-no-data">
                                    {selectedRole 
                                        ? `No users found with role: ${selectedRole}` 
                                        : 'No users found'
                                    }
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((user, idx) => {
                                const createdAt = user.createdDate || user.createdAt || '';
                                const userRole = getRoleDisplay(user);
                                const isCurrentUser = user.username === currentUser;
                                
                                return (
                                    <tr 
                                        key={user.id}
                                        ref={idx === filteredUsers.length - 1 ? lastUserRef : null}
                                        className={isCurrentUser ? 'admin-current-user-row' : ''}
                                    >
                                        <td className="admin-id-cell">
                                            {user.id.substring(0, 8)}...
                                        </td>
                                        <td className="admin-username-cell">
                                            <div className="admin-username-display">
                                                {user.username}
                                                {isCurrentUser && (
                                                    <span className="admin-current-user-badge">You</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="admin-fullname-cell">
                                            {`${user.firstName} ${user.lastName}`}
                                        </td>
                                        <td className="admin-email-cell">
                                            <a href={`mailto:${user.email}`} className="admin-email-link">
                                                {user.email}
                                            </a>
                                        </td>
                                        <td className="admin-role-cell">
                                            <span className={`admin-role-badge ${getRoleBadgeColor(userRole)}`}>
                                                {userRole}
                                            </span>
                                        </td>
                                        <td className="admin-date-cell">
                                            {createdAt ? formatDateTimeToMin(createdAt) : '-'}
                                        </td>
                                        <td className="admin-actions-cell">
                                            <div className="admin-action-buttons">
                                                <button
                                                    onClick={() => handleView(user)}
                                                    className="admin-btn admin-btn-sm admin-btn-secondary"
                                                    title="View User"
                                                >
                                                    View
                                                </button>
                                                {hasRole("ADMIN") && (
                                                    <button
                                                        onClick={() => handleEdit(user)}
                                                        className="admin-btn admin-btn-sm admin-btn-primary"
                                                        title="Edit User Role"
                                                    >
                                                        Edit Role
                                                    </button>
                                                )}
                                                {hasRole("ADMIN") && !isCurrentUser && (
                                                    <button
                                                        onClick={() => handleDelete(user)}
                                                        className="admin-btn admin-btn-sm admin-btn-danger"
                                                        title="Delete User"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        <div className={`admin-pagination-wrapper${showBottomBar ? ' visible' : ''}`}>
            <div className="admin-pagination">
                <button 
                    className="admin-btn admin-btn-secondary" 
                    onClick={goToPrev} 
                    disabled={currentPage === 0}
                >
                    Previous
                </button>
                <span className="admin-page-info">
                    Page <input
                        type="number"
                        min="1"
                        value={currentPage + 1}
                        onChange={handlePageInput}
                        className="admin-page-input"
                    />
                </span>
                <button 
                    className="admin-btn admin-btn-secondary" 
                    onClick={goToNext}
                >
                    Next
                </button>
            </div>
        </div>
        </>
    );
};

export default Users; 