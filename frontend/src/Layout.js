import { Outlet, Link } from 'react-router';

export function Layout() {
    return (
        <div>
            <header>
                <h1>📰 My Blog</h1>
                <nav>
                    <Link to="/posts">Home</Link>
                </nav>
            </header>
            <hr />
            <main>
                <Outlet />
            </main>
        </div>
    );
}