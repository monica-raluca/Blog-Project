import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { Comment, Article } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteComment, fetchAllComments, fetchCommentsByArticleId } from '../../../../api/CommentApi';
import { fetchArticleById } from '../../../../api/ArticlesApi';

import '../../Articles/AdminArticles.css';
import '../AdminComments.css';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CommentItemProps {
    comment?: Comment;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    showActions?: boolean;
    variant?: 'card' | 'detailed';
    useRouteParams?: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
    comment: propComment,
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
    const [comment, setComment] = useState<Comment | null>(propComment || null);
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState<boolean>(useRouteParams && !propComment);
    const [error, setError] = useState<string | null>(null);
    const [showAdminActions, setShowAdminActions] = useState<boolean>(true);

    // Load comment from route params if needed
    useEffect(() => {
        if (useRouteParams && id && !propComment) {
            loadCommentFromRoute();
        } else if (propComment) {
            setComment(propComment);
            setLoading(false);
        }
    }, [id, propComment, useRouteParams]);

    // Load article details when comment is available
    useEffect(() => {
        if (comment?.article?.id && !article) {
            loadArticle();
        }
    }, [comment, article]);

    const loadCommentFromRoute = async (): Promise<void> => {
        if (!id) {
            navigate('/admin/comments');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // Since we don't have a direct API to fetch a single comment by ID,
            // we'll need to fetch all comments and find the one we want
            // This is not ideal but works for the admin interface
            const allComments = await fetchAllComments();
            const foundComment = allComments.find(c => c.id === id);
            
            if (foundComment) {
                setComment(foundComment);
            } else {
                setError('Comment not found');
            }
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

    const loadArticle = async (): Promise<void> => {
        if (!comment?.article?.id) return;

        try {
            const articleData = await fetchArticleById(comment.article.id);
            setArticle(articleData);
        } catch (err) {
            console.error('Failed to load article:', err);
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

    const handleDelete = async (): Promise<void> => {
        // If onDelete prop is provided, delegate to parent component
        if (onDelete) {
            console.log('onDelete IN COMMENT ITEM TSX');
            onDelete();
            return;
        }

        if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
            return;
        }

        if (!token || !comment?.id || !comment?.article?.id) return;

        console.log(token);
        console.log(comment?.id);
        console.log(comment?.article?.id);

        try {
            setIsDeleting(true);
            await deleteComment(comment.article?.id, comment.id, token);
            if (useRouteParams) {
                navigate('/admin/comments');
            }
        } catch (error) {
            console.error('Failed to delete comment:', error);
            alert('Failed to delete comment. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEdit = (): void => {
        if (onEdit) {
            onEdit();
        } else if (comment?.id) {
            navigate(`/admin/comments/${comment.id}/edit`);
        }
    };

    // Loading state for route-based usage
    if (useRouteParams && loading) {
        return (
            <div className="admin-page-loading">
                <div className="admin-loading-container">
                    <div className="admin-loading-spinner"></div>
                    <p>Loading comment...</p>
                </div>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>Error Loading Comment</h2>
                    <p>{error}</p>
                    <Button 
                        onClick={() => navigate('/admin/comments')}
                        className="admin-btn admin-btn-primary"
                    >
                        Back to Comments
                    </Button>
                </div>
            </div>
        );
    }

    // Not found state for route-based usage
    if (useRouteParams && !comment) {
        return (
            <div className="admin-page-error">
                <div className="admin-error-container">
                    <h2>Comment Not Found</h2>
                    <p>The requested comment could not be found.</p>
                    <Button 
                        onClick={() => navigate('/admin/comments')}
                        className="admin-btn admin-btn-primary"
                    >
                        Back to Comments
                    </Button>
                </div>
            </div>
        );
    }

    if (!comment) return null;

    const createdBy = comment?.author?.username || 'Unknown';
    const createdAt = comment?.dateCreated || comment?.createdAt || '';
    const editedBy = comment?.editor?.username || createdBy;
    const editedAt = comment?.dateEdited || createdAt;

    const showEdited = (
        createdBy !== editedBy ||
        formatDateTimeToMin(createdAt) !== formatDateTimeToMin(editedAt)
    );

    const canEdit = hasRole("ADMIN") || comment?.author?.username === currentUser;
    const canDelete = hasRole("ADMIN") || comment?.author?.username === currentUser;

    if (variant === 'detailed') {
        return (
            <div className="admin-comment-detail-page">
                {useRouteParams && (
                    <div className="admin-page-header">
                        <div className="admin-page-header-left">
                            <Button 
                                onClick={() => navigate('/admin/comments')}
                                className="admin-btn admin-btn-secondary admin-back-btn"
                            >
                                ← Back to Comments
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
                
                <div className="admin-comment-detailed">
                    <div className="admin-comment-header-detailed">
                        <div className="admin-comment-title-section">
                            <h1 className="admin-comment-title-large">Comment Details</h1>
                            <div className="admin-comment-meta-detailed">
                                <span className="admin-comment-id-badge">ID: {comment?.id}</span>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && (
                            <div className="admin-comment-actions-detailed">
                                {canEdit && (
                                    <Button
                                        onClick={handleEdit}
                                        className="admin-btn admin-btn-primary"
                                        title="Edit Comment"
                                    >
                                        Edit Comment
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="admin-btn admin-btn-danger"
                                        title="Delete Comment"
                                    >
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="admin-comment-content-detailed">
                        <div className="admin-comment-info-grid">
                            <div className="admin-info-item">
                                <Label>Author:</Label>
                                <NavLink to={`/users/${comment?.author?.id}`} className="admin-author-link">
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
                                        <NavLink to={`/users/${comment?.editor?.id}`} className="admin-author-link">
                                            {editedBy}
                                        </NavLink>
                                    </div>
                                    <div className="admin-info-item">
                                        <Label>Last Updated:</Label>
                                        <span>{formatDateTimeToMin(editedAt)}</span>
                                    </div>
                                </>
                            )}
                            <div className="admin-info-item">
                                <Label>Article:</Label>
                                <NavLink 
                                    to={`/articles/${comment?.article?.id}`} 
                                    className="admin-author-link"
                                >
                                    {comment?.article?.title || 'Loading...'}
                                </NavLink>
                            </div>
                        </div>

                        <div className="admin-comment-content-section">
                            <Label>Comment Content:</Label>
                            <div className="admin-comment-content-display">
                                {comment?.content}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Card variant (default)
    return (
        <div className="admin-comment-card">
            <div className="admin-comment-card-header">
                <h3 className="admin-comment-card-title">Comment</h3>
                <span className="admin-comment-id-small">#{comment?.id?.substring(0, 8)}</span>
            </div>

            <div className="admin-comment-card-meta">
                <div className="admin-comment-author-info">
                    <span>By </span>
                    <NavLink to={`/users/${comment?.author?.id}`} className="admin-author-link">
                        {createdBy}
                    </NavLink>
                    <span> on {formatDateTimeToMin(createdAt)}</span>
                </div>
                {showEdited && (
                    <div className="admin-comment-edit-info">
                        <span>Edited by </span>
                        <NavLink to={`/users/${comment?.editor?.id}`} className="admin-author-link">
                            {editedBy}
                        </NavLink>
                        <span> on {formatDateTimeToMin(editedAt)}</span>
                    </div>
                )}
                <div className="admin-comment-article-info">
                    <span>On article: </span>
                    <NavLink to={`/articles/${comment?.article?.id}`} className="admin-author-link">
                        {comment?.article?.title || 'Loading...'}
                    </NavLink>
                </div>
            </div>

            <div className="admin-comment-card-content">
                {comment?.content && comment.content.length > 150 
                    ? comment.content.substring(0, 150) + '...'
                    : comment?.content}
            </div>

            {showActions && (
                <div className="admin-comment-card-actions">
                    <Button
                        onClick={onView}
                        className="admin-btn admin-btn-sm admin-btn-secondary"
                        title="View Comment"
                    >
                        View
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={handleEdit}
                            className="admin-btn admin-btn-sm admin-btn-primary"
                            title="Edit Comment"
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="admin-btn admin-btn-sm admin-btn-danger"
                            title="Delete Comment"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CommentItem;
