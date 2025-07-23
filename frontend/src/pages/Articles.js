import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { fetchAllArticles } from '../api/ArticlesApi';
// import { ChronoUnit } from '@js-joda/root/packages/core/src/temporal/ChronoUnit.js';
import { ChronoUnit } from '@js-joda/core';

import '../format/Articles.css';

export default function Articles() {
	const [articles, setArticles] = useState([]);
    const [filters, setFilters] = useState({
        title: '',
        author: ''
    });
    const [filtersInput, setFiltersInput] = useState({
        title: '',
        author: ''
    });

    const [sortCriteria, setSortCriteria] = useState([
        { field: 'createdDate', direction: 'desc' }
    ]);
    const [pageSize, setPageSize] = useState(10);
    const [pageIndex, setPageIndex] = useState(0);
    const [sizeInput, setSizeInput] = useState(10);

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

        
        <div className="filter-panel">
            <input
                placeholder="Title"
                value={filtersInput.title}
                onChange={(e) => setFiltersInput(f => ({ ...f, title: e.target.value }))}
            />
            <input
                placeholder="Author"
                value={filtersInput.author}
                onChange={(e) => setFiltersInput(f => ({ ...f, author: e.target.value }))}
            />
            {/* <input
                type="date"
                placeholder="Created after"
                onChange={(e) => setFilters(f => ({ ...f, createdAfter: e.target.value }))}
            />
            <input
                type="date"
                placeholder="Created before"
                onChange={(e) => setFilters(f => ({ ...f, createdBefore: e.target.value }))}
            /> */}
            <button onClick={() => setFilters(filtersInput)}>Apply filters</button>
        </div>


        <select
            onChange={(e) => {
                const field = e.target.value;
                setSortCriteria([{ field, direction: 'asc' }]);
            }}
        >
            <option value="createdDate">Created Date</option>
            <option value="title">Title</option>
            <option value="author">Author</option>
        </select>

        <button
            onClick={() => {
                setSortCriteria(sc => sc.map(c => ({
                    ...c,
                    direction: c.direction === 'asc' ? 'desc' : 'asc'
                })));
            }}
        >
            Toggle Sort Direction
        </button>

        <div className="pagination">
            <button disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)}>Previous</button>
            <span>Page {pageIndex + 1}</span>
            <button onClick={() => setPageIndex(pageIndex + 1)}>Next</button>
        </div>

         <div className="pagination">
            <input
                type="text"
                placeholder="Enter number of articles per page"
                onChange={(e) => setSizeInput(e.target.value)}
            />
            <button onClick={() => setPageSize(sizeInput)}>Change page size</button>
        </div>

        </>
		

        
	);
}