import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import '../../../format/ArticleForm.css';
import { useAuth } from '../../../api/AuthContext';

interface ArticleFormProps {
	isEdit?: boolean;
}

const UserArticleForm: React.FC<ArticleFormProps> = ({ isEdit = false }) => {
	const { id } = useParams<{ id: string }>();
	const [title, setTitle] = useState<string>('');
	const [content, setContent] = useState<string>('');
	const navigate = useNavigate();

	const { token, currentUser } = useAuth();
	console.log(token);
	console.log(currentUser);

	useEffect(() => {
		if (isEdit && id) {
			fetchArticleById(id).then(article => {
				setTitle(article.title);
				setContent(article.content);
			}).catch(err => {
				const errorMessage = (err as Error).message || 'An error occurred';
				if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else if (errorMessage.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else {
					navigate('/error');
				}
			});
		}
	}, [id, isEdit, token, navigate]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		const article = { title, content };

		try {
			if (isEdit && id && token) {
				await updateArticle(id, article, token);
			} else if (token) {
				await createArticle(article, token);
			}
			navigate('/public/articles');
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
		}
	};

	return (
		<div className="article-form-container">
			<form onSubmit={handleSubmit}>
				<h2>{isEdit ? 'Edit Article' : 'Create Article'}</h2>
				<input 
					placeholder="Title" 
					value={title} 
					onChange={(e) => setTitle(e.target.value)} 
					required 
				/>
				<textarea 
					placeholder="Content" 
					value={content} 
					onChange={(e) => setContent(e.target.value)} 
					required 
				/>
				<button type="submit">{isEdit ? 'Update' : 'Create'}</button>
			</form>
		</div>
	);
};

export default UserArticleForm; 