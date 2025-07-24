export async function createComment(id, token, content) {
	const res = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content })
    });
    // console.log(token, res, content);
    if (!res.ok) throw new Error('Failed to post comment');

        // console.log(res.json())
	return res.json();
}

export async function fetchCommentsByArticleId(id) {
	const res = await fetch(`/api/articles/${id}/comments`);
	if (!res.ok) throw new Error("The given article has no comments");
	return res.json();
}