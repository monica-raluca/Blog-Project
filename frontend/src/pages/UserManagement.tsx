// import React, { useEffect, useState } from 'react';
// import { fetchUsers, updateUserRole, deleteUser } from '../api/UsersApi';
// import { UserDetail } from '../api/types';
// import '../format/UserManagement.css';
// import { useNavigate } from 'react-router';

// const UserManagement: React.FC = () => {
//     const [users, setUsers] = useState<UserDetail[]>([]);
//     const [error, setError] = useState<string | null>(null);
//     const navigate = useNavigate();

//     useEffect(() => {
//         loadUsers();
//     }, []);

//     const loadUsers = async (): Promise<void> => {
//         try {
//             const data = await fetchUsers();
//             setUsers(data);
//         } catch (err) {
// 			const errorMessage = (err as Error).message || 'An error occurred';
//             console.log("Error message: ", errorMessage);
//             if (errorMessage.toLowerCase().includes('forbidden')) {
//                 navigate('/forbidden');
//             } else {
//                 navigate('/error');
//             }
//         }
//     };

//     const handleRoleChange = async (id: string, newRole: string): Promise<void> => {
//         try {
//             await updateUserRole(id, { role: newRole });
//             setUsers(users.map(user =>
//                 user.id === id ? { ...user, role: newRole } : user
//             ));
//         } catch (err) {
// 			const errorMessage = (err as Error).message || 'An error occurred';
//             if (errorMessage.toLowerCase().includes('forbidden')) {
//                 navigate('/forbidden');
//             } else {
//                 navigate('/error');
//             }
//         }
//     };

//     const handleDelete = async (id: string): Promise<void> => {
//         if (!window.confirm('Are you sure you want to delete this user?')) return;
//         try {
//             await deleteUser(id);
//             setUsers(users.filter(user => user.id !== id));
//         } catch (err) {
// 			const errorMessage = (err as Error).message || 'An error occurred';
//             if (errorMessage.toLowerCase().includes('forbidden')) {
//                 navigate('/forbidden');
//             } else {
//                 navigate('/error');
//             }
//         }
//     };

//     return (
//         <div className="user-management-container">
//             <h2>All Users</h2>
//             {error && <p style={{ color: 'red' }}>{error}</p>}
//             <table border={1}>
//                 <thead>
//                     <tr>
//                         <th>ID</th>
//                         <th>Username</th>
//                         <th>Email</th>
//                         <th>Role</th>
//                         <th>Actions</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {users.map(user => (
//                         <tr key={user.id}>
//                             <td>{user.id}</td>
//                             <td>{user.username}</td>
//                             <td>{user.email}</td>
//                             <td>
//                                 <select
//                                     value={user.role || ''}
//                                     onChange={(e) => handleRoleChange(user.id, e.target.value)}
//                                 >
//                                     <option value="ROLE_USER">USER</option>
//                                     <option value="ROLE_AUTHOR">AUTHOR</option>
//                                     <option value="ROLE_ADMIN">ADMIN</option>
//                                 </select>
//                             </td>
//                             <td>
//                                 <button onClick={() => handleDelete(user.id)}>Delete</button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// export default UserManagement; 