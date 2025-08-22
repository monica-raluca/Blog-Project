import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchAllArticles } from '../../api/ArticlesApi';

import { useAuth } from '../../api/AuthContext';
import { Article } from '../../api/types';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  ChevronRight,
  BookOpen,
  Feather,
  Sparkles,
  Scroll
} from 'lucide-react';
import LexicalContentRenderer from '../ui/LexicalContentRenderer';
import './HomePage.css';

const HomePage: React.FC = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [recentArticles, setRecentArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            setLoading(true);
            const response = await fetchAllArticles({
                filters: {},
                sortCriteria: [],
                size: 8,
                from: 0
            });
            
            const articles = Array.isArray(response) ? response : response.articles || [];
            
            // Get recent articles (first 8)
            setRecentArticles(articles.slice(0, 8));
        } catch (error) {
            console.error('Error fetching articles:', error);
        } finally {
            setLoading(false);
        }
    };



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const truncateContent = (content: string, maxLength: number = 150) => {
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    return (
        <div className="!min-h-screen !bg-gradient-to-br !from-gray-900 !via-purple-900/20 !to-gray-900 !relative">
            {/* Magical background decoration */}
            <div className="!absolute !inset-0 !overflow-hidden !pointer-events-none">
                <div className="!absolute !top-20 !right-20 !w-64 !h-64 !bg-purple-500/10 !rounded-full !blur-3xl !animate-pulse"></div>
                <div className="!absolute !bottom-20 !left-20 !w-48 !h-48 !bg-blue-500/10 !rounded-full !blur-3xl !animate-pulse !animation-delay-1000"></div>
                
                {/* Floating sparkles */}
                <Sparkles className="!absolute !top-24 !left-1/4 !w-4 !h-4 !text-purple-400/30 !animate-bounce" />
                <Sparkles className="!absolute !bottom-32 !right-1/3 !w-3 !h-3 !text-blue-400/30 !animate-pulse !animation-delay-2000" />
                <Scroll className="!absolute !top-1/2 !right-1/5 !w-4 !h-4 !text-purple-300/20 !animate-bounce !animation-delay-1500" />
            </div>

            <div className="!relative !z-10 !max-w-4xl !mx-auto !px-6 !py-16">
                {/* Hero Section */}
                <div className="!text-center !mb-20">
                    <div className="!mb-8">
                        <div className="!flex !items-center !justify-center !gap-3 !mb-6">
                            <Sparkles className="!w-8 !h-8 !text-purple-400" />
                            <h1 className="!text-5xl !md:!text-7xl !font-bold !bg-gradient-to-r !from-white !via-purple-200 !to-blue-200 !bg-clip-text !text-transparent !tracking-tight">
                                Vox Mysticus
                            </h1>
                            <Sparkles className="!w-8 !h-8 !text-blue-400" />
                        </div>
                        <p className="!text-lg !md:!text-xl !text-purple-200/80 !max-w-3xl !mx-auto !leading-relaxed">
                            A mystical realm where adventures unfold and legends are born from whispered tales.
                        </p>
                    </div>
                    
                    <div className="!flex !flex-wrap !justify-center !gap-3 !mt-10">
                        <Button 
                            onClick={() => navigate('/public/articles')}
                            className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !px-6 !py-3 !rounded-lg !font-medium !shadow-lg !shadow-purple-500/25 !transition-all hover:!scale-105"
                        >
                            <BookOpen className="!w-4 !h-4 !mr-2" />
                            Explore Chronicles
                        </Button>
                        
                        <Button 
                            onClick={() => navigate('/public/articles/create')}
                            variant="outline"
                            className="!border-purple-400/50 !text-purple-300 hover:!bg-purple-500/20 !px-6 !py-3 !rounded-lg !font-medium !backdrop-blur-sm !transition-all hover:!scale-105"
                        >
                            <Feather className="!w-4 !h-4 !mr-2" />
                            Craft Your Tale
                        </Button>
                    </div>
                </div>





                {/* Latest Chronicles Section */}
                {recentArticles.length > 0 && (
                    <div className="!mb-16">
                        <div className="!flex !items-center !gap-3 !justify-center !mb-12">
                            <Scroll className="!w-6 !h-6 !text-purple-400" />
                            <h2 className="!text-4xl !font-bold !text-white">Latest Chronicles</h2>
                            <Scroll className="!w-6 !h-6 !text-blue-400" />
                        </div>
                        
                        <div className="!grid !grid-cols-1 !md:!grid-cols-2 !gap-6">
                            {recentArticles.map((article) => (
                                <div 
                                    key={article.id}
                                    className="!bg-white/5 !backdrop-blur-xl !border !border-purple-500/20 !rounded-xl !p-6 hover:!border-purple-400/40 !transition-all !duration-300 hover:!scale-105 !cursor-pointer !group"
                                    onClick={() => navigate(`/public/articles/${article.id}`)}
                                >
                                    <h3 className="!text-xl !font-semibold !text-white !mb-3 !line-clamp-2 !group-hover:!text-purple-200 !transition-colors">
                                        {article.title}
                                    </h3>
                                    <p className="!text-purple-200/70 !text-sm !mb-4">
                                        By {article.author?.firstName} {article.author?.lastName}
                                    </p>
                                    <div className="!text-purple-100/80 !text-sm !line-clamp-3 !mb-4">
                                        <LexicalContentRenderer 
                                            content={article.content}
                                            className="!bg-transparent !border-none !text-inherit"
                                        />
                                    </div>
                                    <div className="!flex !items-center !justify-between">
                                        <span className="!text-purple-300/60 !text-xs">
                                            {article.createdAt ? formatDate(article.createdAt) : 'Unknown date'}
                                        </span>
                                        <ChevronRight className="!w-4 !h-4 !text-purple-400 !group-hover:!translate-x-1 !transition-transform" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="!text-center !mt-10">
                            <Button 
                                onClick={() => navigate('/public/articles')}
                                variant="outline"
                                className="!border-purple-400/50 !text-purple-300 hover:!bg-purple-500/20 !px-8 !py-3 !rounded-full !font-medium !backdrop-blur-sm !transition-all hover:!scale-105"
                            >
                                Discover All Chronicles
                                <ChevronRight className="!w-4 !h-4 !ml-2" />
                            </Button>
                        </div>
                    </div>
                )}



                {/* Call to Action */}
                <div className="!text-center !bg-gradient-to-r !from-purple-600/20 !to-blue-600/20 !backdrop-blur-xl !rounded-3xl !p-12 !border !border-purple-500/30">
                    <Sparkles className="!w-12 !h-12 !text-purple-400 !mx-auto !mb-6" />
                    <h2 className="!text-4xl !font-bold !text-white !mb-4">
                        Begin Your Quest
                    </h2>
                    <p className="!text-lg !text-purple-200/80 !mb-8 !max-w-2xl !mx-auto">
                        Join our mystical community of storytellers and weave your own legendary tales.
                    </p>
                    <div className="!flex !flex-wrap !justify-center !gap-4">
                        <Button 
                            onClick={() => navigate('/register')}
                            className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !px-8 !py-3 !rounded-full !font-semibold !shadow-lg !shadow-purple-500/25 !transition-all hover:!scale-105"
                        >
                            Join the Guild
                        </Button>
                        <Button 
                            onClick={() => navigate('/public/articles/create')}
                            variant="outline"
                            className="!border-purple-400/50 !text-purple-300 hover:!bg-purple-500/20 !px-8 !py-3 !rounded-full !font-semibold !backdrop-blur-sm !transition-all hover:!scale-105"
                        >
                            Craft Your Legend
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HomePage;