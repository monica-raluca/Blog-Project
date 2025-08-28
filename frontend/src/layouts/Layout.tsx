import React, { createContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import RequireRoles from '../api/RequireRoles';
import { hasRole } from '../api/AuthApi';
import { useAuth } from '../api/AuthContext';
import TopBar from './TopBar';
import { SortCriteria, ArticleFilters } from '../api/types';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Home, 
  PenTool, 
  Settings, 
  FileText, 
  MessageSquare, 
  Users, 
  ChevronRight,
  LogOut,
  User,
  PanelLeftClose,
  Newspaper,
  Sparkles,
  X
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ArticleControlsContextType {
	filtersInput: ArticleFilters;
	setFiltersInput: React.Dispatch<React.SetStateAction<ArticleFilters>>;
	filters: ArticleFilters;
	setFilters: React.Dispatch<React.SetStateAction<ArticleFilters>>;
	sortCriteria: SortCriteria[];
	setSortCriteria: React.Dispatch<React.SetStateAction<SortCriteria[]>>;
	pageSize: number;
	setPageSize: React.Dispatch<React.SetStateAction<number>>;
	pageIndex: number;
	setPageIndex: React.Dispatch<React.SetStateAction<number>>;
	sizeInput: number;
	setSizeInput: React.Dispatch<React.SetStateAction<number>>;
}

export const ArticleControlsContext = createContext<ArticleControlsContextType | null>(null);

// Admin Panel Collapsible Trigger with Tooltip
function AdminPanelTrigger() {
	const { state } = useSidebar();
	
	const trigger = (
		<CollapsibleTrigger className="w-full h-10 px-2 rounded-md font-medium text-[#162938] hover:bg-[#ececec] hover:text-[#270023] data-[state=open]:bg-[#ececec] data-[state=open]:text-[#270023] transition-all duration-200 flex items-center gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2">
			<Settings className="h-4 w-4 flex-shrink-0" />
			<span className="group-data-[collapsible=icon]:sr-only ml-2">Admin Panel</span>
			<ChevronRight className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-90 group-data-[collapsible=icon]:hidden flex-shrink-0" />
		</CollapsibleTrigger>
	);

	if (state === "collapsed") {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					{trigger}
				</TooltipTrigger>
				<TooltipContent side="right">
					<p>Admin Panel</p>
				</TooltipContent>
			</Tooltip>
		);
	}

	return trigger;
}

// User section component for the sidebar
function SidebarUserSection() {
	const { currentUser, token, logout, profilePicture } = useAuth();
	const { state } = useSidebar();
	const navigate = useNavigate();

	const logOut = (): void => {
		logout();
		navigate('/login');
	};

	const userInitials = currentUser 
		? currentUser.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
		: 'U';

	if (!token) {
		return (
			<SidebarGroup>
				<SidebarGroupContent>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Login">
								<Link to="/login" className="w-full flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
									<User className="h-4 w-4" />
									<span className="group-data-[collapsible=icon]:sr-only">Login</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton asChild tooltip="Register">
								<Link to="/register" className="w-full flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
									<PenTool className="h-4 w-4" />
									<span className="group-data-[collapsible=icon]:sr-only">Register</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	}

	return (
		<SidebarGroup>
			<SidebarGroupContent>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton 
							onClick={() => navigate('/profile')}
							tooltip="Edit Profile"
							className="flex items-center gap-3 !px-2 !py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:!px-2 w-full hover:bg-[#ececec] rounded-md transition-colors cursor-pointer"
						>
							<Avatar className="h-8 w-8 border-2 border-[#ececec] group-data-[collapsible=icon]:h-6 group-data-[collapsible=icon]:w-6">
								<AvatarImage 
									src={profilePicture ? `http://localhost:8080/profile-pictures/${profilePicture}` : `https://avatar.vercel.sh/${currentUser}`} 
									alt={`${currentUser}'s profile`}
								/>
								<AvatarFallback className="bg-gradient-to-r from-[#fbeffb] to-[#e3f0ff] text-[#162938] text-sm font-semibold group-data-[collapsible=icon]:text-xs">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							{state === "expanded" && (
								<div className="flex flex-col flex-1 min-w-0">
									<span className="text-sm font-medium text-[#162938] truncate">
										{currentUser}
									</span>
									<span className="text-xs text-[#6a6a6a]">
										Click to edit profile
									</span>
								</div>
							)}
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton 
							onClick={logOut}
							tooltip="Logout"
							className="w-full text-[#162938] hover:text-[#270023] hover:bg-[#ececec] flex items-center gap-2 group-data-[collapsible=icon]:justify-center"
						>
							<LogOut className="h-4 w-4" />
							<span className="group-data-[collapsible=icon]:sr-only">Logout</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarGroupContent>
		</SidebarGroup>
	);
}

export function Layout(): React.ReactElement {
	const navigate = useNavigate();
	const location = useLocation();
	const { token, currentUser, logout } = useAuth();
	
	// Check if we're on an admin page to auto-open accordion
	const isAdminPage = location.pathname.startsWith('/admin/');
	
	// Article controls state
	const [filtersInput, setFiltersInput] = useState<ArticleFilters>({ title: '', author: '' });
	const [filters, setFilters] = useState<ArticleFilters>({ title: '', author: '' });
	const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([{ field: 'createdDate', direction: 'DESC' }]);
	const [pageSize, setPageSize] = useState<number>(10);
	const [pageIndex, setPageIndex] = useState<number>(0);
	const [sizeInput, setSizeInput] = useState<number>(10);
	const [showBlogModal, setShowBlogModal] = useState<boolean>(false);
	

	console.log(token, currentUser);

	const logOut = (): void => {
		logout();
		navigate('/login');
	};

	useEffect(() => {
		console.log(token);
		console.log(currentUser);
	}, [token]);

	const contextValue: ArticleControlsContextType = {
		filtersInput, 
		setFiltersInput, 
		filters, 
		setFilters,
		sortCriteria, 
		setSortCriteria, 
		pageSize, 
		setPageSize, 
		pageIndex, 
		setPageIndex, 
		sizeInput, 
		setSizeInput
	};

	return (
		<ArticleControlsContext.Provider value={contextValue}>
			<SidebarProvider defaultOpen={true}>
				<div className="flex min-h-screen w-full font-[Poppins] relative z-[1]">
					<Sidebar 
						variant="floating"
						collapsible="icon"
						className="border-r-[1.5px] border-[#ececec] shadow-[2px_0_12px_rgba(22,41,56,0.04)] backdrop-blur-[2px]"
					>
						{/* Header with Logo and Title */}
						<SidebarHeader className="border-b border-[#ececec]/50 !px-6 !py-4 group-data-[collapsible=icon]:!px-2 group-data-[collapsible=icon]:!py-3">
							<div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
								<div 
									className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fbeffb] to-[#e3f0ff] border-2 border-[#ececec] group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:w-8 cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
									onClick={() => setShowBlogModal(true)}
								>
									<img 
										src="http://localhost:8080/profile-pictures/BlogIcon.jpg" 
										alt="Blog Logo" 
										className="h-6 w-6 object-cover rounded-full group-data-[collapsible=icon]:h-5 group-data-[collapsible=icon]:w-5"
									/>
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
									<span className="truncate font-bold text-[#162938] text-lg tracking-tight">
										Flamebound
									</span>
									<span className="truncate text-xs text-[#6a6a6a]">
										Light of the Moon
									</span>
								</div>
							</div>
						</SidebarHeader>

						{/* Main Navigation */}
						<SidebarContent className="!px-3 !py-4">
							<SidebarGroup>
								<SidebarGroupLabel className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider mb-2 group-data-[collapsible=icon]:sr-only">
									Navigation
								</SidebarGroupLabel>
								<SidebarGroupContent>
									<SidebarMenu className="space-y-1">
										<SidebarMenuItem>
											<SidebarMenuButton 
												asChild 
												tooltip="Home"
												className="group/button h-10 font-medium hover:bg-[#ececec] hover:text-[#270023] text-[#162938] data-[active=true]:bg-[#ececec] data-[active=true]:text-[#270023]"
												isActive={location.pathname === '/' || location.pathname === '/home'}
											>
												<Link to="/home" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
													<Sparkles className="h-4 w-4" />
													<span className="group-data-[collapsible=icon]:sr-only ml-2">Home</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
										
										<SidebarMenuItem>
											<SidebarMenuButton 
												asChild 
												tooltip="All Articles"
												className="group/button h-10 font-medium hover:bg-[#ececec] hover:text-[#270023] text-[#162938] data-[active=true]:bg-[#ececec] data-[active=true]:text-[#270023]"
												isActive={location.pathname === '/public/articles'}
											>
												<Link to="/public/articles" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
													<Newspaper className="h-4 w-4" />
													<span className="group-data-[collapsible=icon]:sr-only ml-2">All Articles</span>
												</Link>
											</SidebarMenuButton>
										</SidebarMenuItem>
										
										<RequireRoles roles={["AUTHOR", "ADMIN"]}>
											<SidebarMenuItem>
												<SidebarMenuButton 
													asChild 
													tooltip="Create Article"
													className="group/button h-10 font-medium hover:bg-[#ececec] hover:text-[#270023] text-[#162938] data-[active=true]:bg-[#ececec] data-[active=true]:text-[#270023]"
													isActive={location.pathname === '/public/articles/create'}
												>
													<Link to="/public/articles/create" className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
														<PenTool className="h-4 w-4" />
														<span className="group-data-[collapsible=icon]:sr-only ml-2">Create Article</span>
													</Link>
												</SidebarMenuButton>
											</SidebarMenuItem>
										</RequireRoles>
									</SidebarMenu>
								</SidebarGroupContent>
							</SidebarGroup>

							{/* Admin Section */}
							<RequireRoles roles={["ADMIN"]}>
								<SidebarGroup>
									<SidebarGroupLabel className="text-xs font-semibold text-[#6a6a6a] uppercase tracking-wider mb-2 group-data-[collapsible=icon]:sr-only">
										Administration
									</SidebarGroupLabel>
									<SidebarGroupContent>
										<Collapsible defaultOpen={isAdminPage}>
											<SidebarMenu className="space-y-1">
												<SidebarMenuItem>
													<AdminPanelTrigger />
												</SidebarMenuItem>
											</SidebarMenu>
											<CollapsibleContent className="group-data-[collapsible=icon]:hidden">
												<SidebarMenuSub className="!mx-0 border-l-2 border-[#ececec] !ml-6 !pl-4 space-y-1 !mt-2">
													<SidebarMenuSubItem>
														<SidebarMenuSubButton 
															asChild 
															className="h-9 text-sm font-normal text-[#162938] hover:bg-[#f0f0f0] hover:text-[#270023] rounded-md transition-all duration-200 data-[active=true]:bg-[#f0f0f0] data-[active=true]:text-[#270023] justify-start !pl-3"
															isActive={location.pathname === '/admin/articles'}
														>
															<Link to="/admin/articles">
																<span>Manage Articles</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton 
															asChild 
															className="h-9 text-sm font-normal text-[#162938] hover:bg-[#f0f0f0] hover:text-[#270023] rounded-md transition-all duration-200 data-[active=true]:bg-[#f0f0f0] data-[active=true]:text-[#270023] justify-start !pl-3"
															isActive={location.pathname === '/admin/comments'}
														>
															<Link to="/admin/comments">
																<span>Manage Comments</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
													<SidebarMenuSubItem>
														<SidebarMenuSubButton 
															asChild 
															className="h-9 text-sm font-normal text-[#162938] hover:bg-[#f0f0f0] hover:text-[#270023] rounded-md transition-all duration-200 data-[active=true]:bg-[#f0f0f0] data-[active=true]:text-[#270023] justify-start !pl-3"
															isActive={location.pathname === '/admin/users'}
														>
															<Link to="/admin/users">
																<span>Manage Users</span>
															</Link>
														</SidebarMenuSubButton>
													</SidebarMenuSubItem>
												</SidebarMenuSub>
											</CollapsibleContent>
										</Collapsible>
									</SidebarGroupContent>
								</SidebarGroup>
							</RequireRoles>
						</SidebarContent>

						{/* User Section Footer */}
						<SidebarFooter className="border-t border-[#ececec]/50 !p-4">
							<SidebarUserSection />
						</SidebarFooter>
						
						
						{/* Rail for edge clicking */}
						<SidebarRail />
					</Sidebar>
					
					<SidebarInset className="flex-1 min-h-screen bg-transparent z-[2] overflow-y-auto max-h-screen flex flex-col">
						{/* Desktop collapse trigger */}
						<div className="hidden md:block absolute top-4 left-4 z-30">
							<SidebarTrigger className="h-8 w-8 bg-white/90 backdrop-blur-sm border border-[#ececec] rounded-md shadow-sm text-[#162938] hover:text-[#270023] hover:bg-white transition-all duration-200">
								<PanelLeftClose className="h-4 w-4" />
								<span className="sr-only">Toggle Sidebar</span>
							</SidebarTrigger>
						</div>
						
						{/* Mobile header with sidebar trigger */}
						<div className="sticky top-0 z-[20] bg-transparent md:hidden">
							<div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-sm border-b border-[#ececec]">
								<SidebarTrigger className="text-[#162938] hover:text-[#270023]" />
								<span className="text-lg font-semibold text-[#162938]">Flamebound</span>
							</div>
						</div>
						
						{/* TopBar for specific pages */}
						{location.pathname === '/public/articles' && (
							<div className="sticky top-0 z-[20] bg-transparent shadow-[0_2px_12px_rgba(22,41,56,0.07)] hidden md:block">
								<TopBar />
							</div>
						)}
						
						<div className="flex-1 overflow-y-auto">
							<Outlet />
						</div>
					</SidebarInset>
				</div>
			</SidebarProvider>

			{/* Blog Modal */}
			{showBlogModal && (
				<div 
					className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
					onClick={() => setShowBlogModal(false)}
				>
					<div 
						className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-purple-500/20"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							onClick={() => setShowBlogModal(false)}
							className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors duration-200 text-white"
						>
							<X className="w-4 h-4" />
						</button>

						{/* Modal Content */}
						<div className="text-center">
							{/* Large Blog Image */}
							<div className="mb-6 flex justify-center">
								<div className="relative">
									<img 
										src="http://localhost:8080/profile-pictures/BlogIcon.jpg" 
										alt="Blog Logo" 
										className="w-24 h-24 object-cover rounded-full border-4 border-white/30 shadow-xl"
									/>
									<div className="absolute inset-0 rounded-full bg-gradient-to-t from-purple-500/20 to-transparent"></div>
								</div>
							</div>

							{/* Zoomed Blog Information */}
							<div className="space-y-4">
								<h1 className="text-4xl font-bold bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent tracking-tight">
									Flamebound
								</h1>
								<p className="text-lg text-purple-200/80 leading-relaxed">
									Light of the Moon
								</p>
								<div className="pt-4 border-t border-white/20">
									<p className="text-sm text-purple-300/70 leading-relaxed">
										A mystical realm where adventures unfold and legends are born from whispered tales. 
										Journey through chronicles of wonder, magic, and endless possibilities.
									</p>
								</div>
							</div>

							{/* Decorative Elements */}
							<div className="absolute -top-2 -left-2 w-6 h-6 bg-purple-400/30 rounded-full blur-sm"></div>
							<div className="absolute -bottom-3 -right-3 w-8 h-8 bg-blue-400/20 rounded-full blur-sm"></div>
							<div className="absolute top-1/2 -left-4 w-4 h-4 bg-pink-400/25 rounded-full blur-sm"></div>
						</div>
					</div>
				</div>
			)}
		</ArticleControlsContext.Provider>
	);
} 