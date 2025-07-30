import { UserDetail, UserRole, ApiError } from './types';

const createAuthHeaders = (token: string): HeadersInit => ({
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
});

function parseSpringError(res: Response, errorData: ApiError): string {
    // Spring Boot 3+ ProblemDetail: 'detail', legacy: 'message', fallback: status text
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function fetchUserById(id: string): Promise<UserDetail> {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchCurrentUser(username: string): Promise<UserDetail> {
    const res = await fetch(`/api/users/${username}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchUsers(token: string): Promise<UserDetail[]> {
    const res = await fetch(`/api/users`, {
        headers: createAuthHeaders(token),
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function updateUserRole(id: string, newRole: UserRole, token: string): Promise<UserDetail> {
    console.log("updateUserRole");
    console.log(token);
    console.log(newRole);
    console.log(id);
    console.log(JSON.stringify(newRole.role));
    const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newRole.role)
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteUser(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
} 