import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { Article } from '../../../api/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '../../../../components/ui/button';
import * as yup from 'yup';

import './AdminArticles.css';

interface ArticleFormProps {
    isEdit?: boolean;
    id?: string;
    onSubmit?: (article: Article) => void;
    onCancel?: () => void;
    initialData?: Partial<Article>;
}

interface ArticleFormData {
    title: string;
    content: string;
}

const articleFormSchema = yup.object({
    title: yup.string().required('Title is required'),
    content: yup.string().required('Content is required')
}).required();

type FormData = yup.InferType<typeof articleFormSchema>;

const AdminArticleForm: React.FC<ArticleFormProps> = ({
    isEdit = false,
    id,
    onSubmit,
    onCancel,
    initialData
}) => {
    const { id: routeId } = useParams<{ id: string }>();
    const finalId = id || routeId;
    
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isDirty, setIsDirty] = useState<boolean>(false);
    
    const navigate = useNavigate();
    const { token } = useAuth();

    const { 
        register, 
        handleSubmit, 
        watch, 
        setValue, 
        formState: { errors } 
    } = useForm<FormData>({
        resolver: yupResolver(articleFormSchema),
        defaultValues: {
            title: initialData?.title || '',
            content: initialData?.content || ''
        }
    });

    const title = watch('title');
    const content = watch('content');

    useEffect(() => {
        if (isEdit && finalId && !initialData) {
            loadArticle();
        }
    }, [finalId, isEdit, initialData]);

    useEffect(() => {
        // Track if form has been modified
        const hasChanges = title !== (initialData?.title || '') ||
                          content !== (initialData?.content || '');
        setIsDirty(hasChanges);
    }, [title, content, initialData]);

    const loadArticle = async (): Promise<void> => {
        if (!finalId) return;
        
        try {
            setLoading(true);
            setError(null);
            fetchArticleById(finalId).then(article => {
                setValue('title', article.title);
                setValue('content', article.content);
            });
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

    const handleFormSubmit = async (data: ArticleFormData): Promise<void> => {
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);

        const articleData: Article = { 
            title: data.title.trim(), 
            content: data.content.trim()
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
                navigate('/admin/articles');
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
            navigate('/admin/articles');
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
            </div>

            {error && (
                <div className="admin-error-banner">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="admin-article-form">
                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label htmlFor="title" className="admin-form-label">
                            Article Title <span className="admin-required">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Enter a compelling title for your article"
                            {...register("title")}
                            disabled={loading}
                            className="admin-form-input"
                        />
                        <div className="admin-char-count">
                            {title.length} characters
                        </div>
                        <p className="admin-field-error">{errors.title?.message}</p>
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
                            {...register("content")}
                            disabled={loading}
                            rows={15}
                            className="admin-form-textarea"
                        />
                        <div className="admin-char-count">
                            {content.length} characters
                        </div>
                        <p className="admin-field-error">{errors.content?.message}</p>
                    </div>
                </div>

                <div className="admin-form-actions">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        variant="cloud"
                        size="cloud"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !title.trim() || !content.trim()}
                        variant="cloud"
                        size="cloud"
                    >
                        {loading ? (
                            <>
                                <span className="admin-loading-spinner-small"></span>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEdit ? 'Update Article' : 'Create Article'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AdminArticleForm; 