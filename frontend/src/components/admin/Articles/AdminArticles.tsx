import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllArticles, deleteArticle } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';

import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const AdminArticles: React.FC = () => {
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
		navigate(`/admin/articles/${articleId}/edit`);
	};

	const handleView = (articleId: string): void => {
		navigate(`/admin/articles/${articleId}`);
	};

	return (
        <>
		 <div className="!p-5 max-w-full overflow-x-auto">
			<div className="flex justify-between items-center !mb-5 !pb-2.5 !border-b border-gray-300">
				<h2 className="m-0 text-[#333] text-2xl font-semibold">Articles Management</h2>
				<Button 
					className="bg-[#007bff] hover:bg-[#0056b3] text-white text-sm px-3 py-2 rounded transition-colors"
					onClick={() => navigate('/admin/articles/create')}
				>
					Create New Article
				</Button>
			</div>

			<div className="rounded-md border bg-card overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-b bg-muted/50">
							<TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
							<TableHead className="font-semibold text-foreground">Title</TableHead>
							<TableHead className="w-[150px] font-semibold text-foreground">Author</TableHead>
							<TableHead className="w-[140px] font-semibold text-foreground">Created Date</TableHead>
							<TableHead className="w-[140px] font-semibold text-foreground">Last Updated</TableHead>
							<TableHead className="w-[120px] font-semibold text-foreground text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{articles.length === 0 ? (
							<TableRow>
								<TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
									No articles found
								</TableCell>
							</TableRow>
						) : (
							articles.map((article, idx) => {
								const createdAt = article.createdDate || article.createdAt || '';
								const updatedAt = article.updatedDate || article.updatedAt || createdAt;
								const showEdited = (
									article.author?.username !== article.editor?.username ||
									formatDateTimeToMin(createdAt) !== formatDateTimeToMin(updatedAt)
								);
								
								return (
									<TableRow 
										key={article.id}
										ref={idx === articles.length - 1 ? lastArticleRef : null}
										className="group hover:bg-muted/50 transition-colors"
									>
										<TableCell className="font-mono text-xs text-muted-foreground">
											{article.id?.substring(0, 8)}...
										</TableCell>
										<TableCell className="max-w-[400px]">
											<div className="space-y-1">
												<div className="font-medium truncate">
													{article.title}
												</div>
												{article.summary && (
													<div className="text-sm text-muted-foreground line-clamp-2">
														{article.summary.length > 100 
															? article.summary.substring(0, 100) + '...'
															: article.summary}
													</div>
												)}
											</div>
										</TableCell>
										<TableCell>
											<NavLink 
												to={`/admin/users/${article.author?.id}`}
												className="text-primary hover:underline"
											>
												{article.author?.username || 'Unknown'}
											</NavLink>
										</TableCell>
										<TableCell className="text-sm text-muted-foreground">
											{formatDateTimeToMin(createdAt)}
										</TableCell>
										<TableCell className="text-sm">
											{showEdited ? (
												<div className="space-y-1">
													<div className="text-muted-foreground">
														{formatDateTimeToMin(updatedAt)}
													</div>
													<Badge variant="outline" className="text-xs">
														by {article.editor?.username}
													</Badge>
												</div>
											) : (
												<span className="text-muted-foreground">-</span>
											)}
										</TableCell>
										<TableCell className="text-center">
											<div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													onClick={() => handleView(article.id!)}
													variant="outline"
													size="sm"
													title="View Article"
												>
													View
												</Button>
												{(hasRole("ADMIN") || article.author?.username === currentUser) && (
													<Button
														onClick={() => handleEdit(article.id!)}
														variant="default"
														size="sm"
														title="Edit Article"
													>
														Edit
													</Button>
												)}
												{(hasRole("ADMIN") || article.author?.username === currentUser) && (
													<Button
														onClick={() => handleDelete(article.id!)}
														variant="destructive"
														size="sm"
														title="Delete Article"
													>
														Delete
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								);
							})
						)}
					</TableBody>
				</Table>
			</div>
		</div>

        {/* <div className={`admin-pagination-wrapper${showBottomBar ? ' visible' : ''}`}> */}
		<div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#dee2e6] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out z-[100] ${showBottomBar ? 'translate-y-0' : 'translate-y-full'}`}>
          <div >
            <Pagination>
              <PaginationContent className="flex justify-center items-center gap-3 p-3">
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToPrev();
                    }}
                    style={{ 
                      pointerEvents: pageIndex === 0 ? 'none' : 'auto',
                      opacity: pageIndex === 0 ? 0.5 : 1 
                    }}
                  />
                </PaginationItem>
                <PaginationItem>
                  <span className="flex items-center gap-1 text-sm text-gray-700">
                    Page <input
                      type="number"
                      min="1"
                      value={currentPage}
                      onChange={handlePageInput}
                      className="w-[60px] px-1.5 py-1 border border-[#ced4da] rounded text-center"
                    />
                  </span>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      goToNext();
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        </>
	);
};

export default AdminArticles;
