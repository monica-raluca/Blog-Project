import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { fetchAllArticles } from '../api/ArticlesApi';

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


	return (
        <>
        
        <div className='articles'>
			{articles.map(article => (
				<div className='article' key={article.id}>
					<NavLink className='title' to={`/articles/${article.id}`}>
						{article.title}
					</NavLink>
					<div className='summary'>
						{article.summary}
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