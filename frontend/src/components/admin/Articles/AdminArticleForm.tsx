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
import ArticleCover from '../../ui/ArticleCover';
import ImageCrop, { CropData } from '../../ui/ImageCrop';
import CategoryInput from '../../ui/CategoryInput';
import { Eye } from 'lucide-react';
import * as yup from 'yup';
import { DEFAULT_CATEGORY, getSavedCategories, saveCategory } from '../../../utils/categoryUtils';


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
    category: string;
}

const articleFormSchema = yup.object({
    title: yup.string().required('Title is required'),
    content: yup.string().required('Content is required'),
    category: yup.string().trim().default(DEFAULT_CATEGORY).transform((value) => value || DEFAULT_CATEGORY)
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
    
    // Cover image state for editing existing articles
    const [editSelectedCoverFile, setEditSelectedCoverFile] = useState<File | null>(null);
    const [editCoverPreviewUrl, setEditCoverPreviewUrl] = useState<string | null>(null);
    
    // Crop-related state
    const [showCropModal, setShowCropModal] = useState<boolean>(false);
    const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
    const [cropData, setCropData] = useState<CropData | null>(null);
    const [editCropData, setEditCropData] = useState<CropData | null>(null);
    const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(isEdit ? finalId : undefined);
    const [availableCategories, setAvailableCategories] = useState<string[]>(getSavedCategories());
    
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
            content: initialData?.content || '',
            category: initialData?.category || ''
        }
    });

    const title = watch('title');
    const content = watch('content');
    const category = watch('category');

    useEffect(() => {
        if (isEdit && finalId && !initialData) {
            loadArticle();
        }
    }, [finalId, isEdit, initialData]);



    useEffect(() => {
        // Track if form has been modified
        const hasChanges = title !== (initialData?.title || '') ||
                          content !== (initialData?.content || '') ||
                          category !== (initialData?.category || '');
        setIsDirty(hasChanges);
    }, [title, content, category, initialData]);

    const loadArticle = async (): Promise<void> => {
        if (!finalId) return;
        
        try {
            setLoading(true);
            setError(null);
            fetchArticleById(finalId).then(article => {
                setValue('title', article.title);
                setValue('content', article.content);
                setValue('category', article.category || DEFAULT_CATEGORY);
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

    // Helper function to create cropped preview
    const createCroppedPreview = (cropData: CropData, file: File, setPreviewUrl: (url: string) => void) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return;

                const imgWidth = img.naturalWidth;
                const imgHeight = img.naturalHeight;

                // Use the exact same calculation as the crop rectangle
                const cropPixelWidth = cropData.cropWidth * imgWidth;
                const cropPixelHeight = cropData.cropHeight * imgHeight;

                const centerX = cropData.cropX * imgWidth;
                const centerY = cropData.cropY * imgHeight;

                const finalWidth = cropPixelWidth / cropData.cropScale;
                const finalHeight = cropPixelHeight / cropData.cropScale;

                const startX = centerX - finalWidth / 2;
                const startY = centerY - finalHeight / 2;

                // Set canvas to the exact crop dimensions (no forced aspect ratio)
                canvas.width = finalWidth;
                canvas.height = finalHeight;

                // Draw the exact cropped region
                ctx.drawImage(
                    img,
                    startX, startY, finalWidth, finalHeight,
                    0, 0, finalWidth, finalHeight
                );

                const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
                setPreviewUrl(croppedUrl);
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file);
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
            // For other image types, set preview to original first, then show crop modal
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setCoverPreviewUrl(imageUrl); // Show original first
                setOriginalImageUrl(imageUrl);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle cover image selection for editing existing articles
    const handleEditCoverImageSelect = (file: File) => {
        setEditSelectedCoverFile(file);
        
        // Check if it's a GIF - skip cropping for GIFs to preserve animation
        if (file.type === 'image/gif') {
            // For GIFs, create direct preview and skip cropping
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setEditCoverPreviewUrl(imageUrl);
            };
            reader.readAsDataURL(file);
        } else {
            // For other image types, set preview to original first, then show crop modal
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                setEditCoverPreviewUrl(imageUrl); // Show original first
                setOriginalImageUrl(imageUrl);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropComplete = (cropData: CropData) => {
        if (currentArticle) {
            // Edit mode
            setEditCropData(cropData);
            if (editSelectedCoverFile) {
                createCroppedPreview(cropData, editSelectedCoverFile, setEditCoverPreviewUrl);
            }
        } else {
            // Create mode
            setCropData(cropData);
            if (selectedCoverFile) {
                createCroppedPreview(cropData, selectedCoverFile, setCoverPreviewUrl);
            }
        }
        setShowCropModal(false);
    };

    const handleCropCancel = () => {
        setShowCropModal(false);
        setOriginalImageUrl(null);
        if (currentArticle) {
            // Edit mode - clear edit states
            setEditSelectedCoverFile(null);
            setEditCoverPreviewUrl(null);
            setEditCropData(null);
        } else {
            // Create mode - clear create states
            setSelectedCoverFile(null);
            setCoverPreviewUrl(null);
            setCropData(null);
        }
    };

    const handleCoverImageRemove = () => {
        setSelectedCoverFile(null);
        setCoverPreviewUrl(null);
        setCropData(null);
        setOriginalImageUrl(null);
    };

    const handleEditCoverImageRemove = () => {
        setEditSelectedCoverFile(null);
        setEditCoverPreviewUrl(null);
        setEditCropData(null);
    };

    // Upload cover image after article creation
    const uploadCoverImage = async (articleId: string): Promise<void> => {
        if (!selectedCoverFile || !token) return;

        try {
            const formData = new FormData();
            formData.append('file', selectedCoverFile);
            
            // Add crop data if available and not a GIF
            if (cropData && selectedCoverFile.type !== 'image/gif') {
                formData.append('cropX', cropData.cropX.toString());
                formData.append('cropY', cropData.cropY.toString());
                formData.append('cropWidth', cropData.cropWidth.toString());
                formData.append('cropHeight', cropData.cropHeight.toString());
                formData.append('cropScale', cropData.cropScale.toString());
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
            setCropData(null);
            setOriginalImageUrl(null);
        } catch (err) {
            console.error('Cover image upload failed:', err);
            // Note: We don't throw here to avoid breaking the article creation flow
        }
    };

    // Upload cover image for editing existing articles
    const uploadEditCoverImage = async (articleId: string): Promise<void> => {
        if (!editSelectedCoverFile || !token) return;

        try {
            const formData = new FormData();
            formData.append('file', editSelectedCoverFile);
            
            // Add crop data if available and not a GIF
            if (editCropData && editSelectedCoverFile.type !== 'image/gif') {
                formData.append('cropX', editCropData.cropX.toString());
                formData.append('cropY', editCropData.cropY.toString());
                formData.append('cropWidth', editCropData.cropWidth.toString());
                formData.append('cropHeight', editCropData.cropHeight.toString());
                formData.append('cropScale', editCropData.cropScale.toString());
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
            
            // Clear the edit states after successful upload
            setEditSelectedCoverFile(null);
            setEditCoverPreviewUrl(null);
            setEditCropData(null);
        } catch (err) {
            console.error('Error uploading edit cover image:', err);
            setError('Failed to upload cover image');
        }
    };

    const handleAutoSave = async (): Promise<string | undefined> => {
        const formData = { 
            title: watch('title') || 'Untitled Article', 
            content: markdownEditorRef.current?.getEditorStateJson() || '' 
        };
        
        if (!token) {
            throw new Error('No authentication token');
        }
        
        try {
            const result = await createArticle(formData, token);
            if (result && result.id) {
                setCurrentArticleId(result.id);
                setCurrentArticle(result);
                return result.id;
            }
        } catch (error) {
            console.error('Auto-save failed:', error);
            throw error;
        }
        
        return undefined;
    };

    const handleFormSubmit = async (data: ArticleFormData): Promise<void> => {
        if (!token) {
            setError('Authentication token not found. Please log in again.');
            return;
        }

        setLoading(true);
        setError(null);

        const finalJsonContent = markdownEditorRef.current?.getEditorStateJson() || data.content;
        const finalCategory = data.category.trim() || DEFAULT_CATEGORY;
        
        // Save the category if it's new
        saveCategory(finalCategory);
        setAvailableCategories(getSavedCategories());
        
        const articleData: Article = { 
            title: data.title.trim(), 
            content: finalJsonContent.trim(),
            category: finalCategory
        };

        try {
            let result: Article;
            
            if (isEdit && finalId) {
                console.log(articleData);
                result = await updateArticle(finalId, articleData, token);
                
                // Upload new cover image if one was selected (for editing articles)
                if (result && result.id && editSelectedCoverFile) {
                    await uploadEditCoverImage(result.id);
                }
            } else {
                result = await createArticle(articleData, token);
                
                // Set the article ID for image uploads
                if (result && result.id) {
                    setCurrentArticleId(result.id);
                }
                
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

                <div className="!mb-6">
                    <div className="!relative">
                        <label htmlFor="category" className="!flex !justify-between !items-center !mb-2 !font-semibold !text-[#495057] !text-sm">
                            Category <span className="!text-[#dc3545] !ml-1">*</span>
                        </label>
                        <CategoryInput
                            value={category || ''}
                            onChange={(value) => setValue('category', value)}
                            suggestions={availableCategories}
                            placeholder="Start typing or leave empty for General..."
                            disabled={loading}
                            className="!w-full !px-3 !py-3 !border !border-[#ced4da] !rounded-md !text-sm !transition-all !duration-200 !font-inherit focus:!border-[#007bff] focus:!shadow-[0_0_0_2px_rgba(0,123,255,0.25)] focus:!outline-none"
                            error={errors.category?.message}
                        />
                    </div>
                </div>

                {/* Article Cover Upload - For New Articles */}
                {!isEdit && !currentArticle && (
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
                                        {cropData && selectedCoverFile.type !== 'image/gif' && (
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
                            <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6 !border !border-[#ced4da] !rounded-md !p-4">
                                {/* Left side - Current Cover */}
                                <div>
                                    <h3 className="!text-sm !font-medium !text-[#495057] !mb-3">Current Cover</h3>
                                    <div className="!relative !w-full !h-48 !bg-gray-100 !border-2 !border-dashed !border-gray-300 !rounded-lg !overflow-hidden">
                                        {currentArticle.imageUrl ? (
                                            <ArticleCover 
                                                article={currentArticle}
                                                className="!w-full !h-full !object-cover !rounded-lg"
                                            />
                                        ) : (
                                            <div className="!w-full !h-full !flex !items-center !justify-center !text-gray-500">
                                                <div className="!text-center">
                                                    <p className="!text-sm">No cover image</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right side - Upload New Cover */}
                                <div>
                                    <h3 className="!text-sm !font-medium !text-[#495057] !mb-3">Upload New Cover</h3>
                                    <div className="!relative !w-full !h-48 !bg-gray-100 !border-2 !border-dashed !border-gray-300 !rounded-lg !overflow-hidden !mb-4">
                                        {editCoverPreviewUrl ? (
                                            <img
                                                src={editCoverPreviewUrl}
                                                alt="New article cover preview"
                                                className="!w-full !h-full !object-cover"
                                            />
                                        ) : (
                                            <div className="!w-full !h-full !flex !items-center !justify-center !text-gray-500">
                                                <div className="!text-center">
                                                    <p className="!text-sm">No new cover selected</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Controls */}
                                    <div className="!space-y-3">
                                        {!editSelectedCoverFile ? (
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
                                                            handleEditCoverImageSelect(file);
                                                        }
                                                    }}
                                                    className="!hidden"
                                                    id="edit-cover-upload"
                                                />
                                                <label
                                                    htmlFor="edit-cover-upload"
                                                    className="!cursor-pointer !px-4 !py-2 !border !border-[#ced4da] !rounded-md !text-sm !bg-white hover:!bg-gray-50 !transition-colors"
                                                >
                                                    Choose New Cover Image
                                                </label>
                                                <p className="!text-xs !text-gray-500">
                                                    JPG, PNG, GIF up to 5MB
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="!flex !gap-2 !justify-center">
                                                <button
                                                    type="button"
                                                    onClick={handleEditCoverImageRemove}
                                                    className="!px-4 !py-2 !border !border-[#ced4da] !rounded-md !text-sm !bg-white hover:!bg-gray-50 !transition-colors"
                                                >
                                                    Remove Image
                                                </button>
                                                <label
                                                    htmlFor="edit-cover-upload-replace"
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
                                                            handleEditCoverImageSelect(file);
                                                        }
                                                    }}
                                                    className="!hidden"
                                                    id="edit-cover-upload-replace"
                                                />
                                            </div>
                                        )}

                                        {editSelectedCoverFile && (
                                            <div className="!mt-3 !space-y-2">
                                                {/* Show info for GIF files */}
                                                {editSelectedCoverFile.type === 'image/gif' && (
                                                    <div className="!p-2 !bg-blue-50 !border !border-blue-200 !rounded-lg !text-center">
                                                        <p className="!text-sm !text-blue-700">
                                                            🎬 GIF selected - animation will be preserved (no cropping available)
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                {/* Show info for cropped images */}
                                                {editCropData && editSelectedCoverFile.type !== 'image/gif' && (
                                                    <div className="!p-2 !bg-green-50 !border !border-green-200 !rounded-lg !text-center">
                                                        <p className="!text-sm !text-green-700">
                                                            ✂️ Image cropped successfully - ready to upload
                                                        </p>
                                                    </div>
                                                )}
                                                
                                                <div className="!p-3 !bg-blue-50 !border !border-blue-200 !rounded-md">
                                                    <p className="!text-sm !text-blue-800">
                                                        📷 New cover image will be uploaded when you save the article
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
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
                            articleId={currentArticleId}
                            onArticleCreate={!isEdit ? handleAutoSave : undefined}
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
                    aspectRatio={1.6} // 8:5 aspect ratio to match article covers
                />
            )}
        </div>
    );
};

export default AdminArticleForm; 