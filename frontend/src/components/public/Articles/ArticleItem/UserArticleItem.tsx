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
import LexicalContentRenderer from '../../../ui/LexicalContentRenderer';
import { createEditor } from 'lexical';
import { $generateHtmlFromNodes } from '@lexical/html';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { YouTubeNode } from '../../../ui/YouTubeNode';

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
			
			// Handle YouTube embeds (from Lexical YouTube transformer)
			html = html.replace(/<iframe[^>]*data-lexical-youtube="([^"]*)"[^>]*><\/iframe>/g, (match, videoId) => {
				return `<div class="youtube-embed-container" style="position: relative; width: 100%; max-width: 800px; margin: 2rem auto;"><div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;" src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
			});

			// Handle YouTube URLs directly (various formats)
			html = html.replace(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/g, (match, videoId) => {
				return `<div class="youtube-embed-container" style="position: relative; width: 100%; max-width: 800px; margin: 2rem auto;"><div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;" src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
			});

			// Handle YouTube markdown links: [YouTube Video](https://www.youtube.com/watch?v=VIDEO_ID)
			html = html.replace(/\[YouTube Video\]\(https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})\)/g, (match, videoId) => {
				return `<div class="youtube-embed-container" style="position: relative; width: 100%; max-width: 800px; margin: 2rem auto;"><div style="position: relative; width: 100%; height: 0; padding-bottom: 56.25%;"><iframe style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: 12px;" src="https://www.youtube-nocookie.com/embed/${videoId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div></div>`;
			});

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
			
			// Clean up extra line breaks around code blocks and YouTube embeds
			html = html.replace(/<br>\s*<pre/g, '<pre');
			html = html.replace(/<\/pre>\s*<br>/g, '</pre>');
			html = html.replace(/<br>\s*<div class="youtube-embed-container"/g, '<div class="youtube-embed-container"');
			html = html.replace(/<\/div>\s*<br>/g, '</div>');
			
			// Wrap in paragraph if not already wrapped and doesn't contain block elements
			if (!html.includes('<pre') && !html.includes('<h') && !html.includes('<div class="youtube-embed-container"') && (!html.includes('<') || (!html.startsWith('<') && !html.includes('<p')))) {
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
		const hasYouTubeUrls = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)/i.test(content);
		
		return (!hasHtmlTags && hasMarkdownSyntax) || hasYouTubeUrls;
	};

	// Helper function to check if content is JSON
	const isJsonContent = (content: string): boolean => {
		try {
			JSON.parse(content);
			return true;
		} catch {
			return false;
		}
	};

	// Helper function to generate HTML from JSON using parseEditorState and generateHtmlFromNodes
	const generateHtmlFromJson = (jsonContent: string): string => {
		try {
			// Create a temporary editor with the same configuration as the main editor
			const tempEditor = createEditor({
				namespace: 'TempEditor',
				theme: {
					paragraph: 'mb-2',
					heading: {
						h1: 'text-2xl font-bold mb-4',
						h2: 'text-xl font-semibold mb-3',
						h3: 'text-lg font-medium mb-2',
					},
					list: {
						nested: {
							listitem: 'list-item',
						},
						ol: 'list-decimal ml-4',
						ul: 'list-disc ml-4',
						listitem: 'mb-1',
					},
					text: {
						bold: 'font-bold',
						italic: 'italic',
						underline: 'underline',
						strikethrough: 'line-through',
						underlineStrikethrough: 'underline line-through',
						code: 'bg-gray-100 px-1 py-0.5 rounded text-sm font-mono',
					},
					link: 'text-blue-600 underline hover:text-blue-800',
					quote: 'border-l-4 border-gray-300 pl-4 italic text-gray-600',
					code: 'bg-gray-900 text-gray-100 font-mono text-sm p-4 rounded-lg block my-2 overflow-x-auto relative border border-gray-700',
					codeHighlight: {
						atrule: 'code-highlight-atrule',
						attr: 'code-highlight-attr',
						boolean: 'code-highlight-boolean',
						builtin: 'code-highlight-builtin',
						cdata: 'code-highlight-cdata',
						char: 'code-highlight-char',
						class: 'code-highlight-function',
						'class-name': 'code-highlight-class-name',
						comment: 'code-highlight-comment',
						constant: 'code-highlight-constant',
						deleted: 'code-highlight-deleted',
						doctype: 'code-highlight-doctype',
						entity: 'code-highlight-entity',
						function: 'code-highlight-function',
						important: 'code-highlight-important',
						inserted: 'code-highlight-inserted',
						keyword: 'code-highlight-keyword',
						namespace: 'code-highlight-namespace',
						number: 'code-highlight-number',
						operator: 'code-highlight-operator',
						prolog: 'code-highlight-prolog',
						property: 'code-highlight-property',
						punctuation: 'code-highlight-punctuation',
						regex: 'code-highlight-regex',
						selector: 'code-highlight-selector',
						string: 'code-highlight-string',
						symbol: 'code-highlight-symbol',
						tag: 'code-highlight-tag',
						unchanged: 'code-highlight-unchanged',
						url: 'code-highlight-url',
						variable: 'code-highlight-variable',
					},
					embedBlock: {
						base: 'relative w-full max-w-full my-4 rounded-lg overflow-hidden shadow-lg border border-gray-200',
						focus: 'ring-2 ring-blue-500 ring-opacity-50 border-blue-400',
					},
				},
				nodes: [
					HeadingNode,
					ListNode,
					ListItemNode,
					QuoteNode,
					CodeNode,
					CodeHighlightNode,
					LinkNode,
					AutoLinkNode,
					YouTubeNode,
				],
				onError: (error: Error) => {
					console.error('Temporary editor error:', error);
				},
			});
			
			// Parse the JSON to editor state
			const editorState = tempEditor.parseEditorState(JSON.parse(jsonContent));
			
			// Generate HTML from the editor state
			return editorState.read(() => $generateHtmlFromNodes(tempEditor, null));
		} catch (error) {
			console.error('Failed to generate HTML from JSON:', error);
			return '<div>Error rendering content</div>';
		}
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

		// Get editor state as JSON using JSON.stringify(editorState.toJSON())
		let jsonContent = '';
		
		try {
			jsonContent = commentEditorRef.current?.getEditorStateJson() || '';
			console.log('UserArticleItem: Got editor state JSON:', jsonContent);
		} catch (jsonError) {
			console.warn('UserArticleItem: Failed to get JSON content:', jsonError);
			jsonContent = '';
		}
		
		// Check if content is empty (empty editor state)
		if (!jsonContent || jsonContent.trim() === '' || jsonContent === '{}') {
			alert('Please enter some content for your comment');
			return;
		}

        try {
            const newComment = await createComment(id, token, jsonContent);
            // Use setTimeout to avoid flushSync issues when re-rendering content
            setTimeout(() => {
                setComments([...comments, newComment]);
            }, 0);
            setContent('');
            commentEditorRef.current?.clear();
            console.log('UserArticleItem: Comment created successfully with JSON content');
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            console.error('UserArticleItem: Comment creation failed:', err);
            
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                alert('Comment creation failed. Please try again.');
            }
        }
	};

	const startEditing = (comment: Comment): void => {
		if (comment.id) {
			setEditingCommentId(comment.id);
			setEditedContent(comment.content);
			// Set the JSON content in the edit editor after a small delay to ensure it's rendered
			setTimeout(() => {
				try {
					// Check if content is JSON (new format) or legacy format
					const isJsonContent = (content: string): boolean => {
						try {
							JSON.parse(content);
							return true;
						} catch {
							return false;
						}
					};

					if (isJsonContent(comment.content)) {
						// New JSON format - use parseEditorState approach
						editCommentEditorRef.current?.setEditorStateFromJson(comment.content);
					} else {
						// Legacy format - convert to HTML first
						editCommentEditorRef.current?.setHtml(comment.content);
					}
				} catch (error) {
					console.warn('Failed to set edit content:', error);
					// Fallback to HTML setter
					editCommentEditorRef.current?.setHtml(comment.content);
				}
			}, 100);
		}
	};

	const handleEditSubmit = async (articleId: string, commentId: string): Promise<void> => {
		if (!token) return;
		
		try {
			const finalEditedContent = editCommentEditorRef.current?.getEditorStateJson() || editedContent;
			console.log('UserArticleItem: Editing comment with JSON:', articleId, commentId, finalEditedContent);
			await editComment(articleId, commentId, finalEditedContent, token);
			// Use setTimeout to avoid flushSync issues when re-rendering content
			setTimeout(() => {
				setComments(comments.map(c =>
					c.id === commentId ? { ...c, content: finalEditedContent } : c
				));
			}, 0);
			setEditingCommentId(null);
			setEditedContent('');
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			console.error('UserArticleItem: Comment edit failed:', err);
			if (errorMessage.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				alert('Comment edit failed. Please try again.');
			}
		}
	};

	const handleCommentDelete = async (articleId: string, commentId: string): Promise<void> => {
		if (!token) return;
		
		try {
			console.log(articleId, commentId, token);
			await deleteComment(articleId, commentId, token);
			// Use setTimeout to avoid flushSync issues when re-rendering content
			setTimeout(() => {
				setComments(comments.filter(c => c.id !== commentId));
			}, 0);
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
			<div className='!mb-[18px] !pl-[48px] !pr-[48px]'>
				<div>
					<LexicalContentRenderer 
						content={article.content}
						className="!border-none !bg-transparent"
					/>
				</div>
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
									<LexicalContentRenderer 
										content={comment.content}
										className="!border-none !bg-transparent !text-sm"
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