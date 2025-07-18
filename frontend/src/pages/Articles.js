import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { fetchAllArticles } from '../api/ArticlesApi';

export default function Articles() {
	const [articles, setArticles] = useState([]);

	useEffect(() => {
		fetchAllArticles()
			.then(setArticles)
			.catch(err => console.error("Error loading articles:", err));
	}, []);

	return (
		<div className='articles'>
			{articles.map(article => (
				<div className='article' key={article.id}>
					<NavLink className='title' to={`/articles/${article.id}`}>
						{article.title}
					</NavLink>
					<div className='summary'>
						{article.summary}
					</div>
				</div>
			))}
		</div>
	);
}