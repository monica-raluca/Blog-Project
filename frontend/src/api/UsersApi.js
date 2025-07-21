export async function fetchUsers() {
	const res = await fetch(`/api/users`);
	if (!res.ok) throw new Error("No users found.");
	return res.json();
}

export async function fetchUserById(id) {
	const res = await fetch(`/api/users/${id}`);
	if (!res.ok) throw new Error("No users with the given id.");
	return res.json();
}