import React from 'react';
import { UserDetail } from '../../api/types';

interface MagicalAvatarProps {
  user?: UserDetail;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const MagicalAvatar: React.FC<MagicalAvatarProps> = ({ 
  user, 
  size = 'md', 
  className = '' 
}) => {
  // Generate a consistent magical avatar based on username
  const generateAvatarData = (username: string = 'Unknown') => {
    // Simple hash function for consistency
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Elegant color palettes
    const elegantColors = [
      { bg: 'from-slate-700 to-slate-800', accent: 'slate-400' },
      { bg: 'from-indigo-700 to-indigo-800', accent: 'indigo-400' },
      { bg: 'from-purple-700 to-purple-800', accent: 'purple-400' },
      { bg: 'from-emerald-700 to-emerald-800', accent: 'emerald-400' },
      { bg: 'from-blue-700 to-blue-800', accent: 'blue-400' },
      { bg: 'from-rose-700 to-rose-800', accent: 'rose-400' },
      { bg: 'from-amber-700 to-amber-800', accent: 'amber-400' },
      { bg: 'from-teal-700 to-teal-800', accent: 'teal-400' },
    ];
    
    const colorIndex = Math.abs(hash) % elegantColors.length;
    return elegantColors[colorIndex];
  };

  // Size configurations
  const sizeConfig = {
    sm: { container: 'w-8 h-8', text: 'text-xs' },
    md: { container: 'w-10 h-10', text: 'text-sm' },
    lg: { container: 'w-12 h-12', text: 'text-base' },
    xl: { container: 'w-16 h-16', text: 'text-lg' }
  };

  const config = sizeConfig[size];
  const avatarData = generateAvatarData(user?.username);
  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username?.substring(0, 2).toUpperCase() || '??';

  // If user has a profile picture, use it
  if (user?.profilePicture) {
    return (
      <div className={`${config.container} rounded-full overflow-hidden border border-gray-200 shadow-md hover:shadow-lg transition-shadow ${className}`}>
        <img 
          src={`http://localhost:8080/profile-pictures/${user.profilePicture}`} 
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to generated avatar if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.innerHTML = `
              <div class="${config.container} rounded-full bg-gradient-to-br ${avatarData.bg} border border-gray-200 shadow-md flex items-center justify-center relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent"></div>
                <div class="relative z-10 flex flex-col items-center justify-center">
                  <span class="font-medium text-white ${config.text} leading-none">${initials}</span>
                </div>
              </div>
            `;
          }}
        />
      </div>
    );
  }

  return (
    <div 
      className={`${config.container} rounded-full bg-gradient-to-br ${avatarData.bg} border border-gray-200 shadow-md hover:shadow-lg transition-shadow flex items-center justify-center relative overflow-hidden ${className}`}
    >
      {/* Subtle shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent"></div>
      
      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center">
        <span className={`font-medium text-white ${config.text} leading-none`}>
          {initials}
        </span>
      </div>
    </div>
  );
};

export default MagicalAvatar;