import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import '../../../format/ArticleForm.css';
import { useAuth } from '../../../api/AuthContext';
import { useForm } from 'react-hook-form';

interface ArticleFormProps {
	isEdit?: boolean;
}

interface ArticleFormData {
	title: string;
	content: string;
}

const UserArticleForm: React.FC<ArticleFormProps> = ({ isEdit = false }) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	const { token, currentUser } = useAuth();
	console.log(token);
	console.log(currentUser);

	const { 
		register, 
		handleSubmit, 
		setValue, 
		formState: { errors } 
	} = useForm<ArticleFormData>();

	useEffect(() => {
		if (isEdit && id) {
			fetchArticleById(id).then(article => {
				setValue('title', article.title);
				setValue('content', article.content);
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
	}, [id, isEdit, token, navigate, setValue]);

	const handleFormSubmit = async (data: ArticleFormData): Promise<void> => {
		const article = { title: data.title, content: data.content };

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
			<form onSubmit={handleSubmit(handleFormSubmit)}>
				<h2>{isEdit ? 'Edit Article' : 'Create Article'}</h2>
				<input 
					placeholder="Title" 
					{...register("title", { required: "Title is required" })}
				/>
				{errors.title && (
					<p className="field-error">{errors.title.message}</p>
				)}
				<textarea 
					placeholder="Content" 
					{...register("content", { required: "Content is required" })}
				/>
				{errors.content && (
					<p className="field-error">{errors.content.message}</p>
				)}
				<button type="submit">{isEdit ? 'Update' : 'Create'}</button>
			</form>
		</div>
	);
};

export default UserArticleForm; 