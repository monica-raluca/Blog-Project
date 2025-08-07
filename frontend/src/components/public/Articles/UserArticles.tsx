import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { ChronoUnit } from '@js-joda/core';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';
import { Button } from '../../../../components/ui/button';
import TopBar from '../../../layouts/TopBar';

import '../../../format/Articles.css';

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
        <div className='articles-container'>
			{articles.map((article, idx) => (
				<div
					className='article-item'
					key={article.id}
					ref={idx === articles.length - 1 ? lastArticleRef : null}
				>
					<div className='article-ribbon'></div>
					<div className='article-content'>
						<div className='article-title'>
							{article.title}
						</div>
						<div className='article-meta'>
							<span>
								Created by{' '}
								<NavLink to={`/public/users/${article.author?.id}`}>
									{article.author?.username}
								</NavLink>{' '}
								at {formatDateTimeToMin(article.createdDate || article.createdAt || '')}
							</span>
                            {(article.author?.username !== article.editor?.username ||
                            formatDateTimeToMin(article.createdDate || article.createdAt || '') !== formatDateTimeToMin(article.updatedDate || article.updatedAt || '')) &&
                            <span>
								Edited by{' '}
								<NavLink to={`/public/users/${article.editor?.id}`}>
									{article.editor?.username}
								</NavLink>{' '}
								at {formatDateTimeToMin(article.updatedDate || article.updatedAt || '')}
							</span>}
						</div>
						<div className='article-body'>
							{article.summary}
						</div>
						<NavLink className='read-more-btn' to={`/public/articles/${article.id}`}>
							Read More
						</NavLink>
					</div>
				</div>
			))}
		</div>
        <div className={`bottom-pagination-bar-wrapper${showBottomBar ? ' visible' : ''}`}>
          <div className="bottom-pagination-bar">
            <Button variant="dreamy" size="cozy" onClick={goToPrev} disabled={pageIndex === 0}>&lt;</Button>
            <span className="topbar-page-label">
              Page <input
                type="number"
                min="1"
                value={currentPage}
                onChange={handlePageInput}
                className="topbar-page-input"
              />
              {/* / {totalPages} */}
            </span>
            <Button variant="dreamy" size="cozy" onClick={goToNext} /*disabled={currentPage === totalPages}*/>&gt;</Button>
          </div>
        </div>
        </>
	);
};

export default UserArticles; 