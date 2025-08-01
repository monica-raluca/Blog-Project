import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { NavLink } from 'react-router';
import { fetchArticleById, deleteArticle } from '../../../../api/ArticlesApi';
import { createComment, fetchCommentsByArticleId, editComment, deleteComment } from '../../../../api/CommentApi';
import { Link } from 'react-router';
import RequireRoles from '../../../../api/RequireRoles';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole, hasUser } from '../../../../api/AuthApi';
import { Article, Comment } from '../../../../api/types';

import '../../../../format/Comments.css';
import '../../../../format/ArticleItem.css';

const UserArticleItem: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState<string>('');
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editedContent, setEditedContent] = useState<string>('');

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

	const { token, currentUser } = useAuth();

	useEffect(() => {
		if (!id) return;
		
		fetchArticleById(id)
			.then(setArticle)
			.catch(err => {
				const errorMessage = (err as Error).message || 'An error occurred';
				if (errorMessage.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});

        fetchCommentsByArticleId(id)
            .then(setComments)
            .catch(err => {
				const errorMessage = (err as Error).message || 'An error occurred';
                if (errorMessage.toLowerCase().includes('forbidden')) {
                    navigate('/forbidden');
                } else {
                    navigate('/error');
                }
            });
	}, [id, token, navigate]);

    const handleDelete = async (articleId: string): Promise<void> => {
        if (!window.confirm('Are you sure?') || !token) return;

        try {
            await deleteArticle(articleId, token);
            navigate('/public/articles');
            
        } catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		
		if (!id || !token) return;

        createComment(id, token, content)
        .then(newComment => {
            setComments([...comments, newComment]);
            setContent('');
        })
        .catch(err => {
			const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        });
	};

	const startEditing = (comment: Comment): void => {
		if (comment.id) {
			setEditingCommentId(comment.id);
			setEditedContent(comment.content);
		}
	};

	const handleEditSubmit = async (articleId: string, commentId: string): Promise<void> => {
		if (!token) return;
		
		try {
			console.log(articleId, commentId, editedContent, token);
			await editComment(articleId, commentId, editedContent, token);
			setComments(comments.map(c =>
				c.id === commentId ? { ...c, content: editedContent } : c
			));
			setEditingCommentId(null);
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			if (errorMessage.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				navigate('/error');
			}
		}
	};

	const handleCommentDelete = async (articleId: string, commentId: string): Promise<void> => {
		if (!token) return;
		
		try {
			console.log(articleId, commentId, token);
			await deleteComment(articleId, commentId, token);
			setComments(comments.filter(c => c.id !== commentId));
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			if (errorMessage.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				navigate('/error');
			}
		}
	};

	if (!article) return <p>Loading...</p>;

	function formatDateTimeToMin(dateStr: string): string {
		const d = new Date(dateStr);
		return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
	}

	const createdBy = article.author?.username || 'Unknown';
	const createdAt = article.createdDate || article.createdAt || '';
	const editedBy = article.editor?.username || createdBy;
	const editedAt = article.updatedDate || article.updatedAt || createdAt;

	const showEdited = (
		createdBy !== editedBy ||
		formatDateTimeToMin(createdAt) !== formatDateTimeToMin(editedAt)
	);

	return (
        <>
         <div className="article-page">
			<h2>{article.title}</h2>
			<p>{article.content}</p>
			<p>
				<em>
					<NavLink to={`/users/${article.author?.id}`}>Author: {createdBy}</NavLink> at {formatDateTimeToMin(createdAt)}
				</em>
				{showEdited && (
					<>
						<br />
						<em> <NavLink to={`/users/${article.editor?.id}`}>Editor: {editedBy}</NavLink> at {formatDateTimeToMin(editedAt)} </em>
					</>
				)}
			</p>
		
			<hr />
			
			<div className="comments">
				<h3>Comments</h3>
				{comments.map(comment => {
					const commentCreatedBy = comment.author?.username || 'Unknown';
					const commentCreatedAt = comment.dateCreated || comment.createdAt || '';
					const commentEditedBy = comment.editor?.username || commentCreatedBy;
					const commentEditedAt = comment.dateEdited || commentCreatedAt;
					const showCommentEdited = (
						commentCreatedBy !== commentEditedBy ||
						formatDateTimeToMin(commentCreatedAt) !== formatDateTimeToMin(commentEditedAt)
					);
					return (
						<div key={comment.id} className="comment">
						<div>
							<p><strong>{commentCreatedBy}</strong>:</p>
							<div style={{ fontSize: '0.95em', color: '#6a6a6a', marginBottom: 4 }}>
							at {formatDateTimeToMin(commentCreatedAt)}
							</div>
							{editingCommentId === comment.id ? (
							<>
								<textarea
								className="edit-comment-textarea"
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								/>
							</>
							) : (
							<>
								<p>{comment.content}</p>
								{showCommentEdited && (
								<div style={{ fontSize: '0.93em', color: '#8a8a8a', marginTop: 2 }}>
									Edited by <strong>{commentEditedBy}</strong> at {formatDateTimeToMin(commentEditedAt)}
								</div>
								)}
							</>
							)}
						</div>
						<div className="comment-actions">
							{editingCommentId === comment.id ? (
							<>
								<button onClick={() => article.id && comment.id && handleEditSubmit(article.id, comment.id)}>Save</button>
								<button onClick={() => setEditingCommentId(null)}>Cancel</button>
							</>
							) : (
							(hasRole("ADMIN") || comment.author?.username === currentUser) && (
								<>
								<button onClick={() => startEditing(comment)}>Edit</button>
								<button onClick={() => article.id && comment.id && handleCommentDelete(article.id, comment.id)}>Delete</button>
								</>
							)
							)}
						</div>
						</div>
					);
					})}
			</div>

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
				<p><em><Link to="/login">Login</Link> to comment.</em></p>
			)}

			<RequireRoles roles={["AUTHOR", "ADMIN"]}>
			{(article.author?.username === currentUser || hasRole("ADMIN")) &&
			<div className="article-actions">
				<button onClick={() => navigate(`/public/articles/${article.id}/edit`)}>Edit</button>
				<button onClick={() => article.id && handleDelete(article.id)}>Delete</button>
			</div>
			}
			
			</RequireRoles>
            
		</div>
        </>
	);
};

export default UserArticleItem; 