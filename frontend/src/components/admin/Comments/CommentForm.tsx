import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createComment, editComment, fetchCommentById } from '../../../api/CommentApi';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { Comment, Article } from '../../../api/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// import { useCommentHandlers } from '../../../actions/admin/Comments/CommentsHandler';

import '../Articles/AdminArticles.css';
import './AdminComments.css';

interface CommentFormProps {
    isEdit?: boolean;
    commentId?: string;
    initialComment?: Partial<Comment>;
    onSubmit?: (comment: Comment) => void;
    onCancel?: () => void;
    preselectedArticleId?: string;
}

interface CommentFormData {
    content: string;
    articleId: string;
}

const commentFormSchema = yup.object({
    content: yup.string().required('Content is required'),
    articleId: yup.string().required('Article is required')
}).required();

type FormData = yup.InferType<typeof commentFormSchema>;

const CommentForm: React.FC<CommentFormProps> = ({
    isEdit = false,
    commentId,
    initialComment,
    onSubmit,
    onCancel,
    preselectedArticleId
}) => {
    const { id: routeId } = useParams<{ id: string }>();
    const finalId = commentId || routeId;
    
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const { token, currentUser } = useAuth();

    const { 
        register, 
        handleSubmit, 
        watch, 
        setValue, 
        formState: { errors } 
    } = useForm<FormData>({
        resolver: yupResolver(commentFormSchema),
        defaultValues: {
            content: initialComment?.content || '',
            articleId: preselectedArticleId || initialComment?.article?.id || ''
        }
    });

    const content = watch('content');
    const selectedArticleId = watch('articleId');

    useEffect(() => {
        loadArticles();
    }, []);

    useEffect(() => {
        if (isEdit && finalId && !initialComment) {
            loadComment();
        }
    }, [finalId, isEdit, initialComment]);

    useEffect(() => {
        // Track if form has been modified
        const hasChanges = content !== (initialComment?.content || '') ||
                          selectedArticleId !== (preselectedArticleId || initialComment?.article?.id || '');
        setIsDirty(hasChanges);
    }, [content, selectedArticleId, initialComment, preselectedArticleId]);

    const loadArticles = async (): Promise<void> => {
        try {
            const response = await fetchAllArticles({
                filters: {},
                sortCriteria: [{ field: 'title', direction: 'ASC' }],
                size: 1000,
                from: 0
            });
            
            if (Array.isArray(response)) {
                setArticles(response);
            } else {
                setArticles(response.articles || []);
            }
        } catch (err) {
            console.error('Failed to load articles:', err);
            setError('Failed to load articles. Please refresh and try again.');
        }
    };

    const loadComment = async (): Promise<void> => {
        if (!finalId) return;
        
        try {
            setLoading(true);
            setError(null);
            const comment = await fetchCommentById(finalId);
            setValue('content', comment.content);
            setValue('articleId', comment.article?.id || '');
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

    const handleFormSubmit = async (data: CommentFormData): Promise<void> => {
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let result: Comment;
            
            if (isEdit && finalId) {
                result = await editComment(data.articleId, finalId, data.content.trim(), token);
            } else {
                result = await createComment(data.articleId, token, data.content.trim());
            }

            setIsDirty(false);
            
            if (onSubmit) {
                onSubmit(result);
            } else {
                navigate('/admin/comments');
            }
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            setError(errorMessage);
            
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = (): void => {
        if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
            return;
        }
        
        if (onCancel) {
            onCancel();
        } else {
            navigate('/admin/comments');
        }
    };

    const selectedArticle = articles.find(a => a.id === selectedArticleId);

    if (loading && isEdit && !initialComment) {
        return (
            <div className="admin-form-loading">
                <div className="admin-loading-spinner"></div>
                <p>Loading comment...</p>
            </div>
        );
    }

    return (
        <div className="admin-comment-form-container">
            <div className="admin-form-header">
                <h2>{isEdit ? 'Edit Comment' : 'Create New Comment'}</h2>
            </div>

            {error && (
                <div className="admin-error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="admin-comment-form">
                {!isEdit && (
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="article" className="admin-form-label">
                                Select Article <span className="admin-required">*</span>
                            </label>
                            <select
                                id="article"
                                {...register("articleId")}
                                disabled={loading || !!preselectedArticleId}
                                className="admin-form-select"
                            >
                                <option value="">Select an article...</option>
                                {articles.map((article) => (
                                    <option key={article.id} value={article.id}>
                                        {article.title}
                                    </option>
                                ))}
                            </select>
                            <p className="admin-field-error">{errors.articleId?.message}</p>
                        </div>
                    </div>
                )}

                {selectedArticle && (
                    <div className="admin-form-row">
                        <div className="admin-selected-article">
                            <h4>Selected Article:</h4>
                            <div className="admin-article-preview">
                                <h5>{selectedArticle.title}</h5>
                                {selectedArticle.summary && (
                                    <p className="admin-article-summary">
                                        {selectedArticle.summary.length > 150 
                                            ? selectedArticle.summary.substring(0, 150) + '...'
                                            : selectedArticle.summary}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label htmlFor="content" className="admin-form-label">
                            Comment Content <span className="admin-required">*</span>
                        </label>
                        <textarea
                            id="content"
                            placeholder="Write your comment here..."
                            {...register("content")}
                            disabled={loading}
                            rows={8}
                            className="admin-form-textarea" 
                            maxLength={1000}
                        />
                        <div className="admin-char-count">
                            {content.length}/1000 characters
                        </div>
                        <p className="admin-field-error">{errors.content?.message}</p>
                    </div>
                </div>

                <div className="admin-form-actions">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="admin-btn admin-btn-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !content.trim() || (!selectedArticleId && !isEdit)}
                        className="admin-btn admin-btn-primary"
                    >
                        {loading ? (
                            <>
                                <span className="admin-loading-spinner-small"></span>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEdit ? 'Update Comment' : 'Create Comment'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CommentForm;
