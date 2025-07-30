import { Comment, ApiError } from './types';

function parseSpringError(res: Response, errorData: ApiError): string {
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function createComment(id: string, token: string, content: string): Promise<Comment> {
    const res = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchAllComments(): Promise<Comment[]> {
    const res = await fetch(`/api/comments`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchCommentsByArticleId(id: string): Promise<Comment[]> {
    const res = await fetch(`/api/articles/${id}/comments`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function editComment(articleId: string, commentId: string, content: string, token: string): Promise<Comment> {
    const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({content})
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteComment(articleId: string, commentId: string, token: string): Promise<void> {
    const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
} 