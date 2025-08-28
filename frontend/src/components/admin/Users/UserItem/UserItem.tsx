import React, { useState, useEffect } from 'react';
import { NavLink, useParams, useNavigate } from 'react-router';
import { UserDetail, Article, Comment } from '../../../../api/types';
import { useAuth } from '../../../../api/AuthContext';
import { hasRole } from '../../../../api/AuthApi';
import { deleteUser, fetchUserById } from '../../../../api/UsersApi';
import { fetchAllArticles } from '../../../../api/ArticlesApi';
import { fetchAllComments } from '../../../../api/CommentApi';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import MagicalAvatar from '../../../ui/MagicalAvatar';
import ArticleCover from '../../../ui/ArticleCover';
import LexicalContentRenderer from '../../../ui/LexicalContentRenderer';
import { extractSmartSummary } from '../../../../utils/contentUtils';
import { User, Calendar, Mail, Shield, ArrowLeft, Eye, Edit, Trash2, Crown, FileText, MessageSquare, BookOpen, Tag, ChevronDown } from 'lucide-react';

interface UserItemProps {
    user?: UserDetail;
    onEdit?: () => void;
    onDelete?: () => void;
    onView?: () => void;
    showActions?: boolean;
    variant?: 'card' | 'detailed';
    useRouteParams?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
    user: propUser,
    onEdit,
    onDelete,
    onView,
    showActions = true,
    variant = 'card',
    useRouteParams = false
}) => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { currentUser, token } = useAuth();
    const [isDeleting, setIsDeleting] = useState(false);
    const [user, setUser] = useState<UserDetail | null>(propUser || null);
    const [loading, setLoading] = useState<boolean>(useRouteParams && !propUser);
    const [error, setError] = useState<string | null>(null);
    const [showArticles, setShowArticles] = useState<boolean>(false);
    const [showComments, setShowComments] = useState<boolean>(false);
    const [articles, setArticles] = useState<Article[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingArticles, setLoadingArticles] = useState<boolean>(false);
    const [loadingComments, setLoadingComments] = useState<boolean>(false);


    // Load user from route params if needed
    useEffect(() => {
        if (useRouteParams && id && !propUser) {
            loadUserFromRoute();
        } else if (propUser) {
            setUser(propUser);
            setLoading(false);
        }
    }, [id, propUser, useRouteParams]);

    const loadArticles = async () => {
        if (!user?.username || !token) return;
        try {
            setLoadingArticles(true);
            const response = await fetchAllArticles({
                filters: { author: user.username },
                sortCriteria: [{ field: 'createdDate', direction: 'DESC' }],
                size: 100,
                from: 0
            });
            const allArticles = Array.isArray(response) ? response : response.articles || [];
            setArticles(allArticles);
        } catch (error) {
            console.error('Error loading articles:', error);
        } finally {
            setLoadingArticles(false);
        }
    };

    const loadComments = async () => {
        if (!user?.username || !token) return;
        try {
            setLoadingComments(true);
            const allComments = await fetchAllComments();
            const userComments = allComments.filter(comment => 
                comment.author?.username === user.username
            );
            setComments(userComments);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setLoadingComments(false);
        }
    };

    useEffect(() => {
        if (showArticles && articles.length === 0) {
            loadArticles();
        }
    }, [showArticles]);

    useEffect(() => {
        if (showComments && comments.length === 0) {
            loadComments();
        }
    }, [showComments]);

    const loadUserFromRoute = async (): Promise<void> => {
        if (!id) {
            navigate('/admin/users');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const userData = await fetchUserById(id);
            setUser(userData);
        } catch (err) {
            const errorMessage = (err as Error).message || 'An error occurred';
            setError(errorMessage);
            
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

    const formatDateTimeToMin = (dateStr: string): string => {
        const d = new Date(dateStr);
        return d.getFullYear() + '-' + (d.getMonth()+1).toString().padStart(2,'0') + '-' + d.getDate().toString().padStart(2,'0') + ' ' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit();
        } else if (useRouteParams) {
            navigate(`/admin/users/${user?.id}/edit`);
        }
    };

    const handleView = () => {
        if (onView) {
            onView();
        } else if (useRouteParams) {
            navigate(`/public/users/${user?.id}`);
        }
    };

    const handleDelete = async () => {
        if (!user) return;
        
        const confirmDelete = window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`);
        if (!confirmDelete) return;

        try {
            setIsDeleting(true);
            await deleteUser(user.id, token!);
            
            if (onDelete) {
                onDelete();
            } else if (useRouteParams) {
                navigate('/admin/users');
            }
        } catch (error) {
            const message = (error as Error).message || 'An error occurred';
            alert(`Failed to delete user: ${message}`);
            console.error('Delete error:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getRoleDisplay = (user: UserDetail): string => {
        return user.role || 'USER';
    };

    const getRoleBadgeColor = (role: string): string => {
        switch (role) {
            case 'ADMIN': return 'bg-[#dc3545] text-white';
            case 'AUTHOR': return 'bg-[#007bff] text-white';
            case 'USER': return 'bg-[#28a745] text-white';
            default: return 'bg-[#6c757d] text-white';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-600">Loading user...</div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-red-600">{error || 'User not found'}</div>
            </div>
        );
    }

    const canEdit = hasRole("ADMIN");
    const canDelete = hasRole("ADMIN");
    const userRole = getRoleDisplay(user);

    const createdAt = user.createdDate || user.createdAt || '';
    const isCurrentUser = user.username === currentUser;

    if (variant === 'detailed') {
        const getRoleBadgeColor = (role: string) => {
            switch (role) {
                case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
                case 'AUTHOR': return 'bg-blue-100 text-blue-800 border-blue-200';
                case 'USER': return 'bg-gray-100 text-gray-800 border-gray-200';
                default: return 'bg-gray-100 text-gray-800 border-gray-200';
            }
        };

        const getRoleIcon = (role: string) => {
            switch (role) {
                case 'ADMIN': return Crown;
                case 'AUTHOR': return Edit;
                case 'USER': return User;
                default: return User;
            }
        };

        const RoleIcon = getRoleIcon(user.role || 'USER');

        return (
        <div className="!min-h-screen !bg-gradient-to-br !from-gray-900 !via-purple-900/20 !to-gray-900 !relative">
                                {/* Header */}
                {useRouteParams && (
                    <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                            <div className="flex justify-between items-center py-4">
                                <div className="flex items-center gap-3">
                            <Button 
                                onClick={() => navigate('/admin/users')}
                                        variant="outline" 
                                        size="sm"
                                        className="flex items-center gap-2"
                            >
                                        <ArrowLeft className="w-4 h-4" />
                                        Back to Users
                            </Button>
                        </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Magical background decoration */}
                <div className="!absolute !inset-0 !overflow-hidden !pointer-events-none">
                    <div className="!absolute !top-20 !right-20 !w-64 !h-64 !bg-purple-500/10 !rounded-full !blur-3xl !animate-pulse"></div>
                    <div className="!absolute !bottom-20 !left-20 !w-48 !h-48 !bg-blue-500/10 !rounded-full !blur-3xl !animate-pulse !animation-delay-1000"></div>
                </div>

                {/* Main Content */}
                <div className="!relative !z-10 !max-w-4xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8">
                    <div className="!bg-white/10 !backdrop-blur-xl !border !border-white/20 !rounded-2xl !shadow-2xl !shadow-purple-500/20 !overflow-hidden">
                        
                        {/* User Header */}
                        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 px-8 py-12">
                            <div className="relative z-10">
                                <div className="flex items-start gap-6">
                                    <div className="flex-shrink-0">
                                        <MagicalAvatar 
                                            user={user}
                                            size="xl"
                                            className="ring-4 ring-white/20"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h1 className="text-3xl font-bold text-white truncate">
                                                {user.firstName} {user.lastName}
                                            </h1>
                                            <Badge className={`${getRoleBadgeColor(user.role || 'USER')} border flex items-center gap-1`}>
                                                <RoleIcon className="w-3 h-3" />
                                                {user.role}
                                            </Badge>
                                        </div>
                                        <p className="text-lg text-white/90 mb-1">@{user.username}</p>
                                        <div className="flex items-center gap-2 text-white/80">
                                            <Mail className="w-4 h-4" />
                                            <span>{user.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                        </div>

                        {/* User Details */}
                        <div className="!p-8">
                            <div className="!grid md:!grid-cols-2 !gap-8">
                                
                                {/* Basic Information */}
                                <div className="!space-y-6">
                                    <h3 className="!text-lg !font-semibold !text-white !border-b !border-white/20 !pb-2">
                                        Basic Information
                                    </h3>
                                    
                                    <div className="!space-y-4">
                                        <div className="!flex !items-center !gap-3">
                                            <User className="!w-5 !h-5 !text-purple-300" />
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">Full Name</p>
                                                <p className="!font-medium !text-white">{user.firstName} {user.lastName}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="!flex !items-center !gap-3">
                                            <div className="!w-5 !h-5 !text-purple-300 !font-mono !text-sm !flex !items-center !justify-center">@</div>
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">Username</p>
                                                <p className="!font-medium !text-white">{user.username}</p>
                                            </div>
                                        </div>

                                        <div className="!flex !items-center !gap-3">
                                            <Mail className="!w-5 !h-5 !text-purple-300" />
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">Email</p>
                                                <p className="!font-medium !text-white">{user.email}</p>
                                            </div>
                                        </div>

                                        <div className="!flex !items-center !gap-3">
                                            <Shield className="!w-5 !h-5 !text-purple-300" />
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">Role</p>
                                                <Badge className={`${getRoleBadgeColor(user.role || 'USER')} !border !flex !items-center !gap-1 !w-fit`}>
                                                    <RoleIcon className="!w-3 !h-3" />
                                                    {user.role}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Account Information */}
                                <div className="!space-y-6">
                                    <h3 className="!text-lg !font-semibold !text-white !border-b !border-white/20 !pb-2">
                                        Account Information
                                    </h3>
                                    
                                    <div className="!space-y-4">
                                        <div className="!flex !items-center !gap-3">
                                            <div className="!w-5 !h-5 !text-purple-300 !font-mono !text-sm !flex !items-center !justify-center">#</div>
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">User ID</p>
                                                <p className="!font-mono !text-sm !text-white !bg-white/10 !px-2 !py-1 !rounded">{user.id}</p>
                                            </div>
                                        </div>

                                        <div className="!flex !items-center !gap-3">
                                            <Calendar className="!w-5 !h-5 !text-purple-300" />
                                            <div>
                                                <p className="!text-sm !text-purple-200/70">Registration Date</p>
                                                <p className="!font-medium !text-white">
                                                    {user.createdDate ? formatDateTimeToMin(user.createdDate) : (user.createdAt ? formatDateTimeToMin(user.createdAt) : 'Unknown')}
                                                </p>
                                            </div>
                                        </div>

                                        {user.authorities && user.authorities.length > 0 && (
                                            <div className="!flex !items-start !gap-3">
                                                <Shield className="!w-5 !h-5 !text-purple-300 !mt-0.5" />
                                                <div>
                                                    <p className="!text-sm !text-purple-200/70">Authorities</p>
                                                    <div className="!flex !flex-wrap !gap-1 !mt-1">
                                                        {user.authorities.map((authority, index) => (
                                                            <Badge key={index} variant="outline" className="!text-xs !border-white/30 !text-white">
                                                                {authority}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                                                                        {/* User Content Overview */}
                        <div className="!bg-gradient-to-r !from-purple-600/20 !to-blue-600/20 !backdrop-blur-xl !border-t !border-white/20 !px-8 !py-6">
                            <h3 className="!text-lg !font-medium !text-white !mb-4">User Content</h3>
                            <div className="!flex !gap-3 !flex-wrap">
                                <Button
                                    onClick={() => setShowArticles(!showArticles)}
                                    variant="outline"
                                    size="sm"
                                    className="!flex !items-center !gap-2 !bg-white/10 !backdrop-blur-sm hover:!bg-white/20 !border-blue-300/50 !text-blue-200 hover:!text-white !transition-all"
                                >
                                    <FileText className="!w-4 !h-4" />
                                    {showArticles ? 'Hide Articles' : 'Show Articles'}
                                </Button>
                                <Button
                                    onClick={() => setShowComments(!showComments)}
                                    variant="outline"
                                    size="sm"
                                    className="!flex !items-center !gap-2 !bg-white/10 !backdrop-blur-sm hover:!bg-white/20 !border-indigo-300/50 !text-indigo-200 hover:!text-white !transition-all"
                                >
                                    <MessageSquare className="!w-4 !h-4" />
                                    {showComments ? 'Hide Comments' : 'Show Comments'}
                                </Button>
                                <Button
                                                                                        onClick={() => navigate(`/admin/articles?author=${user?.username || ''}`)}
                                    size="sm"
                                    className="!flex !items-center !gap-2 !bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !text-white"
                                >
                                    <FileText className="!w-4 !h-4" />
                                    Go to Articles Admin
                                </Button>
                                    <Button
                                                                                        onClick={() => navigate(`/admin/comments?author=${user?.username || ''}`)}
                                    size="sm"
                                    className="!flex !items-center !gap-2 !bg-gradient-to-r !from-purple-600 !to-indigo-600 hover:!from-purple-700 hover:!to-indigo-700 !text-white"
                                >
                                    <MessageSquare className="!w-4 !h-4" />
                                    Go to Comments Admin
                                    </Button>
                            </div>
                        </div>

                        {/* Inline Articles Display */}
                        {showArticles && (
                            <div className="!bg-white/5 !backdrop-blur-xl !border-t !border-white/20 !px-8 !py-6">
                                <h3 className="!text-lg !font-medium !text-white !mb-4">Articles by {user.firstName}</h3>
                                {loadingArticles ? (
                                    <div className="!text-center !py-8">
                                        <div className="!text-purple-200">Loading articles...</div>
                                    </div>
                                ) : articles.length > 0 ? (
                                    <div className="!grid !grid-cols-1 md:!grid-cols-2 !gap-6">
                                        {articles.map(article => (
                                            <div
                                                key={article.id}
                                                className="!group !bg-white/10 !backdrop-blur-xl !rounded-2xl !shadow-lg !border !border-white/20 !overflow-hidden !transition-all !duration-300 hover:!shadow-xl hover:!shadow-purple-100/20 hover:!scale-[1.02] !cursor-pointer"
                                                onClick={() => navigate(`/admin/articles/${article.id}`)}
                                            >
                                                {/* Article Cover */}
                                                <div className="!relative !h-32 !overflow-hidden">
                                                    <ArticleCover 
                                                        article={article}
                                                        className="!w-full !h-full !object-cover !transition-transform !duration-300 group-hover:!scale-110"
                                                    />
                                                    
                                                    {/* Category badge */}
                                                    <div className="!absolute !top-2 !right-2 !bg-white/90 !backdrop-blur-sm !px-2 !py-1 !rounded-full !text-xs !font-medium !text-gray-700 !shadow-sm !flex !items-center !gap-1">
                                                        <Tag className="!w-3 !h-3" />
                                                        {article.category || 'General'}
                                                    </div>
                                                </div>

                                                {/* Article Content */}
                                                <div className="!p-4">
                                                    <h4 className="!text-lg !font-semibold !text-white !mb-2 !line-clamp-2 group-hover:!text-purple-200 !transition-colors !duration-200">
                                                        {article.title}
                                                    </h4>
                                                    
                                                    <div className="!text-purple-200/70 !text-sm !leading-relaxed !mb-3 !line-clamp-2">
                                                        <LexicalContentRenderer 
                                                            content={extractSmartSummary(article.content || '')}
                                                            className="!border-none !bg-transparent !text-inherit"
                                                        />
                                                    </div>

                                                    <div className="!flex !items-center !justify-between !text-xs !text-purple-300/70">
                                                        <span>{(article.createdDate || article.createdAt) ? new Date(article.createdDate || article.createdAt || '').toLocaleDateString() : 'Unknown date'}</span>
                                                        <ChevronDown className="!w-4 !h-4 !rotate-[-90deg] group-hover:!text-white !transition-colors" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="!bg-white/10 !backdrop-blur-xl !rounded-2xl !border !border-white/20 !p-8 !text-center">
                                        <BookOpen className="!w-12 !h-12 !text-purple-300/50 !mx-auto !mb-4" />
                                        <h4 className="!text-lg !font-medium !text-white !mb-2">No Articles Yet</h4>
                                        <p className="!text-purple-200/70">This user hasn't published any articles.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Inline Comments Display */}
                        {showComments && (
                            <div className="!bg-white/5 !backdrop-blur-xl !border-t !border-white/20 !px-8 !py-6">
                                <h3 className="!text-lg !font-medium !text-white !mb-4">Comments by {user.firstName}</h3>
                                {loadingComments ? (
                                    <div className="!text-center !py-8">
                                        <div className="!text-purple-200">Loading comments...</div>
                                    </div>
                                ) : comments.length > 0 ? (
                                    <div className="!space-y-4">
                                        {comments.map(comment => (
                                            <div
                                                key={comment.id}
                                                className="!bg-white/10 !backdrop-blur-xl !rounded-xl !border !border-white/20 !p-4 !cursor-pointer hover:!bg-white/15 !transition-all !duration-200"
                                                onClick={() => navigate(`/admin/comments/${comment.id}`)}
                                            >
                                                <div className="!flex !items-start !gap-3">
                                                    <MessageSquare className="!w-5 !h-5 !text-purple-300 !mt-1 !flex-shrink-0" />
                                                    <div className="!flex-1 !min-w-0">
                                                        <div className="!flex !items-center !justify-between !mb-2">
                                                            <span className="!text-sm !text-purple-200/70">
                                                                On article: {comment.article?.title || 'Unknown'}
                                                            </span>
                                                            <span className="!text-xs !text-purple-300/70">
                                                                {(comment.createdAt || comment.dateCreated) ? new Date(comment.createdAt || comment.dateCreated || '').toLocaleDateString() : 'Unknown date'}
                                                            </span>
                    </div>
                                                        <div className="!text-white !text-sm !line-clamp-2">
                                                            <LexicalContentRenderer 
                                                                content={comment.content || ''}
                                                                className="!border-none !bg-transparent !text-inherit"
                                                            />
                            </div>
                            </div>
                            </div>
                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <div className="!bg-white/10 !backdrop-blur-xl !rounded-2xl !border !border-white/20 !p-8 !text-center">
                                        <MessageSquare className="!w-12 !h-12 !text-purple-300/50 !mx-auto !mb-4" />
                                        <h4 className="!text-lg !font-medium !text-white !mb-2">No Comments Yet</h4>
                                        <p className="!text-purple-200/70">This user hasn't posted any comments.</p>
                                    </div>
                                )}
                                </div>
                            )}

                        {/* Admin Actions */}
                        {showActions && (
                            <div className="!bg-white/5 !backdrop-blur-xl !border-t !border-white/20 !px-8 !py-6">
                                <div className="!flex !items-center !justify-between">
                                    <h3 className="!text-lg !font-medium !text-white">Admin Actions</h3>
                                    <div className="!flex !gap-3">
                                        {hasRole("ADMIN") && (
                                            <Button
                                                onClick={handleEdit}
                                                size="sm"
                                                className="!flex !items-center !gap-2 !bg-gradient-to-r !from-green-600 !to-emerald-600 hover:!from-green-700 hover:!to-emerald-700 !text-white"
                                            >
                                                <Edit className="!w-4 !h-4" />
                                                Edit User
                                            </Button>
                                        )}
                                        {hasRole("ADMIN") && !isCurrentUser && (
                                            <Button
                                                onClick={handleDelete}
                                                disabled={isDeleting}
                                                variant="destructive"
                                                size="sm"
                                                className="!flex !items-center !gap-2"
                                            >
                                                <Trash2 className="!w-4 !h-4" />
                                                {isDeleting ? 'Deleting...' : 'Delete User'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        );
    }

    // Card variant for lists  
    return (
        <div className="bg-white border rounded-lg overflow-hidden shadow-md">
            <div className="p-6">
                <div className="flex items-center gap-4">
                    <MagicalAvatar 
                        user={user}
                        size="lg"
                    />
                <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                            {isCurrentUser && <span className="ml-2 text-sm bg-blue-600 text-white px-2 py-1 rounded-full">You</span>}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                            <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-medium">@{user.username}</span>
                            <Badge className="text-xs">{user.role}</Badge>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserItem; 