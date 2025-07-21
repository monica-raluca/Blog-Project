import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchUserById } from '../api/UsersApi';
import { fetchArticlesByAuthor } from '../api/ArticlesApi';

export default function Author() {
	const { id } = useParams();
	const [author, setAuthor] = useState(null);
	const [articles, setArticles] = useState([]);
	const [showArticles, setShowArticles] = useState(false);

	useEffect(() => {
        fetchUserById(id)
			.then(setAuthor)
			.catch(err => console.error("Failed to load author", err));
	}, [id]);

	const loadArticles = () => {
		if (showArticles) {
			setShowArticles(false);
			return;
		}

        fetchArticlesByAuthor(author)
			.then(data => {
				setArticles(data);
				setShowArticles(true);
			})
			.catch(err => console.error("Failed to load articles", err));
	};

	if (!author) return <p>Loading author...</p>;

	return (
		<div>
			<h2>Author: {author.username}</h2>
			<p>Email: {author.email}</p>
			<p>Joined: {new Date(author.createdDate).toLocaleDateString()}</p>

			<button onClick={loadArticles} className='btn'>
				{showArticles ? "Hide Articles" : "Show Articles"}
			</button>

			{showArticles && (
				<ul>
					{articles.map(article => (
						<li key={article.id}>
							<a href={`/articles/${article.id}`}>{article.title}</a>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
