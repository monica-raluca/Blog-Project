import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useSearchParams } from 'react-router';
import { fetchAllComments, fetchCommentsByArticleId, deleteComment } from '../../../api/CommentApi';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { fetchUsers } from '../../../api/UsersApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { Comment, Article, UserDetail } from '../../../api/types';
import CommentItem from './CommentItem/CommentItem';
import LexicalContentRenderer from '../../ui/LexicalContentRenderer';

import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface CommentsProps {
    onEdit?: (comment: Comment) => void;
    onView?: (comment: Comment) => void;
    filterByArticleId?: string;
}

const Comments: React.FC<CommentsProps> = ({
    onEdit,
    onView,
    filterByArticleId
}) => {
    const [searchParams] = useSearchParams();
    const [comments, setComments] = useState<Comment[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [users, setUsers] = useState<UserDetail[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedArticleId, setSelectedArticleId] = useState<string>(filterByArticleId || '');
    const [authorFilter, setAuthorFilter] = useState<string>('');
    const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 20;
    
    const { token, currentUser } = useAuth();
    const navigate = useNavigate();
    const lastCommentRef = React.useRef<HTMLTableRowElement>(null);

    // Handle URL parameters for filtering
    useEffect(() => {
        const authorParam = searchParams.get('author');
        if (authorParam) {
            setAuthorFilter(authorParam);
        }
    }, [searchParams]);

    useEffect(() => {
        loadArticles();
        loadUsers();
    }, []);

    useEffect(() => {
        loadComments();
    }, [selectedArticleId, authorFilter, currentPage]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) setShowBottomBar(true);
                else setShowBottomBar(false);
            },
            { threshold: 0.1 }
        );
        if (lastCommentRef.current) observer.observe(lastCommentRef.current);
        return () => observer.disconnect();
    }, [comments]);

    const loadArticles = async (): Promise<void> => {
        try {
            const response = await fetchAllArticles({
                filters: {},
                sortCriteria: [{ field: 'title', direction: 'ASC' }],
                size: 1000,
                from: 0
            });
            
            if (Array.isArray(response)) {
                setArticles(response);
            } else {
                setArticles(response.articles || []);
            }
        } catch (err) {
            console.error('Failed to load articles:', err);
        }
    };

    const loadUsers = async (): Promise<void> => {
        try {
            if (!token) return;
            const allUsers = await fetchUsers(token);
            setUsers(allUsers);
        } catch (err) {
            console.error('Failed to load users:', err);
        }
    };

    const loadComments = async (): Promise<void> => {
        try {
            setLoading(true);
            let commentsData: Comment[];
            
            if (selectedArticleId) {
                commentsData = await fetchCommentsByArticleId(selectedArticleId);
            } else {
                commentsData = await fetchAllComments();
            }
            
            // Filter by author if specified
            if (authorFilter) {
                commentsData = commentsData.filter(comment => 
                    comment.author?.username?.toLowerCase().includes(authorFilter.toLowerCase())
                );
            }
            
            const startIndex = currentPage * pageSize;
            const endIndex = startIndex + pageSize;
            setComments(commentsData.slice(startIndex, endIndex));
            
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else if (errorMessage.toLowerCase().includes('not found')) {
                navigate('/notfound');
            } else {
                navigate('/error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (comment: Comment): Promise<void> => {
        if (!window.confirm('Are you sure you want to delete this comment?') || !token) return;

        try {
            await deleteComment(comment.article?.id!, comment.id!, token);
            await loadComments();
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            if (errorMessage.toLowerCase().includes('forbidden')) {
                navigate('/forbidden');
            } else {
                navigate('/error');
            }
        }
    };

    const handleEdit = (comment: Comment): void => {
        if (onEdit) {
            onEdit(comment);
        } else {
            navigate(`/admin/comments/${comment.id}/edit`);
        }
    };

    const handleView = (comment: Comment): void => {
        if (onView) {
            onView(comment);
        } else {
            navigate(`/admin/comments/${comment.id}`);
        }
    };

    const formatDateTimeToMin = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + 
               (d.getMonth() + 1).toString().padStart(2, '0') + '-' + 
               d.getDate().toString().padStart(2, '0') + ' ' + 
               d.getHours().toString().padStart(2, '0') + ':' + 
               d.getMinutes().toString().padStart(2, '0');
    };

    const goToPrev = (): void => setCurrentPage(Math.max(0, currentPage - 1));
    const goToNext = (): void => setCurrentPage(currentPage + 1);

    const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
        let val = parseInt(e.target.value, 10);
        if (!isNaN(val) && val > 0) setCurrentPage(val - 1);
    };

    if (loading) {
        return <div className="admin-loading">Loading comments...</div>;
    }

    // Create article options for combobox
    const articleOptions: ComboboxOption[] = [
        { value: "", label: "All Articles" },
        ...articles.map(article => ({
            value: article.id!,
            label: article.title,
        }))
    ];

    // Create author options for combobox
    const authorOptions: ComboboxOption[] = [
        { value: '', label: 'All Authors' },
        ...users.map(user => ({
            value: user.username,
            label: `${user.firstName} ${user.lastName} (@${user.username})`
        }))
    ];

    return (
        <>
        <div className="!p-[20px] max-w-full overflow-x-auto">
            <div 
				className="!mb-[20px] flex justify-between items-center gap-[16px] sticky top-0 z-40 !py-6 !px-4 !rounded-lg"
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
					className="!text-2xl !font-bold"
					style={{
						background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
						WebkitBackgroundClip: 'text',
						WebkitTextFillColor: 'transparent',
						backgroundClip: 'text'
					}}
				>
					Comments Management
				</h2>
                <Button 
                    className="rounded cursor-pointer text-xs no-underline inline-block bg-[#007bff] text-white px-3 py-2 transition-colors hover:bg-[#0056b3]"
                    onClick={() => navigate('/admin/comments/create')}
                >
                    Create New Comment
                </Button>
                <div className="!flex !gap-3">
                    <div className="!mb-[16px]">
                        <label htmlFor="article-filter" className="!font-semibold !text-[#495057] !uppercase !text-xs !mb-2">Filter by Article:</label>
                        <Combobox
                            options={articleOptions}
                            value={selectedArticleId}
                            onValueChange={(value) => {
                                setSelectedArticleId(value);
                                setCurrentPage(0);
                            }}
                            placeholder="Select article..."
                            searchPlaceholder="Search articles..."
                            className="!w-full !border !border-[#dee2e6] !rounded-lg !p-[8px] !text-sm"
                            clearable
                        />
                    </div>
                    <div className="!mb-[16px]">
                        <label htmlFor="author-filter" className="!font-semibold !text-[#495057] !uppercase !text-xs !mb-2">Filter by Author:</label>
                        <Combobox
                            options={authorOptions}
                            value={authorFilter}
                            onValueChange={(value) => {
                                setAuthorFilter(value);
                                setCurrentPage(0);
                            }}
                            placeholder="Select author..."
                            searchPlaceholder="Search authors..."
                            className="!w-full !border !border-[#dee2e6] !rounded-lg !p-[8px] !text-sm"
                            clearable
                        />
                    </div>
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent border-b bg-muted/50">
                            <TableHead className="w-[100px] font-semibold text-foreground">ID</TableHead>
                            <TableHead className="font-semibold text-foreground">Content</TableHead>
                            <TableHead className="w-[200px] font-semibold text-foreground">Article</TableHead>
                            <TableHead className="w-[120px] font-semibold text-foreground">Author</TableHead>
                            <TableHead className="w-[140px] font-semibold text-foreground">Created Date</TableHead>
                            <TableHead className="w-[140px] font-semibold text-foreground">Last Updated</TableHead>
                            <TableHead className="w-[120px] font-semibold text-foreground text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {comments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    {selectedArticleId 
                                        ? 'No comments found for this article' 
                                        : 'No comments found'
                                    }
                                </TableCell>
                            </TableRow>
                        ) : (
                            comments.map((comment, idx) => {
                                const createdAt = comment.dateCreated || comment.createdAt || '';
                                const updatedAt = comment.dateEdited || createdAt;
                                const showEdited = (
                                    comment.author?.username !== comment.editor?.username ||
                                    formatDateTimeToMin(createdAt) !== formatDateTimeToMin(updatedAt)
                                );
                                
                                return (
                                    <TableRow 
                                        key={comment.id}
                                        ref={idx === comments.length - 1 ? lastCommentRef : null}
                                        className="group hover:bg-muted/50 transition-colors"
                                    >
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {comment.id?.substring(0, 8)}...
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="truncate pr-2">
                                                <LexicalContentRenderer 
                                                    content={comment.content.length > 100 
                                                        ? comment.content.substring(0, 100) + '...'
                                                        : comment.content}
                                                    className="!border-none !bg-transparent !text-xs"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <NavLink 
                                                to={`/admin/articles/${comment.article?.id}`}
                                                className="text-primary hover:underline font-medium"
                                            >
                                                {comment.article?.title}
                                            </NavLink>
                                        </TableCell>
                                        <TableCell>
                                            <NavLink 
                                                to={`/admin/users/${comment.author?.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {comment.author?.username || 'Unknown'}
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
                                                        by {comment.editor?.username}
                                                    </Badge>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    onClick={() => handleView(comment)}
                                                    variant="outline"
                                                    size="sm"
                                                    title="View Comment"
                                                >
                                                    View
                                                </Button>
                                                {(hasRole("ADMIN") || comment.author?.username === currentUser) && (
                                                    <Button
                                                        onClick={() => handleEdit(comment)}
                                                        variant="default"
                                                        size="sm"
                                                        title="Edit Comment"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {(hasRole("ADMIN") || comment.author?.username === currentUser) && (
                                                    <Button
                                                        onClick={() => handleDelete(comment)}
                                                        variant="destructive"
                                                        size="sm"
                                                        title="Delete Comment"
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

        <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-[#dee2e6] shadow-[0_-2px_4px_rgba(0,0,0,0.1)] transform ${showBottomBar ? 'translate-y-0' : 'translate-y-full'} transition-transform duration-300 z-10`}>
            <div>
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious 
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    goToPrev();
                                }}
                                style={{ 
                                    pointerEvents: currentPage === 0 ? 'none' : 'auto',
                                    opacity: currentPage === 0 ? 0.5 : 1 
                                }}
                            />
                        </PaginationItem>
                        <PaginationItem>
                            <span className="!text-sm !text-[#6c757d]">
                                Page <input
                                    type="number"
                                    min="1"
                                    value={currentPage + 1}
                                    onChange={handlePageInput}
                                    className="!w-10 !text-center !text-sm !text-[#6c757d] !border !border-[#dee2e6] !rounded-lg !p-[4px]"
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

export default Comments;
