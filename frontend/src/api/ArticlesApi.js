function parseSpringError(res, errorData) {
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function fetchAllArticles({ filters, sortCriteria, size = 10, from = 0 }) {
    const params = new URLSearchParams();
    params.set('size', size);
    params.set('from', from);
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    if (sortCriteria.length > 0) {
        const sortParam = sortCriteria.map(sc => `${sc.field} ${sc.direction}`).join(',');
        params.set('sort', sortParam);
    }
    const res = await fetch(`/api/articles?${params.toString()}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticleById(id) {
    const res = await fetch(`/api/articles/${id}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticlesByTitle(title) {
    const res = await fetch(`/api/articles?title=${title}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticlesByAuthor(author) {
    const res = await fetch(`/api/articles?author=${author.username}`);
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function createArticle(article, token) {
    const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article),
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function updateArticle(id, article, token) {
    const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteArticle(id, token) {
    const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) {
        let errorData = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
}
