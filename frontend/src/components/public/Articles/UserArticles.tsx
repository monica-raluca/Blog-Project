import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { ChronoUnit } from '@js-joda/core';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';
import { Button } from '../../../../components/ui/button';
import TopBar from '../../../layouts/TopBar';
import LexicalContentRenderer from '../../ui/LexicalContentRenderer';
import MagicalAvatar from '../../ui/MagicalAvatar';
import ArticleCover from '../../ui/ArticleCover';
import { extractSmartSummary } from '../../../utils/contentUtils';
import '../../../styles/magical-cards.css';

const UserArticles: React.FC = () => {
	const context = useContext(ArticleControlsContext);
	
	if (!context) {
		throw new Error('Articles must be used within ArticleControlsContext');
	}

	const {
		filtersInput, setFiltersInput, filters, setFilters,
		sortCriteria, setSortCriteria, pageSize, setPageSize, pageIndex, setPageIndex, sizeInput, setSizeInput
	} = context;
	
	const [articles, setArticles] = useState<Article[]>([]);
	const navigate = useNavigate();
	const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
	const lastArticleRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchAllArticles({
            filters,
            sortCriteria,
            size: pageSize,
            from: pageIndex
        }).then(response => {
			// Handle both direct array and object with articles property
			if (Array.isArray(response)) {
				setArticles(response);
			} else {
				setArticles(response.articles || []);
			}
		})
        .catch(err => {
			const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
        });
    }, [filters, sortCriteria, pageSize, pageIndex, navigate]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setShowBottomBar(true);
				else setShowBottomBar(false);
			},
			{ threshold: 0.1 }
		);
		if (lastArticleRef.current) observer.observe(lastArticleRef.current);
		return () => observer.disconnect();
	}, [articles]);

    function formatDateTimeToMin(dateStr: string): string {
		const d = new Date(dateStr);
		return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
	}

    // Pagination controls for bottom bar
    const currentPage = pageIndex + 1;
    const totalPages = 50;
    const goToPrev = (): void => setPageIndex(Math.max(0, pageIndex - 1));
    const goToNext = (): void => setPageIndex(pageIndex + 1);
    
	const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      let val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) setPageIndex(val - 1);
    };

	return (
        <>
        <div className="!min-h-screen !relative magical-bg">
			{/* Magical background elements */}
			<div className="!absolute !inset-0 !overflow-hidden !pointer-events-none">
				<div className="!absolute !top-20 !left-10 !w-2 !h-2 !bg-purple-400/30 !rounded-full sparkle-animation"></div>
				<div className="!absolute !top-40 !right-20 !w-1 !h-1 !bg-blue-400/30 !rounded-full sparkle-animation" style={{animationDelay: '1s'}}></div>
				<div className="!absolute !bottom-40 !left-1/4 !w-1.5 !h-1.5 !bg-pink-400/30 !rounded-full sparkle-animation" style={{animationDelay: '2s'}}></div>
				<div className="!absolute !top-1/3 !right-1/3 !w-1 !h-1 !bg-indigo-400/30 !rounded-full sparkle-animation" style={{animationDelay: '0.5s'}}></div>
			</div>

			<div className="!w-full !max-w-7xl !mx-auto !pt-14 !pb-10 !px-6 !relative">
				{/* Page title with magical styling */}
				<div className="!text-center !mb-12">
					<h1 className="!text-4xl !font-bold !text-gray-800 !mb-4">Chronicles Collection</h1>
					<p className="!text-gray-600 !text-lg">Discover tales from our community of storytellers</p>
					<div className="!w-24 !h-1 !bg-gradient-to-r !from-purple-500 !to-blue-500 !mx-auto !mt-4 !rounded-full"></div>
				</div>

				{/* Grid layout for cards */}
				<div className="!grid !grid-cols-1 !md:!grid-cols-2 !xl:!grid-cols-3 !gap-8">
					{articles.map((article, idx) => (
						<div
							key={article.id}
							ref={idx === articles.length - 1 ? lastArticleRef : null}
							className="!group !bg-white !rounded-xl !shadow-sm hover:!shadow-xl card-hover-effect !border !border-gray-100 !overflow-hidden hover:!border-indigo-200 !cursor-pointer reveal-animation"
							onClick={() => window.location.href = `/public/articles/${article.id}`}
						>
						{/* Cover Image */}
						<div className="!relative !h-48 !w-full !overflow-hidden">
							<ArticleCover 
								article={article}
								size="lg"
								className="!w-full !h-full !rounded-none"
							/>
							{/* Elegant overlay gradient */}
							<div className="!absolute !inset-0 !bg-gradient-to-t !from-black/30 !via-transparent !to-transparent !group-hover:!from-black/40 !transition-all !duration-500"></div>
							
							{/* Floating badge */}
							<div className="!absolute !top-4 !right-4 !bg-white/90 !backdrop-blur-sm !px-3 !py-1 !rounded-full !text-xs !font-medium !text-gray-700 !shadow-sm">
								Article
							</div>
						</div>

						{/* Card Content */}
						<div className="!p-6">
							{/* Title */}
							<h3 className="!text-xl !font-semibold !text-gray-900 !mb-3 !leading-tight !line-clamp-2 !group-hover:!text-indigo-900 !transition-colors !duration-300">
								{article.title}
							</h3>

							{/* Author */}
							<div className="!flex !items-center !gap-3 !mb-4">
								<MagicalAvatar 
									user={article.author}
									size="sm"
								/>
								<div className="!min-w-0 !flex-1">
									<div className="!flex !items-center !gap-2 !text-sm">
										<NavLink 
											to={`/public/users/${article.author?.id}`}
											className="!text-gray-900 !font-medium hover:!text-indigo-600 !transition-colors !no-underline !truncate"
											onClick={(e) => e.stopPropagation()}
										>
											{article.author?.username}
										</NavLink>
									</div>
									<div className="!text-xs !text-gray-500">
										{formatDateTimeToMin(article.createdDate || article.createdAt || '')}
									</div>
								</div>
							</div>

							{/* Content Preview */}
							<div className="!text-gray-600 !text-sm !leading-relaxed !mb-4 !line-clamp-3">
								<LexicalContentRenderer 
									content={extractSmartSummary(article.content || '')}
									className="!border-none !bg-transparent !text-inherit"
								/>
							</div>

							{/* Read More Button */}
							<div className="!flex !items-center !justify-between !pt-2">
								<NavLink 
									className="!inline-flex !items-center !text-indigo-600 hover:!text-indigo-700 !text-sm !font-medium !no-underline !group-hover:!translate-x-1 !transition-all !duration-300"
									to={`/public/articles/${article.id}`}
									onClick={(e) => e.stopPropagation()}
								>
									Read more
									<svg className="!w-4 !h-4 !ml-1 !group-hover:!translate-x-1 !transition-transform !duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</NavLink>
								
								{/* Editor indicator if edited */}
								{(article.author?.username !== article.editor?.username ||
								formatDateTimeToMin(article.createdDate || article.createdAt || '') !== formatDateTimeToMin(article.updatedDate || article.updatedAt || '')) && (
									<div className="!text-xs !text-gray-400 !italic">
										Edited
									</div>
								)}
							</div>
						</div>

						{/* Subtle bottom accent */}
						<div className="!h-1 !bg-gradient-to-r !from-indigo-500 !via-purple-500 !to-pink-500 !opacity-0 !group-hover:!opacity-100 !transition-opacity !duration-500"></div>
					</div>
					))}
				</div>
			</div>
		</div>
        <div className={`!fixed !bottom-0 !left-0 !right-0 !bg-white/90 !backdrop-blur-md !border-t !border-gray-200/50 !shadow-lg !shadow-gray-100/50 !transition-all !duration-500 !ease-out !transform ${showBottomBar ? '!translate-y-0 !opacity-100' : '!translate-y-full !opacity-0'} !z-50`}>
          <div className="!flex !items-center !justify-center !gap-4 !py-4 !px-6">
            <Button 
              variant="soft" 
              size="sm" 
              onClick={goToPrev} 
              disabled={pageIndex === 0}
              className="!rounded-full !px-4 !py-2 !text-sm !font-medium !shadow-md"
            >
              ←
            </Button>
            <span className="!flex !items-center !gap-2 !text-sm !font-medium !text-gray-700">
              Page 
              <input
                type="number"
                min="1"
                value={currentPage}
                onChange={handlePageInput}
                className="!w-16 !px-3 !py-2 !text-center !text-sm !border-2 !border-gray-200 !rounded-lg !bg-white/80 !backdrop-blur-sm !transition-all !duration-200 focus:!border-purple-400 focus:!ring-2 focus:!ring-purple-100 !outline-none"
              />
              {/* / {totalPages} */}
            </span>
            <Button 
              variant="soft" 
              size="sm" 
              onClick={goToNext} 
              /*disabled={currentPage === totalPages}*/
              className="!rounded-full !px-4 !py-2 !text-sm !font-medium !shadow-md"
            >
              →
            </Button>
          </div>
        </div>
        </>
	);
};

export default UserArticles; 