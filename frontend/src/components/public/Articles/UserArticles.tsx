import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { ChronoUnit } from '@js-joda/core';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';
import { Button } from '../../../../components/ui/button';
import TopBar from '../../../layouts/TopBar';
import LexicalContentRenderer from '../../ui/LexicalContentRenderer';

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
        <div className="!w-full !max-w-none !mx-auto !pt-14 !pb-10 !px-4">
			{articles.map((article, idx) => (
				<div
					className="!flex !items-start !bg-white !rounded-2xl !shadow-lg !shadow-gray-100/50 !mx-auto !mb-11 !p-0 !relative !max-w-[1100px] !w-full !transition-all !duration-300 hover:!shadow-xl hover:!shadow-purple-100/30 hover:!scale-[1.01] !border !border-gray-100/50"
					key={article.id}
					ref={idx === articles.length - 1 ? lastArticleRef : null}
				>
					<div className="!w-2 !min-w-[8px] !bg-gradient-to-b !from-purple-600 !via-pink-500 !to-rose-500 !rounded-l-2xl !my-7 !mr-7 !h-[80%] !shadow-lg !shadow-purple-200/30"></div>
					<div className="!flex-1 !py-8 !pr-7 !flex !flex-col !min-w-0">
						<div className="!text-2xl !md:!text-4xl !font-bold !text-gray-800 !mb-3 !tracking-wide !leading-tight">
							{article.title}
						</div>
						<div className="!text-sm !md:!text-base !text-gray-600 !mb-5 !flex !flex-col !gap-1 !italic">
							<span>
								Created by{' '}
								<NavLink 
									to={`/public/users/${article.author?.id}`}
									className="!text-purple-600 !font-semibold hover:!text-purple-700 !transition-colors !duration-200 !no-underline hover:!underline"
								>
									{article.author?.username}
								</NavLink>{' '}
								at {formatDateTimeToMin(article.createdDate || article.createdAt || '')}
							</span>
                            {(article.author?.username !== article.editor?.username ||
                            formatDateTimeToMin(article.createdDate || article.createdAt || '') !== formatDateTimeToMin(article.updatedDate || article.updatedAt || '')) &&
                            <span>
								Edited by{' '}
								<NavLink 
									to={`/public/users/${article.editor?.id}`}
									className="!text-purple-600 !font-semibold hover:!text-purple-700 !transition-colors !duration-200 !no-underline hover:!underline"
								>
									{article.editor?.username}
								</NavLink>{' '}
								at {formatDateTimeToMin(article.updatedDate || article.updatedAt || '')}
							</span>}
						</div>
						<div className="!text-base !md:!text-lg !text-gray-700 !mb-5 !leading-relaxed !break-words !max-w-[900px]">
							<LexicalContentRenderer 
								content={article.summary || article.content?.substring(0, 300) + '...' || ''}
								className="!border-none !bg-transparent !text-sm"
							/>
						</div>
						<NavLink 
							className="!self-start !px-7 !py-3 !bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !rounded-full !text-base !font-medium !no-underline !shadow-lg !shadow-purple-200/40 hover:!shadow-xl hover:!shadow-purple-300/50 hover:!scale-105 hover:!from-purple-700 hover:!to-pink-700 !transition-all !duration-300 !ease-out !mt-2"
							to={`/public/articles/${article.id}`}
						>
							Read More
						</NavLink>
					</div>
				</div>
			))}
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