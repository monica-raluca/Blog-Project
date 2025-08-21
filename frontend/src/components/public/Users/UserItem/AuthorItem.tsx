import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { fetchUserById } from '../../../../api/UsersApi';
import { fetchArticlesByAuthor } from '../../../../api/ArticlesApi';
import { UserDetail, Article } from '../../../../api/types';
import { Button } from '../../../../../components/ui/button';

const AuthorItem: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [author, setAuthor] = useState<UserDetail | null>(null);
	const [articles, setArticles] = useState<Article[]>([]);
	const [showArticles, setShowArticles] = useState<boolean>(false);
	const navigate = useNavigate();

	useEffect(() => {
		if (!id) return;
		
        fetchUserById(id)
			.then(setAuthor)
			.catch(err => {
				console.error("Failed to load author", err);
				const errorMessage = (err as Error).message || 'An error occurred';
				console.log(errorMessage);
				if (errorMessage.toLowerCase().includes('not found')) {
					navigate('/notfound');
				} else if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});
	}, [id, navigate]);

	const loadArticles = (): void => {
		if (showArticles) {
			setShowArticles(false);
			return;
		}

		if (!author) return;

        fetchArticlesByAuthor(author)
			.then(data => {
				// Handle both direct array and object with articles property
				if (Array.isArray(data)) {
					setArticles(data);
				} else {
					setArticles(data.articles || []);
				}
				setShowArticles(true);
			})
			.catch(err => {
				console.error("Failed to load articles", err);
				const errorMessage = (err as Error).message || 'An error occurred';
				if (errorMessage.toLowerCase().includes('forbidden')) {
					navigate('/forbidden');
				} else {
					navigate('/error');
				}
			});
	};

	if (!author) return (
		<div className="!min-h-screen !flex !items-center !justify-center !p-4">
			<div className="!flex !flex-col !items-center !gap-4">
				<div className="!w-12 !h-12 !border-4 !border-purple-200 !border-t-purple-600 !rounded-full !animate-spin"></div>
				<p className="!text-lg !font-medium !text-gray-600 !animate-pulse">Loading author...</p>
			</div>
		</div>
	);

	console.log("author");
	console.log(author);
	console.log(author.profilePicture);
	console.log(`/profile-pictures/${author.profilePicture}`);

	return (
		<div className="!min-h-screen !flex !items-center !justify-center !p-4">
			<div className="!w-full !max-w-lg !bg-white/90 !backdrop-blur-xl !rounded-3xl !shadow-2xl !shadow-purple-100/50 !border !border-white/60 !p-8 !md:!p-12 !flex !flex-col !items-center !space-y-6">
				
				{/* Profile Picture */}
				<div className="!relative !group">
					<div className="!w-24 !h-24 !md:!w-32 !md:!h-32 !rounded-full !bg-gradient-to-br !from-purple-400 !via-pink-400 !to-rose-400 !p-1 !shadow-xl !shadow-purple-200/50">
						<div className="!w-full !h-full !rounded-full !bg-white !flex !items-center !justify-center !overflow-hidden">
							{author.profilePicture ? (
								<img 
									src={`http://localhost:8080/profile-pictures/${author.profilePicture}`} 
									alt="Profile" 
									className="!w-full !h-full !object-cover !rounded-full"
								/>
							) : (
								<span className="!text-2xl !md:!text-4xl !font-bold !bg-gradient-to-r !from-purple-600 !to-pink-600 !bg-clip-text !text-transparent">
									{author.username ? author.username[0].toUpperCase() : '?'}
								</span>
							)}
						</div>
					</div>
				</div>

				{/* User Info */}
				<div className="!text-center !space-y-3">
					<h1 className="!text-2xl !md:!text-3xl !font-bold !bg-gradient-to-r !from-purple-600 !via-pink-600 !to-rose-600 !bg-clip-text !text-transparent">
						{author.username}
					</h1>
					<p className="!text-base !md:!text-lg !text-gray-600 !font-medium">
						{author.email}
					</p>
					<p className="!text-sm !md:!text-base !text-gray-500 !italic">
						Joined {new Date(author.createdDate || author.createdAt || '').toLocaleDateString('en-US', {
							year: 'numeric',
							month: 'long',
							day: 'numeric'
						})}
					</p>
				</div>

				{/* Articles Button */}
				<Button 
					onClick={loadArticles} 
					variant="primary" 
					size="lg"
					className="!px-8 !py-4 !text-base !font-bold !rounded-full !shadow-xl !shadow-purple-200/50 hover:!shadow-2xl hover:!shadow-purple-300/60 hover:!scale-105 !transition-all !duration-300 !ease-out"
				>
					{showArticles ? "Hide Articles" : "Show Articles"}
				</Button>

				{/* Articles List */}
				{showArticles && (
					<div className="!w-full !mt-8 !space-y-4 !animate-in !slide-in-from-bottom-4 !duration-500">
						<h3 className="!text-lg !font-bold !text-center !text-gray-700 !mb-4">
							Articles by {author.username}
						</h3>
						{articles.length > 0 ? (
							<ul className="!space-y-3">
								{articles.map(article => (
									<li key={article.id} className="!group">
										<a 
											href={`/public/articles/${article.id}`}
											className="!block !p-4 !bg-gradient-to-r !from-purple-50 !to-pink-50 !rounded-xl !border !border-purple-100 !transition-all !duration-300 hover:!from-purple-100 hover:!to-pink-100 hover:!shadow-lg hover:!shadow-purple-100/50 hover:!scale-[1.02] !no-underline"
										>
											<h4 className="!text-base !font-semibold !text-gray-800 group-hover:!text-purple-700 !transition-colors !duration-200">
												{article.title}
											</h4>
											<p className="!text-sm !text-gray-600 !mt-1">
												Click to read more →
											</p>
										</a>
									</li>
								))}
							</ul>
						) : (
							<div className="!text-center !py-8">
								<div className="!text-4xl !mb-4">📝</div>
								<p className="!text-gray-500 !italic">No articles found</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AuthorItem; 