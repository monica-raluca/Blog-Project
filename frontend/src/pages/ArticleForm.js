import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../api/ArticlesApi';
import '../format/ArticleForm.css';
import { useAuth } from '../api/AuthContext';

export default function ArticleForm({ isEdit = false }) {
	const { id } = useParams();
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const navigate = useNavigate();

	const {token, currentUser} = useAuth();
	console.log(token);
	console.log(currentUser);

	useEffect(() => {
		if (isEdit) {
			fetchArticleById(id).then(article => {
				setTitle(article.title);
				setContent(article.content);
			});
		}
	}, [id, isEdit, token]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		const article = { title, content };

		try {
			if (isEdit) {
				await updateArticle(id, article, token);
			} else {
				await createArticle(article, token);
			}
			navigate('/articles');
		} catch (err) {
			console.error('Failed to save article:', err);
		}
	};

	return (
		<div className="article-form-container">
			<form onSubmit={handleSubmit}>
				<h2>{isEdit ? 'Edit Article' : 'Create Article'}</h2>
				<input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
				<textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
				<button type="submit">{isEdit ? 'Update' : 'Create'}</button>
			</form>
		</div>
	);
}
