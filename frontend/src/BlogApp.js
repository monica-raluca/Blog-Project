import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useParams, Navigate, NavLink } from "react-router";

import { Layout } from './Layout';


export function BlogApp() {
	// TODO: Redirect from '/' to '/Articles'.
	// TODO: Add Layout component, containing sections common to multiple pages (such as header).
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<Navigate to="/articles" replace />} />
					<Route path="articles" element={<Articles />} />
					<Route path="articles/:id" element={<ArticleItem />} />
				</Route>
			</Routes>
			
		</BrowserRouter>
	);
}

export function Articles() {
	const [articles, setArticles] = useState([]);

	useEffect(() => {
		fetch("/api/articles")
			.then(response => response.json())
			.then((data) => {
				console.log(data)
				setArticles(data);
			});
	}, []);

	return (
		<div className='articles'>
			{articles.map((article) => (
				<div className='article' key={article.id}>
					<NavLink className='title' to={`/articles/${article.id}`}>{article.title}</NavLink>
					<div className='summary'>{article.summary}</div>

					<pre>
						{JSON.stringify(article, null, 2)}
					</pre>
				</div>
			))}
		</div>
	);
}

export function ArticleItem() {
	let params = useParams();

	return (
		<div>Post {params.id}</div>
	);
}