function parseSpringError(res, errorData) {
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function createComment(id, token, content) {
    const res = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchCommentsByArticleId(id) {
    const res = await fetch(`/api/articles/${id}/comments`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function editComment(articleId, commentId, content, token) {
    const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({content})
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteComment(articleId, commentId, token) {
    const res = await fetch(`/api/articles/${articleId}/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
}