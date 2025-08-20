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

	// Helper function to escape HTML entities
	const escapeHtml = (text: string): string => {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	};

	// Simple syntax highlighting for common languages with inline styles
	const addBasicSyntaxHighlighting = (code: string, language: string): string => {
		if (!language || language === 'plain') return escapeHtml(code);
		
		let highlighted = escapeHtml(code);
		
		// C/C++/Java keywords
		if (['c', 'cpp', 'c++', 'java', 'javascript', 'js', 'typescript', 'ts'].includes(language.toLowerCase())) {
			highlighted = highlighted.replace(/\b(int|char|float|double|void|if|else|for|while|return|class|public|private|protected|static|const|let|var|function)\b/g, 
				'<span class="code-highlight-keyword" style="color: #569cd6; font-weight: 600;">$1</span>');
			highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="code-highlight-number" style="color: #b5cea8;">$1</span>');
			highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="code-highlight-string" style="color: #ce9178;">"$1"</span>');
			highlighted = highlighted.replace(/'([^']*)'/g, '<span class="code-highlight-string" style="color: #ce9178;">\'$1\'</span>');
			highlighted = highlighted.replace(/\/\/(.*?)$/gm, '<span class="code-highlight-comment" style="color: #6a9955; font-style: italic;">//$1</span>');
		}
		
		// Python keywords
		if (['python', 'py'].includes(language.toLowerCase())) {
			highlighted = highlighted.replace(/\b(def|if|else|elif|for|while|return|import|from|class|try|except|finally|with|as|in|not|and|or|is|None|True|False)\b/g, 
				'<span class="code-highlight-keyword" style="color: #569cd6; font-weight: 600;">$1</span>');
			highlighted = highlighted.replace(/\b(\d+)\b/g, '<span class="code-highlight-number" style="color: #b5cea8;">$1</span>');
			highlighted = highlighted.replace(/"([^"]*)"/g, '<span class="code-highlight-string" style="color: #ce9178;">"$1"</span>');
			highlighted = highlighted.replace(/'([^']*)'/g, '<span class="code-highlight-string" style="color: #ce9178;">\'$1\'</span>');
			highlighted = highlighted.replace(/#(.*?)$/gm, '<span class="code-highlight-comment" style="color: #6a9955; font-style: italic;">#$1</span>');
		}
		
		return highlighted;
	};

	// Function to convert markdown to HTML with focus on code blocks
	const convertMarkdownToHtml = (markdown: string): string => {
		try {
			let html = markdown;
			
			// Convert code blocks with language specification
			html = html.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, language, code) => {
				const lang = language || 'plain';
				const trimmedCode = code.trim();
				const highlightedCode = addBasicSyntaxHighlighting(trimmedCode, lang);
				return `<pre style="background-color: #1a1a1a; color: #e5e5e5; font-family: 'Courier New', monospace; font-size: 0.875rem; padding: 1rem; border-radius: 0.5rem; display: block; margin: 0.5rem 0; overflow-x: auto; position: relative; border: 1px solid #374151; white-space: pre-wrap; word-break: break-word;"><code class="language-${lang}" data-language="${lang}">${highlightedCode}</code></pre>`;
			});
			
			// Convert inline code
			html = html.replace(/`([^`]+)`/g, '<code style="background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875rem; font-family: \'Courier New\', monospace; color: #374151;">$1</code>');
			
			// Convert bold text
			html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
			html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
			
			// Convert italic text
			html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
			html = html.replace(/_(.*?)_/g, '<em>$1</em>');
			
			// Convert headings
			html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
			html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
			html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
			
			// Convert line breaks (but avoid double line breaks within code blocks)
			html = html.replace(/\n(?![^\n]*<\/code>)/g, '<br>');
			
			// Clean up extra line breaks around code blocks
			html = html.replace(/<br>\s*<pre/g, '<pre');
			html = html.replace(/<\/pre>\s*<br>/g, '</pre>');
			
			// Wrap in paragraph if not already wrapped and doesn't contain block elements
			if (!html.includes('<pre') && !html.includes('<h') && (!html.includes('<') || (!html.startsWith('<') && !html.includes('<p')))) {
				html = `<p>${html}</p>`;
			}
			
			// Code blocks now have inline styles, no need for additional wrappers
			
			return html;
		} catch (error) {
			console.error('Error converting markdown to HTML:', error);
			// Fallback: return markdown wrapped in a paragraph
			return `<p>${markdown.replace(/\n/g, '<br>')}</p>`;
		}
	};

	// Function to detect if content is likely markdown vs HTML
	const isMarkdownContent = (content: string): boolean => {
		// Simple heuristic: if it doesn't contain HTML tags, treat as markdown
		const hasHtmlTags = /<[^>]+>/.test(content);
		const hasMarkdownSyntax = /```|`[^`]+`|\*\*|__|\*|_|#{1,6}\s|^\s*[-*+]\s|^\s*\d+\.\s/m.test(content);
		
		return !hasHtmlTags && hasMarkdownSyntax;
	};

	// Function to safely render comment content
	const renderCommentContent = (content: string): string => {
		if (!content) return '<div></div>';
		
		let processedContent = '';
		
		// If content looks like markdown, convert it to HTML
		if (isMarkdownContent(content)) {
			console.log('UserArticleItem: Converting markdown to HTML:', content);
			processedContent = convertMarkdownToHtml(content);
			console.log('UserArticleItem: Converted HTML:', processedContent);
		} else {
			// Otherwise, assume it's already HTML
			console.log('UserArticleItem: Content assumed to be HTML:', content);
			processedContent = content;
		}
		
		// Ensure content is wrapped in a proper container div for parsing
		if (!processedContent.startsWith('<div')) {
			processedContent = `<div class="comment-content">${processedContent}</div>`;
		}
		
		return processedContent;
	};

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

		// Get HTML content from editor when submitting to preserve formatting
		// Try multiple times in case ref isn't ready immediately
		let htmlContent = '';
		
		try {
			htmlContent = commentEditorRef.current?.getHtml() || '';
			
			if (!htmlContent && commentEditorRef.current) {
				// Wait a small moment and try again
				await new Promise(resolve => setTimeout(resolve, 50));
				htmlContent = commentEditorRef.current?.getHtml() || '';
			}
		} catch (htmlError) {
			console.warn('UserArticleItem: Failed to get HTML content:', htmlError);
			htmlContent = '';
		}
		
		// Get markdown content as fallback
		let markdownContent = '';
		
		try {
			markdownContent = commentEditorRef.current?.getMarkdown() || '';
		} catch (markdownError) {
			console.warn('UserArticleItem: Failed to get markdown content:', markdownError);
			markdownContent = content || ''; // Use the state content as final fallback
		}
		
		// Sanitize HTML content to prevent issues with special characters
		const sanitizeHtml = (html: string) => {
			// Remove null characters and other control characters that might cause issues
			return html.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
					  .replace(/\u0000/g, '')
					  .trim();
		};
		
		let finalContent = htmlContent || content || '';
		
		// If HTML content exists, sanitize it
		if (htmlContent && htmlContent.trim()) {
			finalContent = sanitizeHtml(htmlContent);
		}
		
		console.log('UserArticleItem: Editor ref:', commentEditorRef.current);
		console.log('UserArticleItem: Editor ref getHtml method:', commentEditorRef.current?.getHtml);
		console.log('UserArticleItem: Editor HTML content:', htmlContent);
		console.log('UserArticleItem: HTML generation successful:', htmlContent.length > 0);
		console.log('UserArticleItem: Editor markdown content:', markdownContent);
		console.log('UserArticleItem: Content state (markdown):', content);
		console.log('UserArticleItem: Final content being posted:', finalContent);
		console.log('UserArticleItem: Final content length:', finalContent.length);
		console.log('UserArticleItem: Final content type:', typeof finalContent);
		console.log('UserArticleItem: Will use fallback:', !htmlContent && markdownContent && markdownContent !== finalContent);
		
		// Check if content is empty
		if (!finalContent || finalContent.trim() === '') {
			alert('Please enter some content for your comment');
			return;
		}

        // Helper function to attempt comment creation with fallback
        const attemptWithFallback = async (contentToTry: string, contentType: string) => {
            try {
                const newComment = await createComment(id, token, contentToTry);
                setComments([...comments, newComment]);
                setContent('');
                commentEditorRef.current?.clear();
                return true;
            } catch (err) {
                const errorMessage = (err as Error).message || 'An error occurred';
                console.error(`UserArticleItem: Comment creation failed with ${contentType}:`, err);
                console.error(`UserArticleItem: Error message:`, errorMessage);
                console.error(`UserArticleItem: Content that was sent:`, contentToTry);
                
                if (errorMessage.toLowerCase().includes('forbidden')) {
                    navigate('/forbidden');
                    return true; // Don't try fallback for auth errors
                }
                
                return false; // Try fallback
            }
        };

        // Try HTML first, then markdown as fallback
        const htmlSuccess = await attemptWithFallback(finalContent, 'HTML');
        
        if (!htmlSuccess && markdownContent && markdownContent.trim() && markdownContent !== finalContent) {
            console.log('UserArticleItem: Attempting with markdown fallback...');
            const markdownSuccess = await attemptWithFallback(markdownContent, 'Markdown');
            
            if (!markdownSuccess) {
                alert('Comment creation failed. Please try simplifying your content or removing special formatting.');
            }
        } else if (!htmlSuccess) {
            alert('Comment creation failed. Please try simplifying your content or removing special formatting.');
        }
	};

	const startEditing = (comment: Comment): void => {
		if (comment.id) {
			setEditingCommentId(comment.id);
			setEditedContent(comment.content);
			// Set the content in the edit editor after a small delay to ensure it's rendered
			setTimeout(() => {
				editCommentEditorRef.current?.setHtml(comment.content);
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
									<div 
										className="!border-none !bg-transparent prose prose-slate max-w-none !text-sm"
										dangerouslySetInnerHTML={{ __html: renderCommentContent(comment.content) }}
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