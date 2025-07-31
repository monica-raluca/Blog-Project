import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { Article } from '../../../api/types';
import { useCommentHandlers } from '../../../actions/admin/Comments/CommentsHandler';

import './AdminArticles.css';

interface ArticleFormProps {
    isEdit?: boolean;
    articleId?: string;
    onSubmit?: (article: Article) => void;
    onCancel?: () => void;
    initialData?: Partial<Article>;
    showPreview?: boolean;
}

const ArticleForm: React.FC<ArticleFormProps> = ({
    isEdit = false,
    articleId,
    onSubmit,
    onCancel,
    initialData,
    showPreview = true
}) => {
    const { id: routeId } = useParams<{ id: string }>();
    const finalId = articleId || routeId;
    
    const [title, setTitle] = useState<string>(initialData?.title || '');
    const [content, setContent] = useState<string>(initialData?.content || '');
    const [summary, setSummary] = useState<string>(initialData?.summary || '');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
    const [showPreviewMode, setShowPreviewMode] = useState<boolean>(false);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const { token, currentUser } = useAuth();

    useEffect(() => {
        if (isEdit && finalId && !initialData) {
            loadArticle();
        }
    }, [finalId, isEdit, initialData]);

    useEffect(() => {
        // Track if form has been modified
        const hasChanges = title !== (initialData?.title || '') ||
                          content !== (initialData?.content || '') ||
                          summary !== (initialData?.summary || '');
        setIsDirty(hasChanges);
    }, [title, content, summary, initialData]);

    const loadArticle = async (): Promise<void> => {
        if (!finalId) return;
        
        try {
            setLoading(true);
            setError(null);
            const article = await fetchArticleById(finalId);
            setTitle(article.title);
            setContent(article.content);
            setSummary(article.summary || '');
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

    const validateForm = (): boolean => {
        const errors: {[key: string]: string} = {};
        
        if (!title.trim()) {
            errors.title = 'Title is required';
        } else if (title.trim().length < 3) {
            errors.title = 'Title must be at least 3 characters long';
        } else if (title.trim().length > 200) {
            errors.title = 'Title must be less than 200 characters';
        }
        
        if (!content.trim()) {
            errors.content = 'Content is required';
        } else if (content.trim().length < 10) {
            errors.content = 'Content must be at least 10 characters long';
        }
        
        if (summary && summary.length > 500) {
            errors.summary = 'Summary must be less than 500 characters';
        }
        
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);

        const articleData: Article = { 
            title: title.trim(), 
            content: content.trim(),
            summary: summary.trim() || undefined
        };

        try {
            let result: Article;
            
            if (isEdit && finalId) {
                result = await updateArticle(finalId, articleData, token);
            } else {
                result = await createArticle(articleData, token);
            }

            setIsDirty(false);
            
            if (onSubmit) {
                onSubmit(result);
            } else {
                navigate('/articles');
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
            navigate('/articles');
        }
    };

    const autoGenerateSummary = (): void => {
        if (content.trim()) {
            const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
            const summaryText = sentences.slice(0, 2).join('. ').trim();
            setSummary(summaryText.length > 200 ? summaryText.substring(0, 200) + '...' : summaryText);
        }
    };

    if (loading && isEdit && !initialData) {
        return (
            <div className="admin-form-loading">
                <div className="admin-loading-spinner"></div>
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <div className="admin-article-form-container">
            <div className="admin-form-header">
                <h2>{isEdit ? 'Edit Article' : 'Create New Article'}</h2>
                {showPreview && (
                    <div className="admin-form-toggle">
                        <button
                            type="button"
                            onClick={() => setShowPreviewMode(!showPreviewMode)}
                            className="admin-btn admin-btn-secondary"
                        >
                            {showPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="admin-error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {showPreviewMode ? (
                <div className="admin-article-preview">
                    <div className="admin-preview-header">
                        <h3>Article Preview</h3>
                    </div>
                    <div className="admin-preview-content">
                        <h1 className="admin-preview-title">{title || 'Untitled Article'}</h1>
                        {summary && (
                            <div className="admin-preview-summary">
                                <strong>Summary:</strong> {summary}
                            </div>
                        )}
                        <div className="admin-preview-body">
                            {content || 'No content yet...'}
                        </div>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="admin-article-form">
                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="title" className="admin-form-label">
                                Article Title <span className="admin-required">*</span>
                            </label>
                            <input
                                id="title"
                                type="text"
                                placeholder="Enter a compelling title for your article"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                disabled={loading}
                                className={`admin-form-input ${validationErrors.title ? 'admin-input-error' : ''}`}
                                maxLength={200}
                            />
                            {validationErrors.title && (
                                <span className="admin-error-text">{validationErrors.title}</span>
                            )}
                            <div className="admin-char-count">
                                {title.length}/200 characters
                            </div>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="summary" className="admin-form-label">
                                Article Summary
                                <button
                                    type="button"
                                    onClick={autoGenerateSummary}
                                    className="admin-btn admin-btn-sm admin-btn-secondary admin-auto-generate"
                                    disabled={!content.trim()}
                                >
                                    Auto-generate
                                </button>
                            </label>
                            <textarea
                                id="summary"
                                placeholder="Brief summary of the article (optional, but recommended for SEO)"
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                disabled={loading}
                                rows={3}
                                className={`admin-form-textarea ${validationErrors.summary ? 'admin-input-error' : ''}`}
                                maxLength={500}
                            />
                            {validationErrors.summary && (
                                <span className="admin-error-text">{validationErrors.summary}</span>
                            )}
                            <div className="admin-char-count">
                                {summary.length}/500 characters
                            </div>
                        </div>
                    </div>

                    <div className="admin-form-row">
                        <div className="admin-form-group">
                            <label htmlFor="content" className="admin-form-label">
                                Article Content <span className="admin-required">*</span>
                            </label>
                            <textarea
                                id="content"
                                placeholder="Write your article content here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                disabled={loading}
                                rows={15}
                                className={`admin-form-textarea ${validationErrors.content ? 'admin-input-error' : ''}`}
                            />
                            {validationErrors.content && (
                                <span className="admin-error-text">{validationErrors.content}</span>
                            )}
                            <div className="admin-char-count">
                                {content.length} characters
                            </div>
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
                            disabled={loading || !title.trim() || !content.trim()}
                            className="admin-btn admin-btn-primary"
                        >
                            {loading ? (
                                <>
                                    <span className="admin-loading-spinner-small"></span>
                                    {isEdit ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                isEdit ? 'Update Article' : 'Create Article'
                            )}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ArticleForm; 