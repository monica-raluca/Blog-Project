import React from 'react';
import { Article } from '../../api/types';
import { 
  Scroll,
  BookOpen,
  Sparkles,
  Shield,
  Sword,
  Crown,
  Zap,
  Star
} from 'lucide-react';

interface ArticleCoverProps {
  article: Article;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const ArticleCover: React.FC<ArticleCoverProps> = ({ 
  article, 
  size = 'md', 
  className = '' 
}) => {
  // Generate a consistent cover based on article title
  const generateCoverData = (title: string = 'Untitled') => {
    // Simple hash function for consistency
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Elegant themed backgrounds
    const elegantThemes = [
      { 
        bg: 'from-slate-800 to-slate-900', 
        accent: 'slate-300',
        icon: BookOpen,
        pattern: 'Chronicles'
      },
      { 
        bg: 'from-indigo-800 to-indigo-900', 
        accent: 'indigo-300',
        icon: Scroll,
        pattern: 'Manuscripts'
      },
      { 
        bg: 'from-purple-800 to-purple-900', 
        accent: 'purple-300',
        icon: Star,
        pattern: 'Mystique'
      },
      { 
        bg: 'from-emerald-800 to-emerald-900', 
        accent: 'emerald-300',
        icon: Shield,
        pattern: 'Nature'
      },
      { 
        bg: 'from-blue-800 to-blue-900', 
        accent: 'blue-300',
        icon: Zap,
        pattern: 'Elements'
      },
      { 
        bg: 'from-rose-800 to-rose-900', 
        accent: 'rose-300',
        icon: Sparkles,
        pattern: 'Enchantment'
      },
      { 
        bg: 'from-amber-800 to-amber-900', 
        accent: 'amber-300',
        icon: Crown,
        pattern: 'Legends'
      },
      { 
        bg: 'from-teal-800 to-teal-900', 
        accent: 'teal-300',
        icon: Sword,
        pattern: 'Adventure'
      }
    ];
    
    const themeIndex = Math.abs(hash) % elegantThemes.length;
    return elegantThemes[themeIndex];
  };

  // Size configurations
  const sizeConfig = {
    sm: { 
      container: 'w-16 h-12', 
      icon: 'w-4 h-4', 
      title: 'text-xs',
      sparkles: 'w-2 h-2'
    },
    md: { 
      container: 'w-24 h-16', 
      icon: 'w-6 h-6', 
      title: 'text-sm',
      sparkles: 'w-3 h-3'
    },
    lg: { 
      container: 'w-32 h-20', 
      icon: 'w-8 h-8', 
      title: 'text-base',
      sparkles: 'w-4 h-4'
    }
  };

  const config = sizeConfig[size];
  const coverData = generateCoverData(article.title);
  const IconComponent = coverData.icon;

  // Check if article has an uploaded image
  const hasUploadedImage = article.imageUrl && article.imageUrl.trim();

  if (hasUploadedImage) {
    // Display uploaded image
    return (
      <div 
        className={`${config.container} rounded-lg border border-gray-300/20 shadow-md hover:shadow-lg transition-all duration-500 relative overflow-hidden group ${className}`}
      >
        <img
          src={`http://localhost:8080/article-images/${article.imageUrl}`}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Title overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 to-transparent">
          <div className="line-clamp-2 leading-tight">
            {article.title.length > 30 ? article.title.substring(0, 28) + '...' : article.title}
          </div>
        </div>
        
        {/* Magical shimmer effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        </div>
      </div>
    );
  }

  // Fallback to generated placeholder
  return (
    <div 
      className={`${config.container} rounded-lg bg-gradient-to-br ${coverData.bg} border border-gray-300/20 shadow-md hover:shadow-lg transition-all duration-500 flex flex-col items-center justify-center relative overflow-hidden group ${className}`}
    >
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 group-hover:from-white/15 transition-all duration-500"></div>
      
      {/* Subtle floating particles */}
      <div className="absolute top-2 right-2 w-1 h-1 bg-white/30 rounded-full animate-pulse"></div>
      <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-white/20 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
      
      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center p-3 text-center group-hover:scale-105 transition-transform duration-500">
        <IconComponent className={`${config.icon} text-${coverData.accent} mb-2 opacity-80 group-hover:opacity-100 transition-opacity duration-300`} />
        <div className={`${config.title} font-medium text-white leading-tight line-clamp-2 opacity-90 group-hover:opacity-100 transition-opacity duration-300`}>
          {article.title.length > 20 ? article.title.substring(0, 18) + '...' : article.title}
        </div>
      </div>
      
      {/* Magical shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
    </div>
  );
};

export default ArticleCover;