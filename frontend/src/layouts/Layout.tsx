import React, { createContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router';
import '../format/Layout.css';
import RequireRoles from '../api/RequireRoles';
import { hasRole } from '../api/AuthApi';
import { useAuth } from '../api/AuthContext';
import TopBar from '../pages/TopBar';
import { SortCriteria, ArticleFilters } from '../api/types';

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

export function Layout(): React.ReactElement {
	const navigate = useNavigate();
	const location = useLocation();
	const { token, currentUser, logout } = useAuth();
	
	// Article controls state
	const [filtersInput, setFiltersInput] = useState<ArticleFilters>({ title: '', author: '' });
	const [filters, setFilters] = useState<ArticleFilters>({ title: '', author: '' });
	const [sortCriteria, setSortCriteria] = useState<SortCriteria[]>([{ field: 'createdDate', direction: 'DESC' }]);
	const [pageSize, setPageSize] = useState<number>(10);
	const [pageIndex, setPageIndex] = useState<number>(0);
	const [sizeInput, setSizeInput] = useState<number>(10);

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
			<div className="layout-root">
				<aside className="layout-sidebar">
					<div className="layout-sidebar-header">
						<div className="layout-sidebar-photo">
							{/* Placeholder for blog logo/photo */}
							<img 
								src="/favicon.ico" 
								alt="Blog Logo" 
								style={{
									width: '100%', 
									height: '100%', 
									objectFit: 'cover', 
									borderRadius: '12px'
								}} 
							/>
						</div>
						<span className="layout-title">My Blog</span>
					</div>
					<nav className="layout-nav">
						<Link to="/articles" className="layout-nav-link">Home</Link>
						<RequireRoles roles={["AUTHOR", "ADMIN"]}>
							<Link to="/articles/create" className="layout-nav-link">Create Article</Link>
						</RequireRoles>
						<RequireRoles roles={["ADMIN"]}>
							<Link to="/admin/users" className="layout-nav-link">User Management</Link>
						</RequireRoles>
					</nav>
					{/* Article Controls Section */}
					{/* End Article Controls Section */}
					<div className="layout-sidebar-footer">
						{token ? (
							<>
								<span style={{fontSize: '0.98em', color: '#6a6a6a'}}>
									Welcome, {currentUser}!
								</span>
								<button 
									onClick={logOut} 
									className="layout-auth-link" 
									style={{
										background: 'none', 
										border: 'none', 
										cursor: 'pointer'
									}}
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link to="/login" className="layout-auth-link">Login</Link>
								<Link to="/register" className="layout-auth-link">Register</Link>
							</>
						)}
					</div>
				</aside>
				<main className="layout-main">
					{location.pathname === '/articles' && (
						<div className="sticky-topbar"><TopBar /></div>
					)}
					<Outlet />
				</main>
			</div>
		</ArticleControlsContext.Provider>
	);
} 