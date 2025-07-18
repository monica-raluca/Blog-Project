export async function fetchAllArticles() {
	const res = await fetch("/api/articles");
	if (!res.ok) throw new Error("Failed to fetch articles");
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
	const res = await fetch(`/api/articles?author=${author}`);
	if (!res.ok) throw new Error("No articles written by the given author.");
	return res.json();
}