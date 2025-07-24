import { Outlet, Link, useNavigate } from 'react-router';
import '../format/Layout.css';
import RequireRoles from '../api/RequireRoles';
import { hasRole } from '../api/AuthApi';
import { token, currentUser } from '../api/AuthApi';
import { useEffect, useContext, use } from 'react';
import { useAuth } from '../api/AuthContext';
import { createContext, useState } from 'react';

// ArticleControlsContext provides state and handlers for filtering, sorting, and pagination
export const ArticleControlsContext = createContext();

export function Layout() {
	const navigate = useNavigate();
	// const token = JSON.parse(localStorage.getItem('token'));
	// const currentUser = localStorage.getItem('currentUser');
	const {token, currentUser, logout} = useAuth();
	// Article controls state
	const [filtersInput, setFiltersInput] = useState({ title: '', author: '' });
	const [filters, setFilters] = useState({ title: '', author: '' });
	const [sortCriteria, setSortCriteria] = useState([{ field: 'createdDate', direction: 'desc' }]);
	const [pageSize, setPageSize] = useState(10);
	const [pageIndex, setPageIndex] = useState(0);
	const [sizeInput, setSizeInput] = useState(10);

	console.log(token, currentUser);

	const logOut = () => {
		logout();
		navigate('/login');
	};

	useEffect(() => {
		console.log(token);
		console.log(currentUser);
	}, [token]);

	return (
		<ArticleControlsContext.Provider value={{
			filtersInput, setFiltersInput, filters, setFilters,
			sortCriteria, setSortCriteria, pageSize, setPageSize, pageIndex, setPageIndex, sizeInput, setSizeInput
		}}>
			<div className="layout-root">
				<aside className="layout-sidebar">
					<div className="layout-sidebar-header">
						<div className="layout-sidebar-photo">
							{/* Placeholder for blog logo/photo */}
							<img src="/favicon.ico" alt="Blog Logo" style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px'}} />
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
					<div style={{marginTop: 32, padding: '0 8px', width: '100%'}}>
						<div style={{fontWeight: 600, fontSize: '1.08em', marginBottom: 8, color: '#162938'}}>Article Controls</div>
						<div className="filter-panel" style={{background: 'none', boxShadow: 'none', padding: 0}}>
							<input
								placeholder="Title"
								value={filtersInput.title}
								onChange={e => setFiltersInput(f => ({ ...f, title: e.target.value }))}
								style={{marginBottom: 6, width: '100%'}}
							/>
							<input
								placeholder="Author"
								value={filtersInput.author}
								onChange={e => setFiltersInput(f => ({ ...f, author: e.target.value }))}
								style={{marginBottom: 6, width: '100%'}}
							/>
							<button style={{marginBottom: 10, width: '100%'}} onClick={() => setFilters(filtersInput)}>Apply filters</button>
						</div>
						<div style={{marginBottom: 10}}>
							<select
								style={{width: '100%', marginBottom: 6}}
								onChange={e => setSortCriteria([{ field: e.target.value, direction: 'asc' }])}
								value={sortCriteria[0]?.field || 'createdDate'}
							>
								<option value="createdDate">Created Date</option>
								<option value="title">Title</option>
								<option value="author">Author</option>
							</select>
							<button style={{width: '100%'}} onClick={() => setSortCriteria(sc => sc.map(c => ({ ...c, direction: c.direction === 'asc' ? 'desc' : 'asc' })))}>Toggle Sort Direction</button>
						</div>
						<div style={{marginBottom: 10}}>
							<button style={{width: '100%', marginBottom: 6}} disabled={pageIndex === 0} onClick={() => setPageIndex(pageIndex - 1)}>Previous Page</button>
							<span style={{display: 'block', textAlign: 'center', marginBottom: 6}}>Page {pageIndex + 1}</span>
							<button style={{width: '100%'}} onClick={() => setPageIndex(pageIndex + 1)}>Next Page</button>
						</div>
						<div>
							<input
								type="text"
								placeholder="Articles per page"
								value={sizeInput}
								onChange={e => setSizeInput(e.target.value)}
								style={{marginBottom: 6, width: '100%'}}
							/>
							<button style={{width: '100%'}} onClick={() => setPageSize(Number(sizeInput))}>Change page size</button>
						</div>
					</div>
					{/* End Article Controls Section */}
					<div className="layout-sidebar-footer">
						{token ? (
							<>
								<span style={{fontSize: '0.98em', color: '#6a6a6a'}}>Welcome, {currentUser}!</span>
								<button onClick={logOut} className="layout-auth-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>Logout</button>
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
					<Outlet />
				</main>
			</div>
		</ArticleControlsContext.Provider>
	);
}