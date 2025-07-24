import { useEffect, useState, useContext } from 'react';
import { NavLink } from 'react-router';
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

    useEffect(() => {
        fetchAllArticles({
            filters,
            sortCriteria,
            size: pageSize,
            from: pageIndex
        }).then(setArticles)
        .catch(err => console.error("Error loading articles:", err));
    }, [filters, sortCriteria, pageSize, pageIndex]);

    function formatDateTimeToMin(dateStr) {
		const d = new Date(dateStr);
		return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
	}

	return (
        <>
        
        <div className='articles-container'>
			{articles.map(article => (
				<div className='article-item' key={article.id}>
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

        
        </>
		

        
	);
}