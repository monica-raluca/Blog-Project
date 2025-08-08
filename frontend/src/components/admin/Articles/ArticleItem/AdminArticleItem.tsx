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
            <div className="admin-page-loading">
                <div className="admin-loading-container">
                    <div className="admin-loading-spinner"></div>
                    <p>Loading article...</p>
                </div>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>Error Loading Article</h2>
                    <p>{error}</p>
                    <Button 
                        onClick={() => navigate('/articles')}
                        className="admin-btn admin-btn-primary"
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
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>Article Not Found</h2>
                    <p>The requested article could not be found.</p>
                    <Button 
                        onClick={() => navigate('/articles')}
                        className="admin-btn admin-btn-primary"
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
            <div className="admin-article-detail-page">
                {useRouteParams && (
                    <div className="admin-page-header">
                        <div className="admin-page-header-left">
                            <Button 
                                onClick={() => navigate('/admin/articles')}
                                className="admin-btn admin-btn-secondary admin-back-btn"
                            >
                                ← Back to Articles
                            </Button>
                        </div>
                        <div className="admin-page-header-right">
                            <Button
                                onClick={() => setShowAdminActions(!showAdminActions)}
                                className={`admin-btn ${showAdminActions ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                            >
                                {showAdminActions ? 'Hide Admin Actions' : 'Show Admin Actions'}
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="admin-article-detailed">
                    <div className="admin-article-header-detailed">
                        <div className="admin-article-title-section">
                            <h1 className="admin-article-title-large">{article?.title}</h1>
                            <div className="admin-article-meta-detailed">
                                <span className="admin-article-id-badge">ID: {article?.id}</span>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && (
                            <div className="admin-article-actions-detailed">
                                {canEdit && (
                                    <Button
                                        onClick={handleEdit}
                                        className="admin-btn admin-btn-primary"
                                        title="Edit Article"
                                    >
                                        Edit Article
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="admin-btn admin-btn-danger"
                                        title="Delete Article"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="admin-article-content-detailed">
                        <div className="admin-article-info-grid">
                            <div className="admin-info-item">
                                <Label>Author:</Label>
                                <NavLink to={`/users/${article?.author?.id}`} className="admin-author-link">
                                    {createdBy}
                                </NavLink>
                            </div>
                            <div className="admin-info-item">
                                <Label>Created:</Label>
                                <span>{formatDateTimeToMin(createdAt)}</span>
                            </div>
                            {showEdited && (
                                <>
                                    <div className="admin-info-item">
                                        <Label>Last Editor:</Label>
                                        <NavLink to={`/users/${article?.editor?.id}`} className="admin-author-link">
                                            {editedBy}
                                        </NavLink>
                                    </div>
                                    <div className="admin-info-item">
                                        <Label>Last Updated:</Label>    
                                        <span>{formatDateTimeToMin(editedAt)}</span>
                                    </div>
                                </>
                            )}
                        </div>

                        {article?.summary && (
                            <div className="admin-article-summary-section">
                                <Label>Summary:</Label>
                                <p className="admin-article-summary">{article.summary}</p>
                            </div>
                        )}

                        <div className="admin-article-content-section">
                            <Label>Content:</Label>
                            <div className="admin-article-content-display">
                                {article?.content}
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="admin-article-comments-section">
                            <div className="admin-comments-header">
                                <h3>Comments ({comments.length})</h3>
                            </div>
                            
                            {commentsLoading ? (
                                <div className="admin-comments-loading">
                                    <div className="admin-loading-spinner"></div>
                                    <p>Loading comments...</p>
                                </div>
                            ) : commentsError ? (
                                <div className="admin-error-banner">
                                    <strong>Error loading comments:</strong> {commentsError}
                                    <Button 
                                        onClick={() => article?.id && loadComments(article.id)}
                                        className="admin-btn admin-btn-sm admin-btn-secondary"
                                        style={{ marginLeft: '10px' }}
                                    >
                                        Retry
                                    </Button>
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="admin-no-comments">
                                    <p>No comments yet for this article.</p>
                                </div>
                            ) : (
                                <div className="admin-comments-list">
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
        <div className="admin-article-card">
            <div className="admin-article-card-header">
                <h3 className="admin-article-card-title">{article?.title}</h3>
                <span className="admin-article-id-small">#{article?.id?.substring(0, 8)}</span>
            </div>

            <div className="admin-article-card-meta">
                <div className="admin-article-author-info">
                    <span>By </span>
                    <NavLink to={`/users/${article?.author?.id}`} className="admin-author-link">
                        {createdBy}
                    </NavLink>
                    <span> on {formatDateTimeToMin(createdAt)}</span>
                </div>
                {showEdited && (
                    <div className="admin-article-edit-info">
                        <span>Edited by </span>
                        <NavLink to={`/users/${article?.editor?.id}`} className="admin-author-link">
                            {editedBy}
                        </NavLink>
                        <span> on {formatDateTimeToMin(editedAt)}</span>
                    </div>
                )}
            </div>

            {article?.summary && (
                <div className="admin-article-card-summary">
                    {article.summary.length > 120 
                        ? article.summary.substring(0, 120) + '...' 
                        : article.summary}
                </div>
            )}

            {showActions && (
                <div className="admin-article-card-actions">
                    <Button
                        onClick={onView}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="View Article"
                    >
                        View
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={handleEdit}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                            title="Edit Article"
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="admin-btn admin-btn-sm admin-btn-danger"
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
