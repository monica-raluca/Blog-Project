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

import LexicalEditor, { LexicalEditorRef } from '../../../ui/LexicalEditor';

import { Button } from '@/components/ui/button';



const UserArticleItem: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [article, setArticle] = useState<Article | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState<string>('');
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
	const [editedContent, setEditedContent] = useState<string>('');
	
	const commentEditorRef = React.useRef<LexicalEditorRef>(null);
	const editCommentEditorRef = React.useRef<LexicalEditorRef>(null);

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

		const finalContent = commentEditorRef.current?.getMarkdown() || content;

        createComment(id, token, finalContent)
        .then(newComment => {
            setComments([...comments, newComment]);
            setContent('');
			commentEditorRef.current?.clear();
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
			// Set the content in the edit editor after a small delay to ensure it's rendered
			setTimeout(() => {
				editCommentEditorRef.current?.setMarkdown(comment.content);
			}, 100);
		}
	};

	const handleEditSubmit = async (articleId: string, commentId: string): Promise<void> => {
		if (!token) return;
		
		try {
			const finalEditedContent = editCommentEditorRef.current?.getMarkdown() || editedContent;
			console.log(articleId, commentId, finalEditedContent, token);
			await editComment(articleId, commentId, finalEditedContent, token);
			setComments(comments.map(c =>
				c.id === commentId ? { ...c, content: finalEditedContent } : c
			));
			setEditingCommentId(null);
			setEditedContent('');
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
         <div className="!w-full !max-w-[1000px] backdrop-blur box-border shadow-[0_4px_32px_rgba(22,41,56,0.07)] !mx-auto !my-0 pt-16 !pb-12 !px-8 !py-8 rounded-[18px] bg-[rgba(255,255,255,0.82)]">
			<h2 className='!font-bold !text-[2.7em] !text-[#181818] !mb-[18px] !leading-[1.13] !tracking-[-0.01em] !pl-[48px]'>{article.title}</h2>
			<div className='!text-[1.18em] !text-[#232323] !mb-[18px] !leading-[1.8] !pl-[48px] !pr-[48px]'>
				<LexicalEditor
					initialValue={article.content}
					readOnly={true}
					showToolbar={false}
					className="!border-none !bg-transparent prose prose-slate max-w-none"
				/>
			</div>
			<p className='!pl-[48px] !pr-[48px]'>
				<em className='!text-[#6a6a6a] !font-italic !text-[0.95em] !mb-[4px]'>
					<NavLink to={`/public/users/${article.author?.id}`}>Author: {createdBy}</NavLink> at {formatDateTimeToMin(createdAt)}
				</em>
				{showEdited && (
					<>
						<br />
						<em className='!text-[#6a6a6a] !font-italic !text-[0.95em] !mb-[4px]'> <NavLink to={`/public/users/${article.editor?.id}`}>Editor: {editedBy}</NavLink> at {formatDateTimeToMin(editedAt)} </em>
					</>
				)}
			</p>
		
			<hr className='!border-[#ececec] !border-[1.5px] !mt-[40px] !mb-[32px] !ml-[0px] !mr-[0px]' />
			
			<div className="comments">
				<h3 className='!font-semibold !text-[1.4em] !text-[#162938] !mb-[36px] !mt-[18px] !ml-[0px]'>Comments</h3>
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
						<div key={comment.id} className="!flex !align-start !gap-[12px] !mb-[18px] !pt-[10px] !pb-[10px]">
						<div>
							<p><strong>{commentCreatedBy}</strong>:</p>
							<div className='!text-[0.95em] !text-[#6a6a6a] !mb-[4px]'>
							at {formatDateTimeToMin(commentCreatedAt)}
							</div>
							{editingCommentId === comment.id ? (
							<>
								<LexicalEditor
									ref={editCommentEditorRef}
									initialValue={editedContent}
									onChange={(newMarkdown) => setEditedContent(newMarkdown)}
									placeholder="Edit your comment... Use Markdown formatting!"
									minHeight="150px"
									showToolbar={true}
									className="!border-[#162938] !border-[1px] !rounded-[4px] !mb-[8px] !mt-[8px]"
								/>
							</>
							) : (
							<>
								<div>
									<LexicalEditor
										initialValue={comment.content}
										readOnly={true}
										showToolbar={false}
										className="!border-none !bg-transparent prose prose-slate max-w-none !text-sm"
									/>
								</div>
								{showCommentEdited && (
								<div className='!text-[0.93em] !text-[#8a8a8a] !mt-[2px]'>
									Edited by <strong>{commentEditedBy}</strong> at {formatDateTimeToMin(commentEditedAt)}
								</div>
								)}
							</>
							)}
						</div>
						<div className="comment-actions">
							{editingCommentId === comment.id ? (
							<>
								<Button variant="success" size="sm" onClick={() => article.id && comment.id && handleEditSubmit(article.id, comment.id)}>Save</Button>
								<Button variant="cloud" size="sm" onClick={() => setEditingCommentId(null)}>Cancel</Button>
							</>
							) : (
							(hasRole("ADMIN") || comment.author?.username === currentUser) && (
								<>
								<Button variant="soft" size="sm" onClick={() => startEditing(comment)}>Edit</Button>
								<Button variant="danger" size="sm" onClick={() => article.id && comment.id && handleCommentDelete(article.id, comment.id)}>Delete</Button>
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
					<LexicalEditor
						ref={commentEditorRef}
						initialValue={content}
						onChange={(newMarkdown) => setContent(newMarkdown)}
						placeholder="Write your comment... Use Markdown formatting!"
						minHeight="150px"
						showToolbar={true}
						className="!border-[#162938] !border-[1px] !rounded-[4px] !mb-[8px] !mt-[8px]"
					/>
					<Button variant="dreamy" size="sm" type="submit">Post Comment</Button>
					{error && <p style={{ color: 'red' }}>{error}</p>}
				</form>
			) : (
				<p><em><Link to="/login">Login</Link> to comment.</em></p>
			)}

			<RequireRoles roles={["AUTHOR", "ADMIN"]}>
			{(article.author?.username === currentUser || hasRole("ADMIN")) &&
			<div className="!flex !gap-[12px] !mt-[18px] !mb-[0px]">
				<Button variant="pastel" size="sm" onClick={() => navigate(`/public/articles/${article.id}/edit`)}>Edit</Button>
				<Button variant="danger" size="sm" onClick={() => article.id && handleDelete(article.id)}>Delete</Button>
			</div>
			}
			
			</RequireRoles>
            
		</div>
        </>
	);
};

export default UserArticleItem; 