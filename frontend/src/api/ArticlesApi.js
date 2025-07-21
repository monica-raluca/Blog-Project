const authHeader = () => ({
    'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`,
    'Content-Type': 'application/json'
});

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
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
}

export async function fetchArticleById(id) {
	const res = await fetch(`/api/articles/${id}`);
	if (!res.ok) throw new Error("Article not found");
	return res.json();
}

export async function fetchArticlesByTitle(title) {
	const res = await fetch(`/api/articles?title=${title}`);
	if (!res.ok) throw new Error("No articles with the given title.");
	return res.json();
}

export async function fetchArticlesByAuthor(author) {
	// console.log(author);
	const res = await fetch(`/api/articles?author=${author.username}`);
	if (!res.ok) throw new Error("No articles written by the given author.");
	return res.json();
}

export async function createArticle(article) {
	const res = await fetch('/api/articles', {
		method: 'POST',
		headers: authHeader(),
		body: JSON.stringify(article),
	});
	if (!res.ok) throw new Error('Create failed');
	return res.json();
}

export async function updateArticle(id, article) {
	const res = await fetch(`/api/articles/${id}`, {
		method: 'PUT',
		headers: authHeader(),
		body: JSON.stringify(article)
	});
	if (!res.ok) throw new Error('Update failed');
	return res.json();
}

export async function deleteArticle(id) {
	const res = await fetch(`/api/articles/${id}`, {
		method: 'DELETE',
		headers: {
			'Authorization': `Bearer ${JSON.parse(localStorage.getItem('token'))}`
		}
	});
	if (!res.ok) throw new Error('Delete failed');
}
