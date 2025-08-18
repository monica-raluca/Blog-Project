import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { createArticle, updateArticle, fetchArticleById } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from '@/components/ui/button';
import LexicalEditor, { LexicalEditorRef } from '../../ui/LexicalEditor';

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

	useEffect(() => {
		if (isEdit && id) {
			fetchArticleById(id).then(article => {
				setValue('title', article.title);
				setValue('content', article.content);
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

	const handleFormSubmit = async (data: ArticleFormData): Promise<void> => {
		const markdownContent = markdownEditorRef.current?.getMarkdown() || data.content;
		const article = { title: data.title, content: markdownContent };

		try {
			if (isEdit && id && token) {
				await updateArticle(id, article, token);
			} else if (token) {
				await createArticle(article, token);
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
			<div className="!w-full !max-w-[600px] !bg-white/90 !backdrop-blur-xl !rounded-3xl !shadow-2xl !shadow-purple-100/50 !border !border-white/60 !p-8 !md:p-12">
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
							<label className="!block !text-sm !font-semibold !text-gray-700 !mb-2">Content</label>
							<LexicalEditor
								ref={markdownEditorRef}
								initialValue={content}
								onChange={(newContent) => setValue("content", newContent)}
								placeholder="Write your story here... Use Markdown formatting for rich content!"
								minHeight="300px"
								showToolbar={true}
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
		</div>
	);
};

export default UserArticleForm; 