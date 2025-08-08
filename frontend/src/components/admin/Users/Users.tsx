import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchUsers, deleteUser } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { UserDetail } from '../../../api/types';
import UserItem from './UserItem/UserItem';

import '../Articles/AdminArticles.css';
import './AdminUsers.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

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
    const lastUserRef = React.useRef<HTMLDivElement>(null);

    // Available roles for filtering
    const availableRoles = ['ADMIN', 'AUTHOR', 'USER'];

    // Create role options for combobox
    const roleOptions: ComboboxOption[] = [
        { value: "", label: "All Roles" },
        ...availableRoles.map(role => ({
            value: role,
            label: role,
        }))
    ];

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
                        <Label htmlFor="role-filter">Filter by Role:</Label>
                        <Combobox
                            options={roleOptions}
                            value={selectedRole}
                            onValueChange={(value) => {
                                setSelectedRole(value);
                                setCurrentPage(0);
                            }}
                            placeholder="Select role..."
                            searchPlaceholder="Search roles..."
                            className="admin-filter-select min-w-[150px]"
                            clearable
                        />
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

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b bg-muted/50">
                            <TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
                            <TableHead className="font-semibold text-foreground">Username</TableHead>
                            <TableHead className="font-semibold text-foreground">Full Name</TableHead>
                            <TableHead className="font-semibold text-foreground">Email</TableHead>
                            <TableHead className="w-[120px] font-semibold text-foreground">Role</TableHead>
                            <TableHead className="w-[140px] font-semibold text-foreground">Created Date</TableHead>
                            <TableHead className="w-[120px] font-semibold text-foreground text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {selectedRole 
                                        ? `No users found with role: ${selectedRole}` 
                                        : 'No users found'
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user, idx) => {
                                const createdAt = user.createdDate || user.createdAt || '';
                                const userRole = getRoleDisplay(user);
                                const isCurrentUser = user.username === currentUser;
                                
                                return (
                                    <TableRow 
                                        key={user.id}
                                        ref={idx === filteredUsers.length - 1 ? lastUserRef : null}
                                        className={`group hover:bg-muted/50 transition-colors ${isCurrentUser ? 'bg-primary/5 border-primary/20' : ''}`}
                                    >
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {user.id.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                {user.username}
                                                {isCurrentUser && (
                                                    <Badge variant="secondary" className="text-xs px-2 py-0">
                                                        You
                                                    </Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {`${user.firstName} ${user.lastName}`}
                                        </TableCell>
                                        <TableCell>
                                            <a 
                                                href={`mailto:${user.email}`} 
                                                className="text-primary hover:underline"
                                            >
                                                {user.email}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            <Badge 
                                                variant={
                                                    userRole === 'ADMIN' ? 'destructive' : 
                                                    userRole === 'AUTHOR' ? 'default' : 'secondary'
                                                }
                                                className="font-medium"
                                            >
                                                {userRole}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {createdAt ? formatDateTimeToMin(createdAt) : '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    onClick={() => handleView(user)}
                                                    variant="outline"
                                                    size="sm"
                                                    title="View User"
                                                >
                                                    View
                                                </Button>
                                                {hasRole("ADMIN") && (
                                                    <Button
                                                        onClick={() => handleEdit(user)}
                                                        variant="default"
                                                        size="sm"
                                                        title="Edit User"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {hasRole("ADMIN") && !isCurrentUser && (
                                                    <Button
                                                        onClick={() => handleDelete(user)}
                                                        variant="destructive"
                                                        size="sm"
                                                        title="Delete User"
                                                    >
                                                        Delete
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>

        <div className={`admin-pagination-wrapper${showBottomBar ? ' visible' : ''}`}>
            <div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    goToPrev();
                                }}
                                style={{ 
                                    pointerEvents: currentPage === 0 ? 'none' : 'auto',
                                    opacity: currentPage === 0 ? 0.5 : 1 
                                }}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="admin-page-info">
                                Page <input
                                    type="number"
                                    min="1"
                                    value={currentPage + 1}
                                    onChange={handlePageInput}
                                    className="admin-page-input"
                                />
                            </span>
                        </PaginationItem>
                        <PaginationItem>
                            <PaginationNext 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    goToNext();
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
        </>
    );
};

export default Users; 