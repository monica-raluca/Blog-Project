// src/pages/ArticleItem.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { NavLink } from 'react-router';
import { fetchArticleById } from '../api/ArticlesApi';

export default function ArticleItem() {
	const { id } = useParams();
	const [article, setArticle] = useState(null);

	useEffect(() => {
		fetchArticleById(id)
			.then(setArticle)
			.catch(err => console.error("Article not found", err));
	}, [id]);

	if (!article) return <p>Loading...</p>;

	return (
		<div>
			<h2>{article.title}</h2>
			<p>{article.content}</p>
            <p>Author:{" "}
                <NavLink to={`/users/${article.author.id}`}>{article.author.username}</NavLink>
            </p>
		</div>
	);
}
