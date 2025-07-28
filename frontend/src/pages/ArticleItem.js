import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { NavLink } from 'react-router';
import { fetchArticleById, deleteArticle } from '../api/ArticlesApi';
import { createComment, fetchCommentsByArticleId, editComment, deleteComment } from '../api/CommentApi';
import { Link } from 'react-router';
import RequireRoles from '../api/RequireRoles';
import { useAuth } from '../api/AuthContext';
import { hasRole, hasUser } from '../api/AuthApi';

import '../format/Comments.css';
import '../format/ArticleItem.css';

export default function ArticleItem() {
	const { id } = useParams();
	const [article, setArticle] = useState(null);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editedContent, setEditedContent] = useState('');

    const [error, setError] = useState(null);
    const navigate = useNavigate();

	const {token, currentUser} = useAuth();

	useEffect(() => {
		fetchArticleById(id)
			.then(setArticle)
			.catch(err => {
				if (err.message && err.message.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else if (err.message && err.message.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});

        fetchCommentsByArticleId(id)
            .then(setComments)
            .catch(err => {
                if (err.message && err.message.toLowerCase().includes('forbidden')) {
                    navigate('/forbidden');
                } else {
                    navigate('/error');
                }
            });
	}, [id, token]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure?')) return;

        try {
            await deleteArticle(id, token);
            navigate('/articles');
            
        } catch (err) {
            if (err.message && err.message.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        }
    };

    const handleCommentSubmit = async (e) => {
		e.preventDefault();

		// console.log(token, content, id);
        createComment(id, token, content)
        .then(newComment => {
            setComments([...comments, newComment]);
            setContent('');
        })
        .catch(err => {
            if (err.message && err.message.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        });
	};

	const startEditing = (comment) => {
		setEditingCommentId(comment.id);
		setEditedContent(comment.content);
	};

	const handleEditSubmit = async (articleId, commentId) => {
		try {
			console.log(articleId, commentId, editedContent, token);
			await editComment(articleId, commentId, editedContent, token);
			setComments(comments.map(c =>
				c.id === commentId ? { ...c, content: editedContent } : c
			));
			setEditingCommentId(null);
		} catch (err) {
			if (err.message && err.message.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				navigate('/error');
			}
		}
	};

	const handleCommentDelete = async (articleId, commentId) => {
		try {
			console.log(articleId, commentId, token);
			await deleteComment(articleId, commentId, token);
			setComments(comments.filter(c => c.id !== commentId));
		} catch (err) {
			if (err.message && err.message.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				navigate('/error');
			}
		}
	};

	if (!article) return <p>Loading...</p>;

	function formatDateTimeToMin(dateStr) {
		const d = new Date(dateStr);
		return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
	}

	const createdBy = article.author?.username || 'Unknown';
	const createdAt = article.createdDate;
	const editedBy = article.editor.username || createdBy;
	const editedAt = article.updatedDate || createdAt;

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
					<NavLink to={`/users/${article.author.id}`}>Author: {createdBy}</NavLink> at {formatDateTimeToMin(createdAt)}
				</em>
				{showEdited && (
					<>
						<br />
						<em> <NavLink to={`/users/${article.editor.id}`}>Editor: {editedBy}</NavLink> at {formatDateTimeToMin(editedAt)} </em>
					</>
				)}
			</p>
		
			<hr />
			
			<div className="comments">
				<h3>Comments</h3>
				{comments.map(comment => {
					const commentCreatedBy = comment.author?.username || 'Unknown';
					const commentCreatedAt = comment.dateCreated;
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
								<button onClick={() => handleEditSubmit(article.id, comment.id)}>Save</button>
								<button onClick={() => setEditingCommentId(null)}>Cancel</button>
							</>
							) : (
							(hasRole("ADMIN") || comment.author.username === currentUser) && (
								<>
								<button onClick={() => startEditing(comment)}>Edit</button>
								<button onClick={() => handleCommentDelete(article.id, comment.id)}>Delete</button>
								</>
							)
							)}
						</div>
						</div>
					);
					})}
			</div>

			{/* <h3>Comments</h3>
			<ul className="comments-list">
				{comments.map(comment => (
					<li key={comment.id}>
						<strong>{comment.author?.username || 'Anonymous'}:</strong> {comment.content}
					</li>
				))}
			</ul> */}

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
			{(article.author.username === currentUser || hasRole("ADMIN")) &&
			<div className="article-actions">
				<button onClick={() => navigate(`/articles/${article.id}/edit`)}>Edit</button>
				<button onClick={() => handleDelete(article.id)}>Delete</button>
			</div>
			}
			
			</RequireRoles>
			
            
		</div>
        </>
       
	);
}
