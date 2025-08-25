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
import ArticlePreview from './ArticlePreview';
import ArticleCoverUpload from '../../ui/ArticleCoverUpload';
import ImageCrop from '../../ui/ImageCrop';
import { Eye } from 'lucide-react';
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
    const [showPreview, setShowPreview] = useState<boolean>(false);
    const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
    
    // Cover image state for new articles
    const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
    const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
    
    // Crop-related state
    const [showCropModal, setShowCropModal] = useState<boolean>(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);
    
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
                setCurrentArticle(article); // Set current article for image upload
                
                // Set the JSON content in the editor after a small delay to ensure it's rendered
                setTimeout(() => {
                    try {
                        // Check if content is JSON (new format) or legacy format
                        const isJsonContent = (content: string): boolean => {
                            try {
                                JSON.parse(content);
                                return true;
                            } catch {
                                return false;
                            }
                        };

                        if (isJsonContent(article.content)) {
                            // New JSON format - use setEditorStateFromJson
                            markdownEditorRef.current?.setEditorStateFromJson(article.content);
                        } else {
                            // Legacy format - set as HTML/markdown
                            markdownEditorRef.current?.setHtml(article.content);
                        }
                    } catch (error) {
                        console.warn('Failed to set edit content:', error);
                        // Fallback to HTML setter
                        markdownEditorRef.current?.setHtml(article.content);
                    }
                }, 100);
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

    // Handle cover image selection for new articles
    const handleCoverImageSelect = (file: File) => {
        setSelectedCoverFile(file);
        
        // Check if it's a GIF - skip cropping for GIFs to preserve animation
        if (file.type === 'image/gif') {
            // For GIFs, create direct preview and skip cropping
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setCoverPreviewUrl(imageUrl);
            };
            reader.readAsDataURL(file);
        } else {
            // For other image types, show crop modal
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setOriginalImageUrl(imageUrl);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (blob: Blob) => {
        setCroppedBlob(blob);
        setShowCropModal(false);
        
        // Create preview URL from cropped blob
        const croppedUrl = URL.createObjectURL(blob);
        setCoverPreviewUrl(croppedUrl);
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setOriginalImageUrl(null);
        setSelectedCoverFile(null);
        setCroppedBlob(null);
        setCoverPreviewUrl(null);
    };

    const handleCoverImageRemove = () => {
        setSelectedCoverFile(null);
        setCoverPreviewUrl(null);
        setCroppedBlob(null);
        setOriginalImageUrl(null);
    };

    // Upload cover image after article creation
    const uploadCoverImage = async (articleId: string): Promise<void> => {
        if ((!croppedBlob && !selectedCoverFile) || !token) return;

        try {
            const formData = new FormData();
            
            // Use cropped blob for non-GIF images, original file for GIFs and when no crop was done
            if (croppedBlob && selectedCoverFile?.type !== 'image/gif') {
                const croppedFile = new File([croppedBlob], selectedCoverFile?.name || 'cropped-cover.jpg', {
                    type: 'image/jpeg'
                });
                formData.append('file', croppedFile);
            } else if (selectedCoverFile) {
                formData.append('file', selectedCoverFile);
            }

            const response = await fetch(`/api/articles/${articleId}/upload-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Cover upload failed: ${errorText}`);
            }

            const updatedArticle = await response.json();
            setCurrentArticle(updatedArticle);
            
            // Clear the selected file after successful upload
            setSelectedCoverFile(null);
            setCoverPreviewUrl(null);
            setCroppedBlob(null);
            setOriginalImageUrl(null);
        } catch (err) {
            console.error('Cover image upload failed:', err);
            // Note: We don't throw here to avoid breaking the article creation flow
        }
    };

    const handleFormSubmit = async (data: ArticleFormData): Promise<void> => {
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);

        const finalJsonContent = markdownEditorRef.current?.getEditorStateJson() || data.content;
        const articleData: Article = { 
            title: data.title.trim(), 
            content: finalJsonContent.trim()
        };

        try {
            let result: Article;
            
            if (isEdit && finalId) {
                console.log(articleData);
                result = await updateArticle(finalId, articleData, token);
            } else {
                result = await createArticle(articleData, token);
                
                // Upload cover image if one was selected (for new articles)
                if (result && result.id && selectedCoverFile) {
                    await uploadCoverImage(result.id);
                }
            }

            setIsDirty(false);
            setCurrentArticle(result); // Set current article for future image uploads
            
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

    const handlePreview = (): void => {
        const currentContent = markdownEditorRef.current?.getMarkdown() || '';
        setValue('content', currentContent);
        setShowPreview(true);
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

                {/* Article Cover Upload - For New Articles */}
                {!isEdit && (
                    <div className="!mb-6">
                        <div className="!relative">
                            <label className="!flex !justify-between !items-center !mb-2 !font-semibold !text-[#495057] !text-sm">
                                Article Cover Image (Optional)
                            </label>
                            <div className="!border !border-[#ced4da] !rounded-md !p-4">
                                {/* Cover Preview */}
                                <div className="!flex !justify-center !mb-4">
                                    <div className="!relative !w-full !max-w-md !h-48 !bg-gray-100 !border-2 !border-dashed !border-gray-300 !rounded-lg !overflow-hidden">
                                        {coverPreviewUrl ? (
                                            <img
                                                src={coverPreviewUrl}
                                                alt="Article cover preview"
                                                className="!w-full !h-full !object-cover"
                                            />
                                        ) : (
                                            <div className="!w-full !h-full !flex !items-center !justify-center !text-gray-500">
                                                <div className="!text-center">
                                                    <p className="!text-sm">No cover image selected</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Upload Controls */}
                                <div className="!space-y-3">
                                    {!selectedCoverFile ? (
                                        <div className="!flex !flex-col !items-center !gap-2">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        // Validate file type
                                                        if (!file.type.startsWith('image/')) {
                                                            alert('Please select an image file');
                                                            return;
                                                        }
                                                        // Validate file size (5MB max)
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert('File size must be less than 5MB');
                                                            return;
                                                        }
                                                        handleCoverImageSelect(file);
                                                    }
                                                }}
                                                className="!hidden"
                                                id="cover-upload"
                                            />
                                            <label
                                                htmlFor="cover-upload"
                                                className="!cursor-pointer !px-4 !py-2 !border !border-[#ced4da] !rounded-md !text-sm !bg-white hover:!bg-gray-50 !transition-colors"
                                            >
                                                Choose Cover Image
                                            </label>
                                            <p className="!text-xs !text-gray-500">
                                                JPG, PNG, GIF up to 5MB
                                            </p>
                                            <p className="!text-xs !text-gray-400">
                                                Note: GIFs will keep their animation but cannot be cropped
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="!flex !gap-2 !justify-center">
                                            <button
                                                type="button"
                                                onClick={handleCoverImageRemove}
                                                className="!px-4 !py-2 !border !border-[#ced4da] !rounded-md !text-sm !bg-white hover:!bg-gray-50 !transition-colors"
                                            >
                                                Remove Image
                                            </button>
                                            <label
                                                htmlFor="cover-upload-replace"
                                                className="!cursor-pointer !px-4 !py-2 !border !border-[#ced4da] !rounded-md !text-sm !bg-white hover:!bg-gray-50 !transition-colors"
                                            >
                                                Choose Different Image
                                            </label>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        // Validate file type
                                                        if (!file.type.startsWith('image/')) {
                                                            alert('Please select an image file');
                                                            return;
                                                        }
                                                        // Validate file size (5MB max)
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert('File size must be less than 5MB');
                                                            return;
                                                        }
                                                        handleCoverImageSelect(file);
                                                    }
                                                }}
                                                className="!hidden"
                                                id="cover-upload-replace"
                                            />
                                        </div>
                                    )}
                                </div>

                                {selectedCoverFile && (
                                    <div className="!mt-3 !space-y-2">
                                        {/* Show info for GIF files */}
                                        {selectedCoverFile.type === 'image/gif' && (
                                            <div className="!p-2 !bg-blue-50 !border !border-blue-200 !rounded-lg !text-center">
                                                <p className="!text-sm !text-blue-700">
                                                    🎬 GIF selected - animation will be preserved (no cropping available)
                                                </p>
                                            </div>
                                        )}
                                        
                                        {/* Show info for cropped images */}
                                        {croppedBlob && selectedCoverFile.type !== 'image/gif' && (
                                            <div className="!p-2 !bg-green-50 !border !border-green-200 !rounded-lg !text-center">
                                                <p className="!text-sm !text-green-700">
                                                    ✂️ Image cropped successfully - ready to upload
                                                </p>
                                            </div>
                                        )}
                                        
                                        <div className="!p-3 !bg-blue-50 !border !border-blue-200 !rounded-md">
                                            <p className="!text-sm !text-blue-800">
                                                📷 Cover image will be uploaded after creating the article
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Article Cover Upload - For Existing Articles */}
                {currentArticle && token && currentArticle.id && (
                    <div className="!mb-6">
                        <div className="!relative">
                            <label className="!flex !justify-between !items-center !mb-2 !font-semibold !text-[#495057] !text-sm">
                                Article Cover Image
                            </label>
                            <ArticleCoverUpload
                                articleId={currentArticle.id}
                                currentImageUrl={currentArticle?.imageUrl}
                                token={token}
                                onUploadSuccess={(updatedArticle) => {
                                    setCurrentArticle(updatedArticle);
                                }}
                            />
                        </div>
                    </div>
                )}
                
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

                <div className="!flex !gap-3 !justify-between !mt-8 !pt-5 !border-t !border-[#dee2e6]">
                    <Button
                        type="button"
                        onClick={handlePreview}
                        disabled={loading || !title.trim()}
                        variant="outline"
                        className="!px-4 !py-2 !flex !items-center !gap-2"
                    >
                        <Eye size={16} />
                        Preview
                    </Button>
                    
                    <div className="!flex !gap-3">
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
                </div>
            </form>
            
            {/* Article Preview Modal */}
            <ArticlePreview
                title={title}
                content={content}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />

            {/* Crop Modal */}
            {showCropModal && originalImageUrl && (
                <ImageCrop
                    imageSrc={originalImageUrl}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                    aspectRatio={16/9} // 16:9 aspect ratio for article covers
                />
            )}
        </div>
    );
};

export default AdminArticleForm; 