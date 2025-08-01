import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { fetchUserById } from '../api/UsersApi';
import { fetchArticlesByAuthor } from '../api/ArticlesApi';
import { UserDetail, Article } from '../api/types';
import '../format/AuthorItem.css';

const AuthorItem: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [author, setAuthor] = useState<UserDetail | null>(null);
	const [articles, setArticles] = useState<Article[]>([]);
	const [showArticles, setShowArticles] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!id) return;
		
        fetchUserById(id)
			.then(setAuthor)
			.catch(err => {
				console.error("Failed to load author", err);
				const errorMessage = (err as Error).message || 'An error occurred';
				console.log(errorMessage);
				if (errorMessage.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});
	}, [id, navigate]);

	const loadArticles = (): void => {
		if (showArticles) {
			setShowArticles(false);
			return;
		}

		if (!author) return;

        fetchArticlesByAuthor(author)
			.then(data => {
				// Handle both direct array and object with articles property
				if (Array.isArray(data)) {
					setArticles(data);
				} else {
					setArticles(data.articles || []);
				}
				setShowArticles(true);
			})
			.catch(err => {
				console.error("Failed to load articles", err);
				const errorMessage = (err as Error).message || 'An error occurred';
				if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});
	};

	if (!author) return <p>Loading author...</p>;

	return (
		<div className="author-profile">
			<div className="author-profile-picture">
				{/* Profile picture placeholder, could be an <img> if available */}
				{author.profilePicture ? (
					<img 
						src={author.profilePicture} 
						alt="Profile" 
						style={{
							width: '100%', 
							height: '100%', 
							objectFit: 'cover', 
							borderRadius: '50%'
						}} 
					/>
				) : (
					author.username ? author.username[0].toUpperCase() : '?'
				)}
			</div>
			<div className="author-profile-username">{author.username}</div>
			<div className="author-profile-email">Email: {author.email}</div>
			<div className="author-profile-joined">
				Joined: {new Date(author.createdDate || author.createdAt || '').toLocaleDateString()}
			</div>

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
};

export default AuthorItem; 