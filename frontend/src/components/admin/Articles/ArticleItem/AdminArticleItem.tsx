import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { Article, Comment } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteArticle, fetchArticleById, fetchAllArticles } from '../../../../api/ArticlesApi';
import { cleanupCategory } from '../../../../utils/categoryUtils';
import { fetchCommentsByArticleId } from '../../../../api/CommentApi';
import CommentItem from '../../Comments/CommentItem/CommentItem';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCommentHandlers } from '../../../../handlers/CommentsHandler';
import LexicalContentRenderer from '../../../ui/LexicalContentRenderer';
import MagicalAvatar from '../../../ui/MagicalAvatar';
import ArticleCover from '../../../ui/ArticleCover';
import { extractSmartSummary } from '../../../../utils/contentUtils';
import { Tag, User, Calendar, Eye, Edit, Trash2, MessageSquare, ArrowLeft } from 'lucide-react';

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

    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
    const [commentsError, setCommentsError] = useState<string | null>(null);

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
            navigate('/admin/articles');
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
            const commentsData = await fetchCommentsByArticleId(articleId);
            setComments(commentsData);
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to load comments';
            setCommentsError(errorMessage);
            console.error('Comments loading error:', err);
        } finally {
            setCommentsLoading(false);
        }
    };

    const formatDateTimeToMin = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else if (useRouteParams) {
            navigate(`/admin/articles/${article?.id}/edit`);
        }
    };

    const handleView = () => {
        if (onView) {
            onView();
        } else if (useRouteParams) {
            navigate(`/public/articles/${article?.id}`);
        }
    };

    const handleDelete = async () => {
        if (!article) return;

        const confirmDelete = window.confirm(`Are you sure you want to delete the article "${article.title}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            
            // Capture the category for cleanup
            const categoryToClean = article.category || 'General';
            
            await deleteArticle(article.id, token!);
            
            // Fetch all articles and clean up category if needed
            const allArticles = await fetchAllArticles({
                filters: {},
                sortCriteria: [],
                size: 1000,
                from: 0
            });
            
            const articlesArray = Array.isArray(allArticles) ? allArticles : allArticles.articles || [];
            cleanupCategory(categoryToClean, articlesArray);
            
            if (onDelete) {
                onDelete();
            } else if (useRouteParams) {
                navigate('/admin/articles');
            }
        } catch (error) {
            const message = (error as Error).message || 'An error occurred';
            alert(`Failed to delete article: ${message}`);
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading article...</div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-600">{error || 'Article not found'}</div>
            </div>
        );
    }

    const canEdit = (
        hasRole("ADMIN") ||
        (hasRole("AUTHOR") && article.author?.username === currentUser)
    );
    const canDelete = (
        hasRole("ADMIN") ||
        (hasRole("AUTHOR") && article.author?.username === currentUser)
    );

    if (!article) return null;

    if (variant === 'detailed') {
        const formatDateTimeToMin = (dateStr: string): string => {
            const d = new Date(dateStr);
            return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
        };

        const createdBy = article.author?.username || 'Unknown';
        const createdAt = article.createdDate || article.createdAt || '';
        const editedBy = article.editor?.username || createdBy;
        const editedAt = article.updatedDate || article.updatedAt || createdAt;

        const showEdited = (
            createdBy !== editedBy ||
            formatDateTimeToMin(createdAt) !== formatDateTimeToMin(editedAt)
        );

        return (
            <div className="min-h-screen bg-gray-50">
                                {/* Header */}
                {useRouteParams && (
                    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-4">
                                <div className="flex items-center gap-3">
                            <Button 
                                onClick={() => navigate('/admin/articles')}
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                            >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Articles
                            </Button>
                        </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Main Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        
                        {/* Article Cover */}
                        <div className="relative h-64 w-full bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
                            <ArticleCover 
                                article={article}
                                size="lg"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                            <div className="absolute bottom-6 left-8 right-8">
                                <div className="mb-3">
                                    <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm border-white/30">
                                        <Tag className="w-3 h-3 mr-1" />
                                        {article.category || 'General'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 leading-tight drop-shadow-2xl">
                                    {article.title}
                                </h1>
                            </div>
                        </div>

                        {/* Author/Editor Info */}
                        <div className="p-8 border-b border-gray-200">
                            <div className="flex flex-col gap-4">
                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div 
                                        className="cursor-pointer"
                                        onClick={() => navigate(`/admin/users/${article.author?.id}`)}
                                    >
                                        <MagicalAvatar 
                                            user={article.author}
                                            size="md"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <User className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-500">Author</span>
                                        </div>
                                        <p 
                                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                            onClick={() => navigate(`/admin/users/${article.author?.id}`)}
                                        >
                                            {article.author?.firstName} {article.author?.lastName}
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            Created on {formatDateTimeToMin(createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* Editor Info */}
                                {showEdited && (
                                    <div className="flex items-center gap-4 bg-gray-50 rounded-lg p-4">
                                        <div 
                                            className="cursor-pointer"
                                            onClick={() => navigate(`/admin/users/${article.editor?.id}`)}
                                        >
                                            <MagicalAvatar 
                                                user={article.editor}
                                                size="md"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Edit className="w-4 h-4 text-orange-500" />
                                                <span className="text-sm text-orange-600 font-medium">Editor</span>
                                            </div>
                                            <p 
                                                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                                onClick={() => navigate(`/admin/users/${article.editor?.id}`)}
                                            >
                                                {editedBy}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar className="w-4 h-4" />
                                                Last edited on {formatDateTimeToMin(editedAt)}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-8">
                            <div className="prose prose-lg max-w-none">
                                <LexicalContentRenderer 
                                    content={article.content}
                                    className="border-none bg-transparent"
                                />
                            </div>
                        </div>

                                                {/* Admin Actions */}
                        {showActions && (
                            <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-medium text-gray-900">Admin Actions</h3>
                                    <div className="flex gap-3">
                                {canEdit && (
                                    <Button
                                        onClick={handleEdit}
                                                size="sm"
                                                className="flex items-center gap-2"
                                    >
                                                <Edit className="w-4 h-4" />
                                        Edit Article
                                    </Button>
                                )}
                                {canDelete && (
                                    <Button
                                        onClick={handleDelete}
                                        disabled={isDeleting}
                                                variant="destructive"
                                                size="sm"
                                                className="flex items-center gap-2"
                                    >
                                                <Trash2 className="w-4 h-4" />
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </Button>
                                )}
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>

                        {/* Comments Section */}
                    {variant === 'detailed' && (
                        <div className="mt-8 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-200 bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-gray-600" />
                                    <h3 className="text-xl font-semibold text-gray-900">Comments ({comments.length})</h3>
                                </div>
                            </div>
                            
                            <div className="p-8">
                            {commentsLoading ? (
                                    <div className="text-center py-8 text-gray-500">Loading comments...</div>
                            ) : commentsError ? (
                                    <div className="text-center py-8 text-red-600">Failed to load comments: {commentsError}</div>
                            ) : comments.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No comments yet.</div>
                            ) : (
                                    <div className="space-y-6">
                                        {comments.map(comment => (
                                        <CommentItem
                                            key={comment.id}
                                            comment={comment}
                                                onEdit={handleCommentEdit}
                                                onDelete={handleCommentDelete}
                                                onView={handleCommentView}
                                                variant="detailed"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    )}
                </div>
            </div>
        );
    }

    // Card variant for lists
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="p-6">
                <div className="flex items-start gap-4">
                    <ArticleCover 
                        article={article}
                        size="md"
                    />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                            {article?.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-3">
                            <Badge variant="secondary" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {article?.category || 'General'}
                            </Badge>
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                                ID: {article?.id}
                            </span>
            </div>

                        <div className="flex items-center gap-3 mb-3">
                            <div 
                                className="cursor-pointer"
                                onClick={() => navigate(`/admin/users/${article?.author?.id}`)}
                            >
                                <MagicalAvatar 
                                    user={article?.author}
                                    size="sm"
                                />
                </div>
                            <div className="flex-1 min-w-0">
                                <p 
                                    className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors text-sm"
                                    onClick={() => navigate(`/admin/users/${article?.author?.id}`)}
                                >
                                    {article?.author?.firstName} {article?.author?.lastName}
                                </p>
                                <p className="text-gray-600 text-xs">
                                    Created: {formatDateTimeToMin(article?.createdDate || article?.createdAt || '')}
                                </p>
                    </div>
            </div>

                        <div className="text-gray-700 text-sm line-clamp-2 mb-4">
                    <LexicalContentRenderer 
                                content={extractSmartSummary(article?.content || '')}
                                className="bg-transparent border-none text-inherit"
                    />
                </div>

            {showActions && (
                            <div className="flex gap-2">
                    <Button
                        onClick={onView}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                    >
                                    <Eye className="w-3 h-3" />
                        View
                    </Button>
                    {canEdit && (
                        <Button
                            onClick={handleEdit}
                                        size="sm"
                                        className="flex items-center gap-1"
                        >
                                        <Edit className="w-3 h-3" />
                            Edit
                        </Button>
                    )}
                    {canDelete && (
                        <Button
                            onClick={handleDelete}
                            disabled={isDeleting}
                                        variant="destructive"
                                        size="sm"
                                        className="flex items-center gap-1"
                        >
                                        <Trash2 className="w-3 h-3" />
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    )}
                </div>
            )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminArticleItem; 