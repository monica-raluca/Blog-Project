const authHeader = () => ({
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
    'Content-Type': 'application/json'
});

function parseSpringError(res, errorData) {
    // Spring Boot 3+ ProblemDetail: 'detail', legacy: 'message', fallback: status text
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function fetchUserById(id) {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchCurrentUser(username) {
    const res = await fetch(`/api/users/${username}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`/api/users`, {
        headers: authHeader(),
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function updateUserRole(id, newRole) {
    const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(newRole)
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteUser(id) {
    const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
}
