import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createComment, editComment, fetchCommentById } from '../../../api/CommentApi';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { Comment, Article } from '../../../api/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import SimpleLexicalEditor, { SimpleLexicalEditorRef } from '../../ui/SimpleLexicalEditor';

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
    const editorRef = React.useRef<SimpleLexicalEditorRef>(null);
    
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
            <div className="flex justify-center items-center min-h-[400px] !p-[40px]">
                <div className="w-10 h-10 border-4 border-[#f3f3f3] border-t-white rounded-full animate-spin mb-4"></div>
                <p>Loading comment...</p>
            </div>
        );
    }

    // Create article options for combobox
    const articleOptions: ComboboxOption[] = [
        { value: "", label: "Select an article..." },
        ...articles.map(article => ({
            value: article.id!,
            label: article.title,
        }))
    ];

    return (
        <div className="!p-[20px] !max-w-[1200px] !mx-auto">
            <div className="!mb-[20px] flex justify-between items-center gap-[16px]">
                <h2>{isEdit ? 'Edit Comment' : 'Create New Comment'}</h2>
            </div>

            {error && (
                <div className="!bg-[#f8f9fa] !border !border-[#dee2e6] !rounded-lg !p-[16px] !mb-[24px] !text-red-600">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="!bg-white !border !border-[#dee2e6] !rounded-lg !p-[24px]">
                {!isEdit && (
                    <div className="!mb-[24px]">
                        <div className="!mb-[16px]">
                            <Label htmlFor="article" className="!font-semibold !text-[#495057] !uppercase !text-xs !mb-2">
                                Select Article <span className="admin-required">*</span>
                            </Label>
                            <Combobox
                                options={articleOptions}
                                value={selectedArticleId}
                                onValueChange={(value) => setValue("articleId", value)}
                                placeholder="Select an article..."
                                searchPlaceholder="Search articles..."
                                className="!w-full !border !border-[#dee2e6] !rounded-lg !p-[8px] !text-sm"
                                disabled={loading || !!preselectedArticleId}
                            />
                            <p className="!text-xs !text-[#dc3545] !mt-1">{errors.articleId?.message}</p>
                        </div>
                    </div>
                )}

                {selectedArticle && (
                    <div className="!mb-[24px]">
                        <div className="!mb-[16px]">
                            <h4 className="!font-semibold !text-[#495057] !uppercase !text-xs !mb-2">Selected Article:</h4>
                            <div className="!bg-[#f8f9fa] !border !border-[#dee2e6] !rounded-lg !p-[16px]">
                                <h5 className="!text-[#333] !text-lg !font-semibold !mb-2">{selectedArticle.title}</h5>
                                {selectedArticle.summary && (
                                    <p className="!text-sm !text-[#6c757d]">
                                        {selectedArticle.summary.length > 150 
                                            ? selectedArticle.summary.substring(0, 150) + '...'
                                            : selectedArticle.summary}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="!mb-[24px]">
                    <div className="!mb-[16px]">
                        <Label htmlFor="content" className="!font-semibold !text-[#495057] !uppercase !text-xs !mb-2">
                            Comment Content <span className="!text-[#dc3545] !ml-1">*</span>
                        </Label>
                        <SimpleLexicalEditor
                            ref={editorRef}
                            initialValue={content}
                            onChange={(newContent) => setValue("content", newContent)}
                            placeholder="Write your comment here..."
                            readOnly={loading}
                            minHeight="200px"
                            className="!border-[#dee2e6]"
                        />
                        <div className="!text-xs !text-[#6c757d] !mt-1">
                            {content.length}/1000 characters
                        </div>
                        <p className="!text-xs !text-[#dc3545] !mt-1">{errors.content?.message}</p>
                    </div>
                </div>

                <div className="!flex !gap-3">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#6c757d] text-white px-3 py-2 transition-colors hover:bg-[#5a6268]"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !content.trim() || (!selectedArticleId && !isEdit)}
                        className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                    >
                        {loading ? (
                            <>
                                <span className="w-4 h-4 border-2 border-[#f3f3f3] border-t-white rounded-full animate-spin"></span>
                                {isEdit ? 'Updating...' : 'Creating...'}
                            </>
                        ) : (
                            isEdit ? 'Update Comment' : 'Create Comment'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default CommentForm;
