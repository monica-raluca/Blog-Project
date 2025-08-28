import React, { useEffect, useState, useContext, useRef } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router';
import { fetchAllArticles, deleteArticle } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { ArticleControlsContext } from '../../../layouts/Layout';
import { Article } from '../../../api/types';
import LexicalContentRenderer from '../../ui/LexicalContentRenderer';
import { extractSmartSummary } from '../../../utils/contentUtils';

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
import { Tag, Search, SortAsc, SortDesc, Filter } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { getSavedCategories, cleanupCategory } from '../../../utils/categoryUtils';
// CategoryInput import removed - using Combobox instead

// Sort field options
const SORT_FIELDS = [
	{ label: 'Date', value: 'createdDate' },
	{ label: 'Title', value: 'title' },
	{ label: 'Author', value: 'author' },
];

// Page size options
const PAGE_SIZES = [5, 10, 20, 50];
const PAGE_SIZE_OPTIONS: ComboboxOption[] = PAGE_SIZES.map(size => ({
	value: size.toString(),
	label: `${size} per page`,
}));

const AdminArticles: React.FC = () => {
	const context = useContext(ArticleControlsContext);
	const [searchParams] = useSearchParams();
	
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
	const [availableCategories] = useState<string[]>(getSavedCategories());

	// Handle URL parameters for filtering
	useEffect(() => {
		const authorParam = searchParams.get('author');
		if (authorParam) {
			setFiltersInput(prev => ({ ...prev, author: authorParam }));
			setFilters(prev => ({ ...prev, author: authorParam }));
		}
	}, [searchParams, setFiltersInput, setFilters]);

	// Convert categories to combobox options
	const categoryOptions: ComboboxOption[] = [
		{ value: '', label: 'All categories' },
		...availableCategories.map(cat => ({ value: cat, label: cat }))
	];

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



	const handleDelete = async (articleId: string): Promise<void> => {
		if (!window.confirm('Are you sure you want to delete this article?') || !token) return;

		try {
			// Find the article to get its category before deletion
			const articleToDelete = articles.find(article => article.id === articleId);
			const categoryToClean = articleToDelete?.category;
			
			await deleteArticle(articleId, token);
			
			// Reload articles after deletion
			const response = await fetchAllArticles({
				filters,
				sortCriteria,
				size: pageSize,
				from: pageIndex
			});
			
			const updatedArticles = Array.isArray(response) ? response : response.articles || [];
			setArticles(updatedArticles);
			
			// Clean up category if no other articles use it
			if (categoryToClean) {
				cleanupCategory(categoryToClean, updatedArticles);
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

	// Control handlers
	const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
		setFiltersInput({ ...filtersInput, [e.target.name]: e.target.value });
	};

	const applyFilters = (): void => setFilters(filtersInput);

	const clearFilters = (): void => {
		setFiltersInput({ title: '', author: '', category: '' });
		setFilters({ title: '', author: '', category: '' });
	};

	const handleSortToggle = (field: string): void => {
		const exists = sortCriteria.find(sc => sc.field === field);
		let updated;
		if (exists) {
			// Toggle direction or remove
			if (exists.direction === 'ASC') {
				updated = sortCriteria.map(sc =>
					sc.field === field ? { ...sc, direction: 'DESC' as const } : sc
				);
			} else {
				updated = sortCriteria.filter(sc => sc.field !== field);
			}
		} else {
			updated = [...sortCriteria, { field, direction: 'ASC' as const }];
		}
		setSortCriteria(updated);
	};

	const handlePageSizeChange = (value: string): void => {
		setPageSize(Number(value));
		setPageIndex(0);
	};

	// Pagination handlers
	const currentPage = pageIndex + 1;
	const goToPrev = (): void => setPageIndex(Math.max(0, pageIndex - 1));
	const goToNext = (): void => setPageIndex(pageIndex + 1);
	
	const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
		let val = parseInt(e.target.value, 10);
		if (!isNaN(val) && val > 0) setPageIndex(val - 1);
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
			{/* Header */}
			<div 
				className="flex justify-between items-center !mb-6 sticky top-0 z-40 !py-6 !px-4 !rounded-lg"
				style={{
					background: 'rgba(255, 255, 255, 0.95)',
					backdropFilter: 'blur(12px)',
					border: '1px solid rgba(255, 255, 255, 0.2)',
					boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 4px 16px rgba(0, 0, 0, 0.05)',
					marginTop: '-8px',
					marginLeft: '-8px',
					marginRight: '-8px'
				}}
			>
				<h2 
					className="!m-0 !text-2xl !font-bold"
					style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text'
					}}
				>
					Articles Management
				</h2>
				<Button 
					className="bg-[#007bff] hover:bg-[#0056b3] text-white text-sm px-3 py-2 rounded transition-colors"
					onClick={() => navigate('/admin/articles/create')}
				>
					Create New Article
				</Button>
			</div>

			{/* Controls Section */}
			<div className="bg-white rounded-lg border border-gray-200 p-4 mb-6 space-y-4">
				{/* Sort Controls */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<SortAsc className="w-4 h-4 text-gray-500" />
						<Label className="text-sm font-medium text-gray-700">Sort by:</Label>
					</div>
					{SORT_FIELDS.map(field => {
						const active = sortCriteria.find(sc => sc.field === field.value);
						return (
							<Button
								key={field.value}
								onClick={() => handleSortToggle(field.value)}
								variant={active ? "default" : "outline"}
								size="sm"
								className={`text-xs ${active ? 'bg-[#007bff] text-white' : 'text-gray-600 border-gray-300'}`}
							>
								{field.label}
								{active && (
									<span className="ml-1">
										{active.direction === 'ASC' ? '↑' : '↓'}
									</span>
								)}
							</Button>
						);
					})}
				</div>

				{/* Filter Controls */}
				<div className="flex flex-wrap items-center gap-3">
					<div className="flex items-center gap-2">
						<Filter className="w-4 h-4 text-gray-500" />
						<Label className="text-sm font-medium text-gray-700">Filter:</Label>
					</div>
					<input
						type="text"
						name="title"
						placeholder="Title..."
						value={filtersInput.title || ''}
						onChange={handleFilterChange}
						className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
					/>
					<input
						type="text"
						name="author"
						placeholder="Author..."
						value={filtersInput.author || ''}
						onChange={handleFilterChange}
						className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#007bff] focus:border-transparent"
					/>
					<Combobox
						options={categoryOptions}
						value={filtersInput.category || ''}
						onValueChange={(value) => setFiltersInput({ ...filtersInput, category: value })}
						placeholder="Category..."
						searchPlaceholder="Search categories..."
						clearable={true}
						className="!px-3 !py-1.5 !text-sm !border !border-gray-300 !rounded-md focus:!outline-none focus:!ring-2 focus:!ring-[#007bff] focus:!border-transparent !w-40"
					/>
					<Button
						onClick={applyFilters}
						size="sm"
						className="bg-[#007bff] hover:bg-[#0056b3] text-white text-xs px-4"
					>
						Apply
					</Button>
					<Button
						onClick={clearFilters}
						variant="outline"
						size="sm"
						className="text-gray-600 border-gray-300 text-xs px-4"
					>
						Clear
					</Button>
				</div>

				{/* Page Size Control */}
				<div className="flex items-center gap-3">
					<Label className="text-sm font-medium text-gray-700">Show:</Label>
					<Combobox
						options={PAGE_SIZE_OPTIONS}
						value={pageSize.toString()}
						onValueChange={handlePageSizeChange}
						placeholder="Page size"
						className="w-32"
					/>
				</div>
			</div>

			<div className="rounded-md border bg-card overflow-hidden">
				<Table>
					<TableHeader>
						<TableRow className="hover:bg-transparent border-b bg-muted/50">
							<TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
							<TableHead className="font-semibold text-foreground">Title</TableHead>
							<TableHead className="w-[150px] font-semibold text-foreground">Author</TableHead>
							<TableHead className="w-[120px] font-semibold text-foreground">Category</TableHead>
							<TableHead className="w-[140px] font-semibold text-foreground">Created Date</TableHead>
							<TableHead className="w-[140px] font-semibold text-foreground">Last Updated</TableHead>
							<TableHead className="w-[120px] font-semibold text-foreground text-center">Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{articles.length === 0 ? (
							<TableRow>
								<TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
												{article.content && (
													<div className="text-sm text-muted-foreground line-clamp-2">
														<LexicalContentRenderer 
															content={extractSmartSummary(article.content || '')}
															className="!border-none !bg-transparent !text-xs"
														/>
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
										<TableCell className="text-sm">
											<Badge variant="outline" className="text-xs flex items-center gap-1 w-fit">
												<Tag className="w-3 h-3" />
												{article.category || 'General'}
											</Badge>
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
