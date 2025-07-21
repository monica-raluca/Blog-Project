// src/pages/ArticleItem.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { NavLink } from 'react-router';
import { fetchArticleById, deleteArticle } from '../api/ArticlesApi';
import { createComment, fetchCommentsByArticleId } from '../api/CommentApi';

import '../format/Comments.css';

export default function ArticleItem() {
	const { id } = useParams();
	const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const currentUser = localStorage.getItem('currentUser');
    const token = JSON.parse(localStorage.getItem('token'));

	useEffect(() => {
		fetchArticleById(id)
			.then(setArticle)
			.catch(err => console.error("Article not found", err));

        fetchCommentsByArticleId(id)
            .then(setComments)
            .catch(err => console.error("Comments not found", err));
	}, [id]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;

        try {
            await deleteArticle(id);
            navigate('/articles');
            
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    const handleCommentSubmit = async (e) => {
		e.preventDefault();

        createComment(id, token, content)
        .then(newComment => {
            setComments([...comments, newComment]);
            setContent('');
        })
        .catch(err => {
            console.err("Failed to upload comment", err);
            setError("Failed to upload comment");
        });
	};

	if (!article) return <p>Loading...</p>;

	return (
        <>
         <div className="article-page">
			<h2>{article.title}</h2>
			<p>{article.content}</p>
			<p><em><NavLink to={`/users/${article.author.id}`}>Author: {article.author?.username || 'Unknown'}</NavLink></em></p>

			<hr />

			<h3>Comments</h3>
			<ul className="comments-list">
				{comments.map(comment => (
					<li key={comment.id}>
						<strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.content}
					</li>
				))}
			</ul>

			{currentUser ? (
				<form onSubmit={handleCommentSubmit} className="comment-form">
					<textarea
						value={content}
						onChange={(e) => setContent(e.target.value)}
						required
						rows={3}
						placeholder="Write your comment..."
					></textarea>
					<button type="submit">Post Comment</button>
					{error && <p style={{ color: 'red' }}>{error}</p>}
				</form>
			) : (
				<p><em>Login to comment.</em></p>
			)}
		</div>
        
        <button onClick={() => navigate(`/articles/${article.id}/edit`)}>Edit</button>
        <button onClick={() => handleDelete(article.id)}>Delete</button>

        </>
       
	);
}
