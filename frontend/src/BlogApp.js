import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Layout } from './layouts/Layout';
// import Articles from './pages/Articles';
import Articles from './pages/Articles';
import ArticleItem from './pages/ArticleItem';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthorItem from "./pages/AuthorItem";
import ArticleForm from "./pages/ArticleForm";
import UserManagement from "./pages/UserManagement";
import { AuthProvider } from "./api/AuthContext";

export function BlogApp() {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Navigate to="/articles" replace />} />
						<Route path="articles" element={<Articles />} />
						<Route path="articles/:id" element={<ArticleItem />} />
						<Route path="/articles/create" element={<ArticleForm />} />
						<Route path="/articles/:id/edit" element={<ArticleForm isEdit={true} />} />
						<Route path="login" element={<Login />} />
						<Route path="register" element={<Register />} />
						<Route path="users/:id" element={<AuthorItem />} />
						<Route path="admin/users" element={<UserManagement />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
		
	);
}