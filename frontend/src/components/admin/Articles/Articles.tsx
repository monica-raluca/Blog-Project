import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles, deleteArticle } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';

import './AdminArticles.css';

const Articles: React.FC = () => {
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
	const lastArticleRef = useRef<HTMLTableRowElement>(null);
	const { token, currentUser } = useAuth();

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
    const totalPages = 50; // TODO: Replace with real total pages if available
    const goToPrev = (): void => setPageIndex(Math.max(0, pageIndex - 1));
    const goToNext = (): void => setPageIndex(pageIndex + 1); // Should check max page if available
    
	const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
      let val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) setPageIndex(val - 1);
    };

	const handleDelete = async (articleId: string): Promise<void> => {
		if (!window.confirm('Are you sure you want to delete this article?') || !token) return;

		try {
			await deleteArticle(articleId, token);
			// Reload articles after deletion
			const response = await fetchAllArticles({
				filters,
				sortCriteria,
				size: pageSize,
				from: pageIndex
			});
			
			if (Array.isArray(response)) {
				setArticles(response);
			} else {
				setArticles(response.articles || []);
			}
		} catch (err) {
			const errorMessage = (err as Error).message || 'An error occurred';
			if (errorMessage.toLowerCase().includes('forbidden')) {
				navigate('/forbidden');
			} else {
				navigate('/error');
			}
		}
	};

	const handleEdit = (articleId: string): void => {
		navigate(`/articles/${articleId}/edit`);
	};

	const handleView = (articleId: string): void => {
		navigate(`/articles/${articleId}`);
	};

	return (
        <>
        <div className="admin-articles-container">
			<div className="admin-header">
				<h2>Articles Management</h2>
				<button 
					className="admin-btn admin-btn-primary"
					onClick={() => navigate('/articles/create')}
				>
					Create New Article
				</button>
			</div>

			<div className="admin-table-container">
				<table className="admin-table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Title</th>
							<th>Author</th>
							<th>Created Date</th>
							<th>Last Updated</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{articles.length === 0 ? (
							<tr>
								<td colSpan={6} className="admin-no-data">
									No articles found
								</td>
							</tr>
						) : (
							articles.map((article, idx) => {
								const createdAt = article.createdDate || article.createdAt || '';
								const updatedAt = article.updatedDate || article.updatedAt || createdAt;
								const showEdited = (
									article.author?.username !== article.editor?.username ||
									formatDateTimeToMin(createdAt) !== formatDateTimeToMin(updatedAt)
								);
								
								return (
									<tr 
										key={article.id}
										ref={idx === articles.length - 1 ? lastArticleRef : null}
									>
										<td className="admin-id-cell">
											{article.id?.substring(0, 8)}...
										</td>
										<td className="admin-title-cell">
											<div className="article-title-truncated">
												{article.title}
											</div>
											{article.summary && (
												<div className="article-summary-truncated">
													{article.summary.substring(0, 100)}...
												</div>
											)}
										</td>
										<td className="admin-author-cell">
											<NavLink to={`/users/${article.author?.id}`}>
												{article.author?.username || 'Unknown'}
											</NavLink>
										</td>
										<td className="admin-date-cell">
											{formatDateTimeToMin(createdAt)}
										</td>
										<td className="admin-date-cell">
											{showEdited ? (
												<div>
													<div>{formatDateTimeToMin(updatedAt)}</div>
													<div className="editor-info">
														by {article.editor?.username}
													</div>
												</div>
											) : (
												'-'
											)}
										</td>
										<td className="admin-actions-cell">
											<div className="admin-action-buttons">
												<button
													onClick={() => handleView(article.id!)}
													className="admin-btn admin-btn-sm admin-btn-secondary"
													title="View Article"
												>
													View
												</button>
												{(hasRole("ADMIN") || article.author?.username === currentUser) && (
													<button
														onClick={() => handleEdit(article.id!)}
														className="admin-btn admin-btn-sm admin-btn-primary"
														title="Edit Article"
													>
														Edit
													</button>
												)}
												{(hasRole("ADMIN") || article.author?.username === currentUser) && (
													<button
														onClick={() => handleDelete(article.id!)}
														className="admin-btn admin-btn-sm admin-btn-danger"
														title="Delete Article"
													>
														Delete
													</button>
												)}
											</div>
										</td>
									</tr>
								);
							})
						)}
					</tbody>
				</table>
			</div>
		</div>

        <div className={`admin-pagination-wrapper${showBottomBar ? ' visible' : ''}`}>
          <div className="admin-pagination">
            <button 
				className="admin-btn admin-btn-secondary" 
				onClick={goToPrev} 
				disabled={pageIndex === 0}
			>
				Previous
			</button>
            <span className="admin-page-info">
              Page <input
                type="number"
                min="1"
                value={currentPage}
                onChange={handlePageInput}
                className="admin-page-input"
              />
            </span>
            <button 
				className="admin-btn admin-btn-secondary" 
				onClick={goToNext}
			>
				Next
			</button>
          </div>
        </div>
        </>
	);
};

export default Articles;
