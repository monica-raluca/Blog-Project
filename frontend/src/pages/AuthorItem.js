import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { fetchUserById } from '../api/UsersApi';
import { fetchArticlesByAuthor } from '../api/ArticlesApi';
import '../format/AuthorItem.css';

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
		<div className="author-profile">
			<div className="author-profile-picture">
				{/* Profile picture placeholder, could be an <img> if available */}
				{author.profilePicture ? (
					<img src={author.profilePicture} alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'}} />
				) : (
					author.username ? author.username[0].toUpperCase() : '?'
				)}
			</div>
			<div className="author-profile-username">{author.username}</div>
			<div className="author-profile-email">Email: {author.email}</div>
			<div className="author-profile-joined">Joined: {new Date(author.createdDate).toLocaleDateString()}</div>

			<button onClick={loadArticles} className='btn'>
				{showArticles ? "Hide Articles" : "Show Articles"}
			</button>

			{showArticles && (
				<ul className="author-profile-articles-list">
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
