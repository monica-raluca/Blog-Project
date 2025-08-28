import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { fetchUserById } from '../../../../api/UsersApi';
import { fetchArticlesByAuthor } from '../../../../api/ArticlesApi';
import { UserDetail, Article } from '../../../../api/types';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import LexicalContentRenderer from '../../../ui/LexicalContentRenderer';
import MagicalAvatar from '../../../ui/MagicalAvatar';
import ArticleCover from '../../../ui/ArticleCover';
import { Combobox, type ComboboxOption } from '../../../../../components/ui/combobox';
import { extractSmartSummary } from '../../../../utils/contentUtils';
import { getSavedCategories } from '../../../../utils/categoryUtils';
import { ChevronDown, ChevronUp, SortAsc, SortDesc, Calendar, BookOpen, Tag } from 'lucide-react';
import '../../../../styles/magical-cards.css';

const AuthorItem: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [author, setAuthor] = useState<UserDetail | null>(null);
	const [articles, setArticles] = useState<Article[]>([]);
	const [sortedArticles, setSortedArticles] = useState<Article[]>([]);
	const [showArticles, setShowArticles] = useState<boolean>(false);
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // desc = newest first
	const [categoryFilter, setCategoryFilter] = useState<string>('');
	const navigate = useNavigate();



	const [availableCategories] = useState<string[]>(getSavedCategories());

	// Convert categories to combobox options
	const categoryOptions: ComboboxOption[] = [
		{ value: '', label: 'All categories' },
		...availableCategories.map(cat => ({ value: cat, label: cat }))
	];

	useEffect(() => {
		if (!id) return;
		
        fetchUserById(id)
			.then(user => {
				setAuthor(user);
				// Immediately fetch articles to get the count
				return fetchArticlesByAuthor(user, 1000, 0); // Fetch up to 1000 articles to show all
			})
			.then(data => {
				console.log('=== AUTHOR ARTICLES DEBUG ===');
				console.log('Raw data from fetchArticlesByAuthor:', data);
				console.log('Is array?', Array.isArray(data));
				console.log('Data type:', typeof data);
				
				// Handle both direct array and object with articles property
				let articlesData = [];
				if (Array.isArray(data)) {
					articlesData = data;
				} else {
					articlesData = data.articles || [];
				}
				
				console.log('Final articles data:', articlesData);
				console.log('Number of articles:', articlesData.length);
				articlesData.forEach((article, index) => {
					console.log(`Article ${index + 1}:`, {
						id: article.id,
						title: article.title,
						createdDate: article.createdDate,
						createdAt: article.createdAt,
						author: article.author?.username
					});
				});
				
				setArticles(articlesData);
			})
			.catch(err => {
				console.error("Failed to load author or articles", err);
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

	// Sort articles by published date
	const sortArticlesByDate = (articles: Article[], order: 'asc' | 'desc'): Article[] => {
		return [...articles].sort((a, b) => {
			const dateA = new Date(a.createdDate || a.createdAt || '').getTime();
			const dateB = new Date(b.createdDate || b.createdAt || '').getTime();
			return order === 'desc' ? dateB - dateA : dateA - dateB;
		});
	};

	// Update sorted articles when articles, sort order, or category filter changes
	useEffect(() => {
		if (articles.length > 0) {
			console.log('=== SORTING/FILTERING DEBUG ===');
			console.log('Articles before filtering/sorting:', articles.length);
			console.log('Sort order:', sortOrder);
			console.log('Category filter:', categoryFilter);
			
			// First filter by category
			let filteredArticles = articles;
			if (categoryFilter.trim()) {
				filteredArticles = articles.filter(article => 
					(article.category || 'General').toLowerCase().includes(categoryFilter.toLowerCase())
				);
			}
			
			// Then sort
			const sorted = sortArticlesByDate(filteredArticles, sortOrder);
			console.log('Articles after filtering/sorting:', sorted.length);
			console.log('Filtered/sorted articles:', sorted.map(a => ({
				id: a.id,
				title: a.title,
				category: a.category || 'General',
				date: a.createdDate || a.createdAt
			})));
			
			setSortedArticles(sorted);
		} else {
			console.log('No articles to sort, setting empty array');
			setSortedArticles([]);
		}
	}, [articles, sortOrder, categoryFilter]);

	const toggleSortOrder = (): void => {
		setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
	};

	const formatDateTimeToMin = (dateStr: string): string => {
		const d = new Date(dateStr);
		return d.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	const toggleArticlesDisplay = (): void => {
		setShowArticles(prev => !prev);
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
		<div className="!min-h-screen !bg-gradient-to-br !from-purple-100 !via-blue-50 !to-indigo-100 !py-8">
			<div className="!max-w-6xl !mx-auto !px-4">
				{/* Author Profile Card - Now Wider */}
				<div className="!bg-white/90 !backdrop-blur-xl !rounded-3xl !shadow-2xl !shadow-purple-100/50 !border !border-white/60 !p-8 !mb-8">
					<div className="!flex !flex-col md:!flex-row !items-center !gap-8">
						{/* Avatar Section */}
						<div className="!flex-shrink-0">
							<MagicalAvatar 
								user={author}
								size="xl"
								className="!w-32 !h-32"
							/>
						</div>
						
						{/* Profile Info */}
						<div className="!flex-1 !text-center md:!text-left">
							<h1 className="!text-4xl !font-bold !bg-gradient-to-r !from-purple-600 !to-pink-600 !bg-clip-text !text-transparent !mb-4">
								{author.firstName} {author.lastName}
							</h1>
							<div className="!flex !flex-col md:!flex-row !items-center !gap-4 !mb-4">
								<p className="!text-purple-600 !font-medium !text-xl">@{author.username}</p>
								<Badge className="!bg-gradient-to-r !from-purple-100 !to-pink-100 !text-purple-700 !border !border-purple-200">
									{author.role}
								</Badge>
							</div>
							<p className="!text-gray-600 !text-lg">{author.email}</p>
							
							{/* Stats */}
							<div className="!flex !items-center !justify-center md:!justify-start !gap-6 !mt-6">
								<div className="!text-center">
									<div className="!text-2xl !font-bold !text-purple-600">{articles.length}</div>
									<div className="!text-sm !text-gray-500">Articles</div>
								</div>
								<div className="!text-center">
									<div className="!text-2xl !font-bold !text-pink-600">
										<BookOpen className="!w-6 !h-6 !mx-auto" />
									</div>
									<div className="!text-sm !text-gray-500">Author</div>
								</div>
							</div>
						</div>

						{/* Action Button */}
						<div className="!flex-shrink-0">
							<Button
								onClick={toggleArticlesDisplay}
								size="lg"
								className="!bg-gradient-to-r !from-purple-500 !to-pink-500 hover:!from-purple-600 hover:!to-pink-600 !text-white !px-8 !py-4 !rounded-full !font-semibold !shadow-lg !shadow-purple-200/50 !transition-all !duration-300 hover:!scale-105 hover:!shadow-xl hover:!shadow-purple-300/50"
							>
								{showArticles ? (
									<>
										<ChevronUp className="!w-5 !h-5 !mr-2" />
										Hide Articles
									</>
								) : (
									<>
										<ChevronDown className="!w-5 !h-5 !mr-2" />
										View Articles
									</>
								)}
							</Button>
						</div>
					</div>
				</div>

				{/* Articles Section */}
				{showArticles && (
					<div className="!space-y-6 !animate-in !slide-in-from-bottom-4 !duration-500">
						{/* Articles Header with Sorting */}
						<div className="!bg-white/90 !backdrop-blur-xl !rounded-2xl !shadow-lg !border !border-white/60 !p-6">
							<div className="!flex !flex-col !gap-4">
								<div className="!flex !flex-col md:!flex-row !items-center !justify-between !gap-4">
									<div className="!flex !items-center !gap-3">
										<BookOpen className="!w-6 !h-6 !text-purple-600" />
										<h2 className="!text-2xl !font-bold !text-gray-800">
											Articles by {author.username}
										</h2>
										<Badge variant="secondary" className="!bg-purple-100 !text-purple-700">
											{sortedArticles.length} of {articles.length} {articles.length === 1 ? 'article' : 'articles'}
										</Badge>
									</div>
									
									{articles.length > 0 && (
										<Button
											onClick={toggleSortOrder}
											variant="outline"
											className="!flex !items-center !gap-2 !border-purple-200 !text-purple-600 hover:!bg-purple-50"
										>
											<Calendar className="!w-4 !h-4" />
											{sortOrder === 'desc' ? (
												<>
													<SortDesc className="!w-4 !h-4" />
													Newest First
												</>
											) : (
												<>
													<SortAsc className="!w-4 !h-4" />
													Oldest First
												</>
											)}
										</Button>
									)}
								</div>
								
								{articles.length > 0 && (
									<div className="!flex !flex-col sm:!flex-row !items-center !gap-3">
										<span className="!text-sm !font-medium !text-gray-600">Filter by category:</span>
										<div className="!flex-1 !max-w-xs">
											<Combobox
												options={categoryOptions}
												value={categoryFilter}
												onValueChange={setCategoryFilter}
												placeholder="All categories"
												searchPlaceholder="Search categories..."
												emptyText="No categories found"
												clearable={true}
												className="!w-full !text-sm !border-purple-200 hover:!border-purple-300 focus:!border-purple-400"
											/>
										</div>
										{categoryFilter && (
											<Button
												onClick={() => setCategoryFilter('')}
												variant="outline"
												size="sm"
												className="!text-xs !border-purple-200 !text-purple-600 hover:!bg-purple-50"
											>
												Clear filter
											</Button>
										)}
									</div>
								)}
							</div>
						</div>

						{/* Articles Grid */}
						{(() => {
							console.log('=== RENDER DEBUG ===');
							console.log('sortedArticles.length in render:', sortedArticles.length);
							console.log('articles.length in render:', articles.length);
							console.log('sortedArticles in render:', sortedArticles.map(a => a.title));
							return null;
						})()}
						{sortedArticles.length > 0 ? (
							<div className="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-6">
								{sortedArticles.map(article => (
									<div
										key={article.id}
										className="!group !bg-white/90 !backdrop-blur-xl !rounded-2xl !shadow-lg !border !border-white/60 !overflow-hidden !transition-all !duration-300 hover:!shadow-xl hover:!shadow-purple-100/50 hover:!scale-[1.02]"
									>
										{/* Article Cover */}
										<div className="!relative !h-48 !overflow-hidden">
											{article.imageUrl ? (
												<ArticleCover 
													article={article}
													className="!w-full !h-full !object-cover !transition-transform !duration-300 group-hover:!scale-110"
												/>
											) : (
												<div className="!w-full !h-full !bg-gradient-to-br !from-purple-400 !to-pink-400 !flex !items-center !justify-center">
													<BookOpen className="!w-12 !h-12 !text-white/70" />
												</div>
											)}
											
											{/* Category badge */}
											<div className="!absolute !top-4 !right-4 !bg-white/90 !backdrop-blur-sm !px-3 !py-1 !rounded-full !text-xs !font-medium !text-gray-700 !shadow-sm !flex !items-center !gap-1">
												<Tag className="!w-3 !h-3" />
												{article.category || 'General'}
											</div>
											
											{/* Overlay */}
											<div className="!absolute !inset-0 !bg-gradient-to-t !from-black/20 !to-transparent !opacity-0 group-hover:!opacity-100 !transition-opacity !duration-300"></div>
										</div>

										{/* Article Content */}
										<div className="!p-6">
											<div className="!flex !items-center !gap-2 !text-sm !text-gray-500 !mb-3">
												<Calendar className="!w-4 !h-4" />
												{formatDateTimeToMin(article.createdDate || article.createdAt || '')}
											</div>
											
											<h3 className="!text-xl !font-semibold !text-gray-800 !mb-3 !line-clamp-2 group-hover:!text-purple-700 !transition-colors !duration-200">
												{article.title}
											</h3>
											
											<div className="!text-gray-600 !text-sm !leading-relaxed !mb-4 !line-clamp-3">
												<LexicalContentRenderer 
													content={extractSmartSummary(article.content || '')}
													className="!border-none !bg-transparent !text-inherit"
												/>
											</div>

											<div className="!flex !items-center !justify-between !pt-4 !border-t !border-gray-100">
												<span className="!text-sm !text-gray-500">Click to read</span>
												<div className="!w-8 !h-8 !rounded-full !bg-purple-100 !flex !items-center !justify-center group-hover:!bg-purple-200 !transition-colors !duration-200">
													<ChevronDown className="!w-4 !h-4 !text-purple-600 !rotate-[-90deg]" />
												</div>
											</div>
										</div>

										{/* Clickable Link Overlay */}
										<a 
											href={`/public/articles/${article.id}`}
											className="!absolute !inset-0 !z-10"
											aria-label={`Read article: ${article.title}`}
										/>
									</div>
								))}
							</div>
						) : (
							<div className="!bg-white/90 !backdrop-blur-xl !rounded-2xl !shadow-lg !border !border-white/60 !p-12 !text-center">
								<div className="!text-6xl !mb-6">📝</div>
								<h3 className="!text-xl !font-semibold !text-gray-700 !mb-2">No articles yet</h3>
								<p className="!text-gray-500">This author hasn't published any articles.</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default AuthorItem; 