import React, { useState } from 'react';
import { Users, UserForm, UserItem } from './Users';
import { UserDetail } from '../../api/types';

const UsersDemo: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<UserDetail | null>(null);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingUser, setEditingUser] = useState<UserDetail | null>(null);

    const handleUserView = (user: UserDetail): void => {
        setSelectedUser(user);
        setShowForm(false);
        setEditingUser(null);
    };

    const handleUserEdit = (user: UserDetail): void => {
        setEditingUser(user);
        setShowForm(true);
        setSelectedUser(null);
    };

    const handleFormSubmit = (user: UserDetail): void => {
        setShowForm(false);
        setEditingUser(null);
        setSelectedUser(null);
        // Optionally refresh the users list
    };

    const handleFormCancel = (): void => {
        setShowForm(false);
        setEditingUser(null);
    };

    const handleBackToList = (): void => {
        setSelectedUser(null);
        setShowForm(false);
        setEditingUser(null);
    };

    if (showForm) {
        return (
            <div>
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handleBackToList}>← Back to Users List</button>
                </div>
                <UserForm
                    initialUser={editingUser || undefined}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            </div>
        );
    }

    if (selectedUser) {
        return (
            <div>
                <div style={{ marginBottom: '20px' }}>
                    <button onClick={handleBackToList}>← Back to Users List</button>
                </div>
                <UserItem
                    user={selectedUser}
                    variant="detailed"
                    onEdit={() => handleUserEdit(selectedUser)}
                    onDelete={handleBackToList}
                />
            </div>
        );
    }

    return (
        <div>
            <div style={{ marginBottom: '20px' }}>
                <h1>Users Admin Demo</h1>
                <p>This demo shows the Users admin components in action:</p>
                <ul>
                    <li><strong>Filter by Role:</strong> Use the dropdown to filter users by their role (Admin, Author, User)</li>
                    <li><strong>View Users:</strong> Click "View" to see detailed user information with avatar and full profile</li>
                    <li><strong>Edit User Roles:</strong> Click "Edit Role" to modify user permissions (Admin only)</li>
                    <li><strong>Delete Users:</strong> Click "Delete" to remove users (Admin only, cannot delete self)</li>
                    <li><strong>User Statistics:</strong> See total user counts and role distribution</li>
                    <li><strong>Self-Protection:</strong> Your own account is highlighted and protected from deletion</li>
                </ul>
                
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                    <h3>Admin Features:</h3>
                    <ul>
                        <li>🔍 <strong>Smart Filtering:</strong> Role-based user filtering with live counts</li>
                        <li>👤 <strong>User Profiles:</strong> Complete user information with avatars and authorities</li>
                        <li>🛡️ <strong>Role Management:</strong> Secure role editing with visual feedback</li>
                        <li>⚡ <strong>Quick Actions:</strong> Efficient user management workflow</li>
                        <li>🚫 <strong>Safety Features:</strong> Self-deletion prevention and confirmation dialogs</li>
                    </ul>
                </div>
            </div>
            
            <Users
                onView={handleUserView}
                onEdit={handleUserEdit}
            />
        </div>
    );
};

export default UsersDemo; 