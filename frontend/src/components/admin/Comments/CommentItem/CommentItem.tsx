import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { Comment, Article } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteComment, fetchAllComments, fetchCommentsByArticleId } from '../../../../api/CommentApi';
import { fetchArticleById } from '../../../../api/ArticlesApi';

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
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-white rounded-full animate-spin mb-4"></div>
                    <p>Loading comment...</p>
                </div>
            </div>
        );
    }

    // Error state for route-based usage
    if (useRouteParams && error) {
        return (
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <h2>Error Loading Comment</h2>
                    <p>{error}</p>
                    <Button 
                        onClick={() => navigate('/admin/comments')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
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
            <div className="flex justify-center align-center min-h-[400px] !p-[40px]">
                <div className="text-center bg-white rounded-lg !p-[40px] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border border-[#dee2e6]">
                    <h2>Comment Not Found</h2>
                    <p>The requested comment could not be found.</p>
                    <Button 
                        onClick={() => navigate('/admin/comments')}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
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
            <div className="!p-[20px] !max-w-[1200px] !mx-auto">
                {useRouteParams && (
                    <div className="!mb-[20px] flex justify-between items-center gap-[16px]">
                        <div className="flex items-center gap-[12px]">
                            <Button 
                                onClick={() => navigate('/admin/comments')}
                                className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white px-3 py-2 transition-colors hover:bg-[#5a6268]"
                            >
                                ← Back to Comments
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
                            <h1 className="!m-0 !mb-2 !text-[#333] !text-[28px] !font-bold !leading-[1.3]">Comment Details</h1>
                            <div className="!flex !gap-3">
                                <span className="!bg-[#007bff] !text-white !px-2 !py-1 !rounded !text-xs !font-semibold !font-mono">ID: {comment?.id}</span>
                            </div>
                        </div>
                        {(useRouteParams ? showAdminActions : showActions) && (
                            <div className="!flex !gap-3 !ml-6">
                                {canEdit && (
                                    <Button
                                        onClick={handleEdit}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                                        title="Edit Comment"
                                    >
                                        Edit Comment
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white px-3 py-2 transition-colors hover:bg-[#c82333]"
                                        title="Delete Comment"
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
                                <NavLink to={`/admin/users/${comment?.author?.id}`}>
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
                                        <NavLink to={`/admin/users/${comment?.editor?.id}`}>
                                            {editedBy}
                                        </NavLink>
                                    </div>
                                    <div className="flex flex-col gap-[4px]">
                                        <Label>Last Updated:</Label>
                                        <span>{formatDateTimeToMin(editedAt)}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex flex-col gap-[4px]">
                                <Label className="font-semibold text-[#495057] uppercase text-xs">Article:</Label>
                                <NavLink 
                                    to={`/admin/articles/${comment?.article?.id}`} 
                                >
                                    {comment?.article?.title || 'Loading...'}
                                </NavLink>
                            </div>
                        </div>

                        <div className="!mb-[24px]">
                            <Label className="font-semibold text-[#495057] uppercase !mb-2">Comment Content:</Label>
                            <div className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-[16px]">
                                <div 
                                    dangerouslySetInnerHTML={{ __html: comment?.content || '' }}
                                />
                            </div>
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
                <h3 className="!m-0 !text-[#333] !text-lg !font-semibold !flex-1">Comment</h3>
                <span className="!font-mono !text-xs !text-[#6c757d] !bg-[#f8f9fa] !px-1.5 !py-0.5 !rounded !ml-3">#{comment?.id?.substring(0, 8)}</span>
            </div>

            <div className="!mb-1">
                <div className="!mb-1">
                    <span>By </span>
                    <NavLink to={`/users/${comment?.author?.id}`} className="!text-[#007bff] !no-underline hover:!underline">
                        {createdBy}
                    </NavLink>
                    <span> on {formatDateTimeToMin(createdAt)}</span>
                </div>
                {showEdited && (
                    <div className="!mb-1">
                        <span>Edited by </span>
                        <NavLink to={`/users/${comment?.editor?.id}`} className="!text-[#007bff] !no-underline hover:!underline">
                            {editedBy}
                        </NavLink>
                        <span> on {formatDateTimeToMin(editedAt)}</span>
                    </div>
                )}
                <div className="!mb-1">
                    <span>On article: </span>
                    <NavLink to={`/articles/${comment?.article?.id}`} className="!text-[#007bff] !no-underline hover:!underline">
                        {comment?.article?.title || 'Loading...'}
                    </NavLink>
                </div>
            </div>

            <div className="!text-sm !text-[#6c757d]">
                <div 
                    dangerouslySetInnerHTML={{ 
                        __html: comment?.content && comment.content.length > 150 
                            ? comment.content.substring(0, 150) + '...'
                            : comment?.content || ''
                    }}
                />
            </div>

            {showActions && (
                <div className="admin-comment-card-actions">
                    <Button
                        onClick={onView}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white !px-[6px] !py-[12px] transition-colors hover:bg-[#5a6268]"
                        title="View Comment"
                    >
                        View
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={handleEdit}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white !px-[6px] !py-[12px] transition-colors hover:bg-[#0056b3]"
                            title="Edit Comment"
                        >
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="rounded cursor-pointer text-xs no-underline inline-block bg-[#dc3545] text-white !px-[6px] !py-[12px] transition-colors hover:bg-[#c82333]"
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
