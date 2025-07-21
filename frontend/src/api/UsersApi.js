const authHeader = () => ({
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
    'Content-Type': 'application/json'
});

export async function fetchUserById(id) {
	const res = await fetch(`/api/users/${id}`);
	if (!res.ok) throw new Error("No users with the given id.");
	return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`/api/users`, {
        headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
}

export async function updateUserRole(id, newRole) {
    console.log(JSON.stringify(newRole));
    const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(newRole)
    });
    if (!res.ok) throw new Error('Failed to update role');
    return res.json();
}

export async function deleteUser(id) {
    const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (!res.ok) throw new Error('Failed to delete user');
}
