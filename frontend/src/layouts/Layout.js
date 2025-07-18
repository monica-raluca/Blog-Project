import { Outlet, Link, useNavigate } from 'react-router';

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
		<div>
			<header>
				<h1>📰 My Blog</h1>
				<nav>
					<Link to="/articles">Articles</Link> |{" "}
					{token ? (
						<>
							<span>Welcome, {currentUser}!</span>{" "}
							<button onClick={logout}>Logout</button>
						</>
					) : (
						<>
							<Link to="/login">Login</Link> |{" "}
							<Link to="/register">Register</Link>
						</>
					)}
				</nav>
			</header>
			<hr />
			<main>
				<Outlet />
			</main>
		</div>
	);
}