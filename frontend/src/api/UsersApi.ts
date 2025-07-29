import { UserDetail, UserRole, ApiError } from './types';

const authHeader = (): HeadersInit => ({
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token') || 'null')}`,
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

export async function fetchUsers(): Promise<UserDetail[]> {
    const res = await fetch(`/api/users`, {
        headers: authHeader(),
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function updateUserRole(id: string, newRole: UserRole): Promise<UserDetail> {
    const res = await fetch(`/api/users/${id}/role`, {
        method: 'PUT',
        headers: authHeader(),
        body: JSON.stringify(newRole)
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteUser(id: string): Promise<void> {
    const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: authHeader()
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
} 