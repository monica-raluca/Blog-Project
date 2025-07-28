import { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles } from '../api/ArticlesApi';
// import { ChronoUnit } from '@js-joda/root/packages/core/src/temporal/ChronoUnit.js';
import { ChronoUnit } from '@js-joda/core';
import { ArticleControlsContext } from '../layouts/Layout';

import '../format/Articles.css';

export default function Articles() {
	const {
		filtersInput, setFiltersInput, filters, setFilters,
		sortCriteria, setSortCriteria, pageSize, setPageSize, pageIndex, setPageIndex, sizeInput, setSizeInput
	} = useContext(ArticleControlsContext);
	const [articles, setArticles] = useState([]);
	const navigate = useNavigate();
	const [showBottomBar, setShowBottomBar] = useState(false);
	const lastArticleRef = useRef(null);

    useEffect(() => {
        fetchAllArticles({
            filters,
            sortCriteria,
            size: pageSize,
            from: pageIndex
        }).then(setArticles)
        .catch(err => {
            if (err.message && err.message.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (err.message && err.message.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
        });
    }, [filters, sortCriteria, pageSize, pageIndex, navigate]);

	useEffect(() => {
		const observer = new window.IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setShowBottomBar(true);
				else setShowBottomBar(false);
			},
			{ threshold: 0.1 }
		);
		if (lastArticleRef.current) observer.observe(lastArticleRef.current);
		return () => observer.disconnect();
	}, [articles]);

    function formatDateTimeToMin(dateStr) {
		const d = new Date(dateStr);
		return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
	}

    // Pagination controls for bottom bar
    const currentPage = pageIndex + 1;
    const totalPages = 50; // TODO: Replace with real total pages if available
    const goToPrev = () => setPageIndex(Math.max(0, pageIndex - 1));
    const goToNext = () => setPageIndex(pageIndex + 1); // Should check max page if available
    const handlePageInput = (e) => {
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
							<span>Created by <NavLink to={`/users/${article.author.id}`}>{article.author.username}</NavLink> at {formatDateTimeToMin(article.createdDate)}</span>
                            {(article.author.username !== article.editor.username ||
                            formatDateTimeToMin(article.createdDate) !== formatDateTimeToMin(article.updatedDate)) &&
                            <span>Edited by <NavLink to={`/users/${article.editor.id}`}>{article.editor.username}</NavLink> at {formatDateTimeToMin(article.updatedDate)}</span>}
						</div>
						<div className='article-body'>
							{article.summary}
						</div>
						<NavLink className='read-more-btn' to={`/articles/${article.id}`}>
							Read More
						</NavLink>
					</div>
				</div>
			))}
		</div>
        <div className={`bottom-pagination-bar-wrapper${showBottomBar ? ' visible' : ''}`}>
          <div className="bottom-pagination-bar">
            <button className="topbar-btn" onClick={goToPrev} disabled={pageIndex === 0}>&lt;</button>
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
            <button className="topbar-btn" onClick={goToNext} /*disabled={currentPage === totalPages}*/>&gt;</button>
          </div>
        </div>
        </>
		

        
	);
}