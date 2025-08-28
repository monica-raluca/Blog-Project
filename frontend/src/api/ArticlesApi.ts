import { Article, ArticleFilters, SortCriteria, FetchArticlesParams, ArticlesResponse, User, ApiError } from './types';

function parseSpringError(res: Response, errorData: ApiError): string {
    return errorData?.detail || errorData?.message || res.statusText || 'Unknown error';
}

export async function fetchAllArticles({ filters, sortCriteria, size = 10, from = 0 }: FetchArticlesParams): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    params.set('size', size.toString());
    params.set('from', from.toString());
    Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
    });
    if (sortCriteria.length > 0) {
        const sortParam = sortCriteria.map(sc => `${sc.field} ${sc.direction}`).join(',');
        params.set('sort', sortParam);
    }
    const res = await fetch(`/api/articles?${params.toString()}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticleById(id: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticlesByTitle(title: string): Promise<ArticlesResponse> {
    const res = await fetch(`/api/articles?title=${title}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function fetchArticlesByAuthor(author: User, size: number = 100, from: number = 0): Promise<ArticlesResponse> {
    const params = new URLSearchParams();
    params.set('author', author.username);
    params.set('size', size.toString());
    params.set('from', from.toString());
    
    const res = await fetch(`/api/articles?${params.toString()}`);
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function createArticle(article: Article, token: string): Promise<Article> {
    const res = await fetch('/api/articles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article),
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function updateArticle(id: string, article: Article, token: string): Promise<Article> {
    const res = await fetch(`/api/articles/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(article)
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
    return res.json();
}

export async function deleteArticle(id: string, token: string): Promise<void> {
    const res = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        },
    });
    if (!res.ok) {
        let errorData: ApiError = {};
        try { errorData = await res.json(); } catch {}
        throw new Error(parseSpringError(res, errorData));
    }
} 