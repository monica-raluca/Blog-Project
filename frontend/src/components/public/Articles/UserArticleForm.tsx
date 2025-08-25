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
import ImageCrop from '../../ui/ImageCrop';
import { Article } from '../../../api/types';

interface ArticleFormProps {
	isEdit?: boolean;
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




const UserArticleForm: React.FC<ArticleFormProps> = ({ isEdit = false }) => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const markdownEditorRef = useRef<LexicalEditorRef>(null);

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
			content: ''
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
	const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

	useEffect(() => {
		if (isEdit && id) {
			fetchArticleById(id).then(article => {
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
		const article = { title: data.title, content: jsonContent };

		try {
			let result;
			if (isEdit && id && token) {
				result = await updateArticle(id, article, token);
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
											{croppedBlob && selectedCoverFile.type !== 'image/gif' && (
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
								<div className="!p-4 !border-2 !border-gray-200 !rounded-xl !bg-white/80 !backdrop-blur-sm">
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
					aspectRatio={16/9} // 16:9 aspect ratio for article covers
				/>
			)}
		</div>
	);
};

export default UserArticleForm; 