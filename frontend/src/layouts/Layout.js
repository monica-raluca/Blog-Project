import { Outlet, Link, useNavigate } from 'react-router';
import '../format/Layout.css';

export function Layout() {
	const navigate = useNavigate();
	const token = JSON.parse(localStorage.getItem('token'));
    const currentUser = localStorage.getItem('currentUser');

	const logout = () => {
		localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
		navigate('/login');
	};

	return (
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
					<Link to="/articles/create" className="layout-nav-link">Create Article</Link>
					<Link to="/admin/users" className="layout-nav-link">User Management</Link>
				</nav>
				<div className="layout-sidebar-footer">
					{token ? (
						<>
							<span style={{fontSize: '0.98em', color: '#6a6a6a'}}>Welcome, {currentUser}!</span>
							<button onClick={logout} className="layout-auth-link" style={{background: 'none', border: 'none', cursor: 'pointer'}}>Logout</button>
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
	);
}