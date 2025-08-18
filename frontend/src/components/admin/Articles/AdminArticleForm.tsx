import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { Article } from '../../../api/types';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import LexicalEditor, { LexicalEditorRef } from '../../ui/LexicalEditor';
import * as yup from 'yup';


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
    const markdownEditorRef = useRef<LexicalEditorRef>(null);
    
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

        // const finalMarkdownContent = markdownEditorRef.current?.getMarkdown() || data.content;
        const articleData: Article = { 
            title: data.title.trim(), 
            // content: finalMarkdownContent.trim()
            content: data.content.trim()
        };

        try {
            let result: Article;
            
            if (isEdit && finalId) {
                console.log(articleData);
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
            <div className="!flex !flex-col !items-center !justify-center !py-15 !px-5 !text-[#6c757d]">
                <div className="!w-10 !h-10 !border-4 !border-[#f3f3f3] !border-t-[#007bff] !rounded-full animate-spin !mb-4"></div>
                <p>Loading article...</p>
            </div>
        );
    }

    return (
        <div className="!bg-white !rounded-lg !shadow-[0_2px_8px_rgba(0,0,0,0.1)] !overflow-hidden">
            <div className="!bg-[#f8f9fa] !px-6 !py-5 !border-b !border-[#dee2e6] !flex !justify-between !items-center">
                <h2 className="!m-0 !text-[#333] !text-2xl !font-semibold">{isEdit ? 'Edit Article' : 'Create New Article'}</h2>
            </div>

            {error && (
                <div className="!bg-[#f8d7da] !text-[#721c24] !border !border-[#f5c6cb] !px-6 !py-3 !m-0 !rounded-none">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <form onSubmit={handleSubmit(handleFormSubmit)} className="!p-6">
                <div className="!mb-6">
                    <div className="!relative">
                        <label htmlFor="title" className="!flex !justify-between !items-center !mb-2 !font-semibold !text-[#495057] !text-sm">
                            Article Title <span className="!text-[#dc3545] !ml-1">*</span>
                        </label>
                        <input
                            id="title"
                            type="text"
                            placeholder="Enter a compelling title for your article"
                            {...register("title")}
                            disabled={loading}
                            className="!w-full !px-3 !py-3 !border !border-[#ced4da] !rounded-md !text-sm !transition-all !duration-200 !font-inherit resize-y focus:!border-[#007bff] focus:!shadow-[0_0_0_2px_rgba(0,123,255,0.25)] focus:!outline-none"
                        />
                        <div className="!text-xs !text-[#6c757d] !text-right !mt-1">
                            {title.length} characters
                        </div>
                        {errors.title?.message && (
                            <p className="!text-[#dc3545] !text-xs !mt-1 !block">{errors.title.message}</p>
                        )}
                    </div>
                </div>
                
                <div className="!mb-6">
                    <div className="!relative">
                        <label className="!flex !justify-between !items-center !mb-2 !font-semibold !text-[#495057] !text-sm">
                            Article Content <span className="!text-[#dc3545] !ml-1">*</span>
                        </label>
                        <LexicalEditor
                            ref={markdownEditorRef}
                            initialValue={content}
                            onChange={(newContent) => setValue("content", newContent)}
                            placeholder="Write your article content here... Use Markdown formatting for rich content!"
                            readOnly={loading}
                            minHeight="400px"
                            showToolbar={true}
                            className="!border-[#ced4da] focus-within:!border-[#007bff] focus-within:!shadow-[0_0_0_2px_rgba(0,123,255,0.25)]"
                        />
                        <div className="!text-xs !text-[#6c757d] !text-right !mt-1">
                            {content.length} characters
                        </div>
                        {errors.content?.message && (
                            <p className="!text-[#dc3545] !text-xs !mt-1 !block">{errors.content.message}</p>
                        )}
                    </div>
                </div>

                <div className="!flex !gap-3 !justify-end !mt-8 !pt-5 !border-t !border-[#dee2e6]">
                    <Button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        variant="outline"
                        className="!px-4 !py-2"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || !title.trim() || !content.trim()}
                        className="!px-4 !py-2"
                    >
                        {loading ? (
                            <>
                                <span className="!inline-block !w-4 !h-4 !border-2 !border-[#f3f3f3] !border-t-white !rounded-full animate-spin !mr-2"></span>
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