import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { Article, Comment } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteArticle, fetchArticleById } from '../../../../api/ArticlesApi';
import { fetchCommentsByArticleId } from '../../../../api/CommentApi';
import CommentItem from '../../Comments/CommentItem/CommentItem';
import { Button } from '@/components/ui/button';
import { useCommentHandlers } from '../../../../handlers/CommentsHandler';

import '../AdminArticles.css';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface ArticleItemProps {
    article?: Article;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    showActions?: boolean;
    variant?: 'card' | 'detailed';
    useRouteParams?: boolean; // New prop to enable route parameter handling
}

const AdminArticleItem: React.FC<ArticleItemProps> = ({
    article: propArticle,
    onEdit,
    onDelete,
    onView,
    showActions = true,
    variant = 'card',
    useRouteParams = false
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [article, setArticle] = useState<Article | null>(propArticle || null);
    const [loading, setLoading] = useState<boolean>(useRouteParams && !propArticle);
    const [error, setError] = useState<string | null>(null);
    const [showAdminActions, setShowAdminActions] = useState<boolean>(true);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);
    
    // const { handleEdit, handleView, handleDelete } = useCommentHandlers(onEdit, onView, token, () => loadComments(article?.id || ''));

    const { handleCommentEdit, handleCommentView, handleCommentDelete } = useCommentHandlers(onEdit, onView, token, () => loadComments(article?.id || ''));
    // Load article from route params if needed
    useEffect(() => {
        if (useRouteParams && id && !propArticle) {
            loadArticleFromRoute();
        } else if (propArticle) {
            setArticle(propArticle);
            setLoading(false);
        }
    }, [id, propArticle, useRouteParams]);

    // Load comments when we have an article ID
    useEffect(() => {
        const articleId = article?.id || id;
        if (articleId && variant === 'detailed') {
            loadComments(articleId);
        }
    }, [article?.id, id, variant]);

    const loadArticleFromRoute = async (): Promise<void> => {
        if (!id) {
            navigate('/articles');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const articleData = await fetchArticleById(id);
            setArticle(articleData);
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            setError(errorMessage);
            
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async (articleId: string): Promise<void> => {
        try {
            setCommentsLoading(true);
            setCommentsError(null);
            const articleComments = await fetchCommentsByArticleId(articleId);
            setComments(articleComments);
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to load comments';
            setCommentsError(errorMessage);
        } finally {
            setCommentsLoading(false);
        }
    };

    const formatDateTimeToMin = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + 
               (d.getMonth() + 1).toString().padStart(2, '0') + '-' + 
               d.getDate().toString().padStart(2, '0') + ' ' + 
               d.getHours().toString().padStart(2, '0') + ':' + 
               d.getMinutes().toString().padStart(2, '0');
    };

    const createdBy = article?.author?.username || 'Unknown';
    const createdAt = article?.createdDate || article?.createdAt || '';
    const editedBy = article?.editor?.username || createdBy;
    const editedAt = article?.updatedDate || article?.updatedAt || createdAt;

    const showEdited = (
        createdBy !== editedBy ||
        formatDateTimeToMin(createdAt) !== formatDateTimeToMin(editedAt)
    );

    const canEdit = hasRole("ADMIN") || article?.author?.username === currentUser;
    const canDelete = hasRole("ADMIN") || article?.author?.username === currentUser;

    const handleDelete = async (): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
            return;
        }
        
        if (!token || !article?.id) return;

        try {
            setIsDeleting(true);
            await deleteArticle(article.id, token);
            if (onDelete) {
                onDelete();
            } else if (useRouteParams) {
                // Navigate back to articles list after deletion
                navigate('/admin/articles');
            }
        } catch (error) {
            console.error('Failed to delete article:', error);
            alert('Failed to delete article. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (): void => {
        if (onEdit) {
            onEdit();
        } else if (article?.id) {
            navigate(`/admin/articles/${article.id}/edit`);
        }
    };

    // Loading state for route-based usage
    if (useRouteParams && loading) {
        return (
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-white rounded-full animate-spin mb-4"></div>
                    <p>Loading article...</p>
                </div>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <h2>Error Loading Article</h2>
                    <p>{error}</p>
                    <Button 
                        onClick={() => navigate('/articles')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                    >
                        Back to Articles
                    </Button>
                </div>
            </div>
        );
    }

    // Not found state for route-based usage
    if (useRouteParams && !article) {
        return (
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <h2>Article Not Found</h2>
                    <p>The requested article could not be found.</p>
                    <Button 
                        onClick={() => navigate('/articles')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                    >
                        Back to Articles
                    </Button>
                </div>
            </div>
        );
    }

    if (!article) return null;

    if (variant === 'detailed') {
        return (
            <div className="!p-[20px] !max-w-[1200px] !mx-auto">
                {useRouteParams && (
                    <div className="!mb-[20px] flex justify-between items-center gap-[16px]">
                        <div className="flex items-center gap-[12px]">
                            <Button 
                                onClick={() => navigate('/admin/articles')}
                                className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white px-3 py-2 transition-colors hover:bg-[#5a6268]"
                            >
                                ← Back to Articles
                            </Button>
                        </div>
                        <div className="flex items-center gap-[12px]">
                            <Button
                                onClick={() => setShowAdminActions(!showAdminActions)}
                                className={`rounded cursor-pointer text-xs no-underline inline-block ${showAdminActions ? 'bg-[#007bff] text-white' : 'bg-[#6c757d] text-white'} px-3 py-2 transition-colors hover:bg-[#5a6268]`}
                            >
                                {showAdminActions ? 'Hide Admin Actions' : 'Show Admin Actions'}
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="!bg-white !rounded-lg !shadow-[0_2px_8px_rgba(0,0,0,0.1)] !overflow-hidden">
                    <div className="!bg-[#f8f9fa] !px-6 !py-6 !border-b !border-[#dee2e6] !flex !justify-between !items-start">
                        <div className="!flex-1">
                            <h1 className="!m-0 !mb-2 !text-[#333] !text-[28px] !font-bold !leading-[1.3]">{article?.title}</h1>
                            <div className="!flex !gap-3">
                                <span className="!bg-[#007bff] !text-white !px-2 !py-1 !rounded !text-xs !font-semibold !font-mono">ID: {article?.id}</span>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && (
                            <div className="!flex !gap-3 !ml-6">
                                {canEdit && (
                                    <Button
                                        onClick={handleEdit}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                                        title="Edit Article"
                                    >
                                        Edit Article
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white px-3 py-2 transition-colors hover:bg-[#c82333]"
                                        title="Delete Article"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="!p-[24px]">
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-[16px] !mb-[24px] !p-[16px] !bg-[#f8f9fa] !rounded-lg">
                            <div className="flex flex-col gap-[4px]">
                                <Label className="font-semibold text-[#495057] uppercase text-xs">Author:</Label>
                                <NavLink to={`/admin/users/${article?.author?.id}`}>
                                    {createdBy}
                                </NavLink>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                                <Label className="font-semibold text-[#495057] uppercase text-xs">Created:</Label>
                                <span>{formatDateTimeToMin(createdAt)}</span>
                            </div>
                            {showEdited && (
                                <>
                                    <div className="flex flex-col gap-[4px]">
                                        <Label className="font-semibold text-[#495057] uppercase text-xs">Last Editor:</Label>
                                        <NavLink to={`/admin/users/${article?.editor?.id}`}>
                                            {editedBy}
                                        </NavLink>
                                    </div>
                                    <div className="flex flex-col gap-[4px]">
                                        <Label className="font-semibold text-[#495057] uppercase text-xs">Last Updated:</Label>    
                                        <span>{formatDateTimeToMin(editedAt)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {article?.summary && (
                            <div className="!mb-[24px]">
                                <Label className="font-semibold text-[#495057] uppercase !mb-2">Summary:</Label>
                                <p className="!bg-[#fff3cd] !border !border-[#ffeaa7] !rounded-lg !p-[16px] !text-[#856404]">{article.summary}</p>
                            </div>
                        )}

                        <div className="!mb-[24px]">
                            <Label className="font-semibold text-[#495057] uppercase !mb-2">Content:</Label>
                            <div className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-[16px]">
                                {article?.content}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="!mt-[24px] !p-[24px] !bg-[#f8f9fa] !rounded-lg">
                            <div className="!mb-[20px] !pb-[12px] !border-b !border-[#dee2e6]">
                                <h3 className="!m-0 !text-[#333] !text-[20px] !font-semibold !leading-[1.3]">Comments ({comments.length})</h3>
                            </div>
                            
                            {commentsLoading ? (
                                <div className="!flex !items-center !justify-center !p-[40px] !text-[#6c757d]">
                                    <div className="!w-10 !h-10 !border-4 !border-[#f3f3f3] !border-t-white !rounded-full animate-spin !mb-4"></div>
                                    <p>Loading comments...</p>
                                </div>
                            ) : commentsError ? (
                                <div className="!bg-[#fff3cd] !border !border-[#ffeaa7] !rounded-lg !p-[16px] !text-[#856404]">
                                    <strong>Error loading comments:</strong> {commentsError}
                                    <Button 
                                        onClick={() => article?.id && loadComments(article.id)}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white px-3 py-2 transition-colors hover:bg-[#5a6268]"
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="!text-[#6c757d] !text-sm !mb-4">
                                    <p>No comments yet for this article.</p>
                                </div>
                            ) : (
                                <div className="!mt-[16px]">
                                    {comments.map((comment) => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                            variant="card"
                                            showActions={true}
                                            onEdit={() => handleCommentEdit(comment)}
                                            onView={() => handleCommentView(comment)}
                                            onDelete={() => handleCommentDelete(comment)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-5 !mb-4 !shadow-[0_2px_4px_rgba(0,0,0,0.1)] !transition-shadow !duration-200 hover:!shadow-[0_4px_8px_rgba(0,0,0,0.15)]">
            <div className="!flex !justify-between !items-start !mb-3">
                <h3 className="!m-0 !text-[#333] !text-lg !font-semibold !flex-1">{article?.title}</h3>
                <span className="!font-mono !text-xs !text-[#6c757d] !bg-[#f8f9fa] !px-1.5 !py-0.5 !rounded !ml-3">#{article?.id?.substring(0, 8)}</span>
            </div>

            <div className="!mb-1">
                <div className="!mb-1">
                    <span>By </span>
                    <NavLink to={`/users/${article?.author?.id}`} className="!text-[#007bff] !no-underline hover:!underline">
                        {createdBy}
                    </NavLink>
                    <span> on {formatDateTimeToMin(createdAt)}</span>
                </div>
                {showEdited && (
                    <div className="!mb-1">
                        <span>Edited by </span>
                        <NavLink to={`/users/${article?.editor?.id}`} className="!text-[#007bff] !no-underline hover:!underline">
                            {editedBy}
                        </NavLink>
                        <span> on {formatDateTimeToMin(editedAt)}</span>
                    </div>
                )}
            </div>

            {article?.summary && (
                <div className="!text-sm !text-[#6c757d]">
                    {article.summary.length > 120 
                        ? article.summary.substring(0, 120) + '...' 
                        : article.summary}
                </div>
            )}

            {showActions && (
                <div className="!flex !gap-3 !mt-3">
                    <Button
                        onClick={onView}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white px-3 py-2 transition-colors hover:bg-[#5a6268]"
                        title="View Article"
                    >
                        View
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={handleEdit}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                            title="Edit Article"
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white px-3 py-2 transition-colors hover:bg-[#c82333]"
                            title="Delete Article"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default AdminArticleItem; 
