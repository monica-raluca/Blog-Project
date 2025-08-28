import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import LexicalEditor, { LexicalEditorRef } from '../../ui/LexicalEditor';
import ArticleCoverUpload from '../../ui/ArticleCoverUpload';
import ArticleCover from '../../ui/ArticleCover';
import ImageCrop, { CropData } from '../../ui/ImageCrop';
import CategoryInput from '../../ui/CategoryInput';
import { Article } from '../../../api/types';

interface ArticleFormProps {
	isEdit?: boolean;
}

interface ArticleFormData {
	title: string;
	content: string;
	category: string;
}

import { DEFAULT_CATEGORY, getSavedCategories, saveCategory } from '../../../utils/categoryUtils';

const articleFormSchema = yup.object({
    title: yup.string().required('Title is required'),
    content: yup.string().required('Content is required'),
    category: yup.string().trim().default(DEFAULT_CATEGORY).transform((value) => value || DEFAULT_CATEGORY)
}).required();

type FormData = yup.InferType<typeof articleFormSchema>;




const UserArticleForm: React.FC<ArticleFormProps> = ({ isEdit = false }) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const markdownEditorRef = useRef<LexicalEditorRef>(null);
	const [availableCategories, setAvailableCategories] = useState<string[]>(getSavedCategories());

	const { token, currentUser } = useAuth();

	const { 
		register, 
		handleSubmit, 
		watch,
		setValue, 
		formState: { errors } 
	} = useForm<FormData>({
		resolver: yupResolver(articleFormSchema),
		defaultValues: {
			title: '',
			content: '',
			category: ''
		}
	});

	const content = watch('content');
	const [currentArticle, setCurrentArticle] = useState<Article | null>(null);
	const [currentArticleId, setCurrentArticleId] = useState<string | undefined>(isEdit ? id : undefined);
	
	// Cover image state for new articles
	const [selectedCoverFile, setSelectedCoverFile] = useState<File | null>(null);
	const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
	
	// Crop-related state
	const [showCropModal, setShowCropModal] = useState<boolean>(false);
	const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
	const [cropData, setCropData] = useState<CropData | null>(null);
	
	// Edit mode cover state
	const [editSelectedCoverFile, setEditSelectedCoverFile] = useState<File | null>(null);
	const [editCoverPreviewUrl, setEditCoverPreviewUrl] = useState<string | null>(null);
	const [editCropData, setEditCropData] = useState<CropData | null>(null);

	useEffect(() => {
		if (isEdit && id) {
			fetchArticleById(id).then(article => {
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
			}).catch(err => {
				const errorMessage = (err as Error).message || 'An error occurred';
				if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else if (errorMessage.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else {
					navigate('/error');
				}
			});
		}
	}, [id, isEdit, token, navigate, setValue]);

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
			// For other image types, set initial preview and show crop modal
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageUrl = e.target?.result as string;
				setCoverPreviewUrl(imageUrl); // Set initial preview
				setOriginalImageUrl(imageUrl); // Set for crop modal
				setShowCropModal(true);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleCropComplete = (cropData: CropData) => {
		if (isEdit) {
			setEditCropData(cropData);
			// Create a cropped preview for edit mode
			if (editSelectedCoverFile && editSelectedCoverFile.type !== 'image/gif') {
				createCroppedPreview(cropData, editSelectedCoverFile, setEditCoverPreviewUrl);
			}
		} else {
			setCropData(cropData);
			// Create a cropped preview for create mode
			if (selectedCoverFile && selectedCoverFile.type !== 'image/gif') {
				createCroppedPreview(cropData, selectedCoverFile, setCoverPreviewUrl);
			}
		}
		setShowCropModal(false);
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

				console.log('Creating preview with crop data:', cropData);

				const imgWidth = img.naturalWidth;
				const imgHeight = img.naturalHeight;

				console.log('Image natural dimensions:', { imgWidth, imgHeight });

				// Use the exact same calculation as the crop rectangle
				// The crop data represents the visible area after scaling
				const cropPixelWidth = cropData.cropWidth * imgWidth;
				const cropPixelHeight = cropData.cropHeight * imgHeight;

				const centerX = cropData.cropX * imgWidth;
				const centerY = cropData.cropY * imgHeight;

				const finalWidth = cropPixelWidth / cropData.cropScale;
				const finalHeight = cropPixelHeight / cropData.cropScale;

				const startX = centerX - finalWidth / 2;
				const startY = centerY - finalHeight / 2;

				console.log('Preview calculations:', {
					cropPixelWidth, cropPixelHeight,
					centerX, centerY,
					finalWidth, finalHeight,
					startX, startY
				});

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
				console.log('Preview created successfully');
				setPreviewUrl(croppedUrl);
			};
			img.src = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const handleCropCancel = () => {
		setShowCropModal(false);
		setOriginalImageUrl(null);
		if (isEdit) {
			setEditSelectedCoverFile(null);
			setEditCropData(null);
			setEditCoverPreviewUrl(null);
		} else {
			setSelectedCoverFile(null);
			setCropData(null);
			setCoverPreviewUrl(null);
		}
	};

	const handleCoverImageRemove = () => {
		setSelectedCoverFile(null);
		setCoverPreviewUrl(null);
		setCropData(null);
		setOriginalImageUrl(null);
	};

	const handleEditCoverImageSelect = (file: File) => {
		if (file.type === 'image/gif') {
			// For GIFs, skip cropping and go directly to preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setEditCoverPreviewUrl(e.target?.result as string);
			};
			reader.readAsDataURL(file);
			setEditSelectedCoverFile(file);
			setEditCropData(null);
		} else {
			// For other images, set initial preview and show crop modal
			const reader = new FileReader();
			reader.onload = (e) => {
				const imageDataUrl = e.target?.result as string;
				setEditCoverPreviewUrl(imageDataUrl); // Set initial preview
				setOriginalImageUrl(imageDataUrl); // Set for crop modal
				setShowCropModal(true);
			};
			reader.readAsDataURL(file);
			setEditSelectedCoverFile(file);
		}
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
			
			// Always upload the full image
			formData.append('file', selectedCoverFile);
			
			// Add crop metadata if available (for non-GIF images)
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

	// Upload new cover image in edit mode
	const uploadEditCoverImage = async (articleId: string): Promise<void> => {
		if (!editSelectedCoverFile || !token) return;

		try {
			const formData = new FormData();
			
			// Always upload the full image
			formData.append('file', editSelectedCoverFile);
			
			// Add crop metadata if available (for non-GIF images)
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
				body: formData
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Edit cover upload failed: ${errorText}`);
			}

			const updatedArticle = await response.json();
			setCurrentArticle(updatedArticle);
			
			// Clear the edit mode states after successful upload
			setEditSelectedCoverFile(null);
			setEditCoverPreviewUrl(null);
			setEditCropData(null);
			setOriginalImageUrl(null);
		} catch (err) {
			console.error('Edit cover image upload failed:', err);
			// Note: We don't throw here to avoid breaking the article update flow
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
		const jsonContent = markdownEditorRef.current?.getEditorStateJson() || data.content;
		const finalCategory = data.category.trim() || DEFAULT_CATEGORY;
		
		// Save the category if it's new
		saveCategory(finalCategory);
		setAvailableCategories(getSavedCategories());
		
		const article = { title: data.title, content: jsonContent, category: finalCategory };

		try {
			let result;
			if (isEdit && id && token) {
				result = await updateArticle(id, article, token);
				
				// Upload new cover image if one was selected (for edit mode)
				if (result && result.id && editSelectedCoverFile) {
					await uploadEditCoverImage(result.id);
				}
			} else if (token) {
				result = await createArticle(article, token);
				
				// Set the article ID for image uploads
				if (result && result.id) {
					setCurrentArticleId(result.id);
				}
				
				// Upload cover image if one was selected (for new articles)
				if (result && result.id && selectedCoverFile) {
					await uploadCoverImage(result.id);
				}
			}
			if (result) {
				setCurrentArticle(result); // Set current article for future image uploads
			}
			navigate('/public/articles');
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
		}
	};



	return (
		<div className="!min-h-screen !flex !items-center !justify-center !p-4">
			<div className="!w-full !max-w-4xl !bg-white/90 !backdrop-blur-xl !rounded-3xl !shadow-2xl !shadow-purple-100/50 !border !border-white/60 !p-8 !md:p-12">
				<form onSubmit={handleSubmit(handleFormSubmit)} className="!space-y-6">
					<div className="!text-center !mb-8">
						<h2 className="!text-3xl !md:text-4xl !font-bold !bg-gradient-to-r !from-purple-600 !via-pink-600 !to-rose-600 !bg-clip-text !text-transparent !mb-2">
							{isEdit ? 'Edit Article' : 'Create Article'}
						</h2>
						<p className="!text-gray-600 !text-sm">
							{isEdit ? 'Update your article content' : 'Share your thoughts with the world'}
						</p>
					</div>
					
					<div className="!space-y-4">
						<div className="!relative">
							<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Title</label>
							<input 
								placeholder="Enter a captivating title..." 
								{...register("title")}
								className="!w-full !px-4 !py-4 !text-base !border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out focus:!border-purple-400 focus:!ring-4 focus:!ring-purple-100 focus:!bg-white focus:!shadow-lg focus:!scale-[1.02] !outline-none"
							/>
							{errors.title?.message && (
								<p className="!text-rose-500 !text-sm !mt-2 !font-medium !animate-pulse">{errors.title?.message}</p>
							)}
						</div>

						<div className="!relative">
							<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Category</label>
							<CategoryInput
								value={watch('category') || ''}
								onChange={(value) => setValue('category', value)}
								suggestions={availableCategories}
								placeholder="Start typing or leave empty for General..."
								className="!w-full !px-4 !py-4 !text-base !border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out focus:!border-purple-400 focus:!ring-4 focus:!ring-purple-100 focus:!bg-white focus:!shadow-lg focus:!scale-[1.02] !outline-none"
								error={errors.category?.message}
							/>
						</div>

						{/* Article Cover Upload - For New Articles */}
						{!isEdit && !currentArticle && (
							<div className="!relative">
								<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Article Cover Image (Optional)</label>
								<div className="!p-4 !border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm">
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
													id="cover-upload-new"
												/>
												<label
													htmlFor="cover-upload-new"
													className="!cursor-pointer !px-6 !py-3 !border-2 !border-gray-200 !rounded-xl !text-sm !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-purple-400 hover:!bg-white hover:!shadow-lg hover:!scale-[1.02]"
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
											<div className="!flex !gap-3 !justify-center">
												<button
													type="button"
													onClick={handleCoverImageRemove}
													className="!px-4 !py-2 !border-2 !border-gray-200 !rounded-lg !text-sm !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-rose-400 hover:!bg-white hover:!shadow-lg"
												>
													Remove
												</button>
												<label
													htmlFor="cover-upload-replace-new"
													className="!cursor-pointer !px-4 !py-2 !border-2 !border-gray-200 !rounded-lg !text-sm !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-purple-400 hover:!bg-white hover:!shadow-lg"
												>
													Change Image
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
													id="cover-upload-replace-new"
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
											
											<div className="!p-3 !bg-purple-50 !border !border-purple-200 !rounded-lg">
												<p className="!text-sm !text-purple-800">
													✨ Cover image will be uploaded after creating the article
												</p>
											</div>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Article Cover Upload - For Existing Articles */}
						{currentArticle && token && currentArticle.id && (
							<div className="!relative">
								<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Article Cover Image</label>
								<div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6 !p-4 !border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm">
									{/* Left side - Current Cover */}
									<div>
										<h3 className="!text-sm !font-medium !text-gray-700 !mb-3">Current Cover</h3>
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
										<h3 className="!text-sm !font-medium !text-gray-700 !mb-3">Upload New Cover</h3>
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
														id="cover-upload-edit"
													/>
													<label
														htmlFor="cover-upload-edit"
														className="!cursor-pointer !px-4 !py-2 !border-2 !border-gray-200 !rounded-lg !text-sm !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-purple-400 hover:!bg-white hover:!shadow-lg"
													>
														Choose New Cover
													</label>
													<p className="!text-xs !text-gray-500">
														JPG, PNG, GIF up to 5MB
													</p>
												</div>
											) : (
												<div className="!flex !gap-3 !justify-center">
													<button
														type="button"
														onClick={handleEditCoverImageRemove}
														className="!px-3 !py-1.5 !border-2 !border-gray-200 !rounded-lg !text-xs !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-rose-400 hover:!bg-white hover:!shadow-lg"
													>
														Remove
													</button>
													<label
														htmlFor="cover-upload-replace-edit"
														className="!cursor-pointer !px-3 !py-1.5 !border-2 !border-gray-200 !rounded-lg !text-xs !font-medium !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out hover:!border-purple-400 hover:!bg-white hover:!shadow-lg"
													>
														Change
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
														id="cover-upload-replace-edit"
													/>
												</div>
											)}
										</div>

										{editSelectedCoverFile && (
											<div className="!mt-3 !space-y-2">
												{/* Show info for GIF files */}
												{editSelectedCoverFile.type === 'image/gif' && (
													<div className="!p-2 !bg-blue-50 !border !border-blue-200 !rounded-lg !text-center">
														<p className="!text-xs !text-blue-700">
															🎬 GIF selected - animation preserved
														</p>
													</div>
												)}
												
																			{/* Show info for cropped images */}
							{editCropData && editSelectedCoverFile.type !== 'image/gif' && (
								<div className="!p-2 !bg-green-50 !border !border-green-200 !rounded-lg !text-center">
									<p className="!text-xs !text-green-700">
										✂️ Image cropped successfully
									</p>
								</div>
							)}
											</div>
										)}
									</div>
								</div>
							</div>
						)}
						
						<div className="!relative">
							<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Content</label>
							<LexicalEditor
								ref={markdownEditorRef}
								initialValue={content}
								onChange={(newContent) => setValue("content", newContent)}
								placeholder="Write your story here... Use Markdown formatting for rich content!"
								minHeight="300px"
								showToolbar={true}
								articleId={currentArticleId}
								onArticleCreate={!isEdit ? handleAutoSave : undefined}
								className="!border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm !transition-all !duration-300 !ease-out focus-within:!border-purple-400 focus-within:!ring-4 focus-within:!ring-purple-100 focus-within:!bg-white focus-within:!shadow-lg focus-within:!scale-[1.02]"
							/>
							{errors.content?.message && (
								<p className="!text-rose-500 !text-sm !mt-2 !font-medium !animate-pulse">{errors.content?.message}</p>
							)}
						</div>
					</div>
					
					<div className="!flex !justify-center !pt-6">
						<Button 
							variant="primary" 
							size="lg" 
							type="submit" 
							className="!px-12 !py-4 !text-lg !font-bold !rounded-full !shadow-xl !shadow-purple-200/50 hover:!shadow-2xl hover:!shadow-purple-300/60 hover:!scale-105 !transition-all !duration-300 !ease-out"
						>
							{isEdit ? 'Update Article' : 'Create Article'}
						</Button>
					</div>
				</form>
			</div>

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

export default UserArticleForm; 