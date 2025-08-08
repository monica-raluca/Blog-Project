import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { fetchAllComments, fetchCommentsByArticleId, deleteComment } from '../../../api/CommentApi';
import { fetchAllArticles } from '../../../api/ArticlesApi';
import { useAuth } from '../../../api/AuthContext';
import { hasRole } from '../../../api/AuthApi';
import { Comment, Article } from '../../../api/types';
import CommentItem from './CommentItem/CommentItem';

import '../Articles/AdminArticles.css';
import './AdminComments.css';
import { Button } from '@/components/ui/button';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

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
    const [comments, setComments] = useState<Comment[]>([]);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedArticleId, setSelectedArticleId] = useState<string>(filterByArticleId || '');
    const [showBottomBar, setShowBottomBar] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const pageSize = 20;
    
    const { token, currentUser } = useAuth();
    const navigate = useNavigate();
    const lastCommentRef = React.useRef<HTMLTableRowElement>(null);

    useEffect(() => {
        loadArticles();
    }, []);

    useEffect(() => {
        loadComments();
    }, [selectedArticleId, currentPage]);

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

    const loadComments = async (): Promise<void> => {
        try {
            setLoading(true);
            let commentsData: Comment[];
            
            if (selectedArticleId) {
                commentsData = await fetchCommentsByArticleId(selectedArticleId);
            } else {
                commentsData = await fetchAllComments();
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

    return (
        <>
        <div className="admin-comments-container">
            <div className="admin-header">
                <h2>Comments Management</h2>
                <Button 
                    className="admin-btn admin-btn-primary"
                    onClick={() => navigate('/admin/comments/create')}
                >
                    Create New Comment
                </Button>
                <div className="admin-actions">
                    <div className="admin-filter-section">
                        <label htmlFor="article-filter">Filter by Article:</label>
                        <select
                            id="article-filter"
                            value={selectedArticleId}
                            onChange={(e) => {
                                setSelectedArticleId(e.target.value);
                                setCurrentPage(0);
                            }}
                            className="admin-filter-select"
                        >
                            <option value="">All Articles</option>
                            {articles.map((article) => (
                                <option key={article.id} value={article.id}>
                                    {article.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Content</th>
                            <th>Article</th>
                            <th>Author</th>
                            <th>Created Date</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="admin-no-data">
                                    {selectedArticleId 
                                        ? 'No comments found for this article' 
                                        : 'No comments found'
                                    }
                                </td>
                            </tr>
                        ) : (
                            comments.map((comment, idx) => {
                                const createdAt = comment.dateCreated || comment.createdAt || '';
                                const updatedAt = comment.dateEdited || createdAt;
                                const showEdited = (
                                    comment.author?.username !== comment.editor?.username ||
                                    formatDateTimeToMin(createdAt) !== formatDateTimeToMin(updatedAt)
                                );
                                
                                return (
                                    <tr 
                                        key={comment.id}
                                        ref={idx === comments.length - 1 ? lastCommentRef : null}
                                    >
                                        <td className="admin-id-cell">
                                            {comment.id?.substring(0, 8)}...
                                        </td>
                                        <td className="admin-content-cell">
                                            <div className="comment-content-preview">
                                                {comment.content.length > 100 
                                                    ? comment.content.substring(0, 100) + '...'
                                                    : comment.content}
                                            </div>
                                        </td>
                                        <td className="admin-article-cell">
                                            <NavLink 
                                                to={`/admin/articles/${comment.article?.id}`}
                                                className="admin-article-link"
                                            >
                                                {comment.article?.title}
                                            </NavLink>
                                        </td>
                                        <td className="admin-author-cell">
                                            <NavLink to={`/admin/users/${comment.author?.id}`}>
                                                {comment.author?.username || 'Unknown'}
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
                                                        by {comment.editor?.username}
                                                    </div>
                                                </div>
                                            ) : (
                                                '-'
                                            )}
                                        </td>
                                        <td className="admin-actions-cell">
                                            <div className="admin-action-buttons">
                                                <Button
                                                    onClick={() => handleView(comment)}
                                                    className="admin-btn admin-btn-sm admin-btn-secondary"
                                                    title="View Comment"
                                                >
                                                    View
                                                </Button>
                                                {(hasRole("ADMIN") || comment.author?.username === currentUser) && (
                                                    <Button
                                                        onClick={() => handleEdit(comment)}
                                                        className="admin-btn admin-btn-sm admin-btn-primary"
                                                        title="Edit Comment"
                                                    >
                                                        Edit
                                                    </Button>
                                                )}
                                                {(hasRole("ADMIN") || comment.author?.username === currentUser) && (
                                                    <Button
                                                        onClick={() => handleDelete(comment)}
                                                        className="admin-btn admin-btn-sm admin-btn-danger"
                                                        title="Delete Comment"
                                                    >
                                                        Delete
                                                    </Button>
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
                            <span className="admin-page-info">
                                Page <input
                                    type="number"
                                    min="1"
                                    value={currentPage + 1}
                                    onChange={handlePageInput}
                                    className="admin-page-input"
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
