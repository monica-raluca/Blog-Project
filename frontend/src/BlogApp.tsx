import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Layout } from './layouts/Layout';
// import Articles from './pages/Articles';
// import ArticleItem from './pages/ArticleItem';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AuthorItem from "./components/public/Users/UserItem/AuthorItem";
// import { ArticleForm } from './components/admin/Articles';
// import UserManagement from "./pages/UserManagement";
import { AuthProvider } from "./api/AuthContext";
import NotFound from './components/error/NotFound';
import Forbidden from './components/error/Forbidden';
import ErrorPage from './components/error/ErrorPage';

import AdminArticles from './components/admin/Articles/AdminArticles';
import { AdminArticleItem } from './components/admin/Articles';
import { Comments, CommentForm, CommentItem } from './components/admin/Comments';
import { Users, UserForm, UserItem } from './components/admin/Users';
import UserArticles from './components/public/Articles/UserArticles';
import UserArticleItem from './components/public/Articles/ArticleItem/UserArticleItem';
import UserArticleForm from './components/public/Articles/UserArticleForm';
import AdminArticleForm from './components/admin/Articles/AdminArticleForm';

export function BlogApp(): React.ReactElement {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Navigate to="/public/articles" replace />} />

						{/* Auth routes */}
						<Route path="login" element={<Login />} />
						<Route path="register" element={<Register />} />
						
						{/* Public routes */}
						<Route path="public/articles" element={<UserArticles />} />
						<Route path="public/articles/:id" element={<UserArticleItem />} />
						<Route path="public/articles/create" element={<UserArticleForm />} />
						<Route path="public/articles/:id/edit" element={<UserArticleForm isEdit={true} />} />
						
						<Route path="public/users/:id" element={<AuthorItem />} />

						{/* Admin routes */}
						<Route path="admin/articles" element={<AdminArticles />} />
						<Route path="admin/articles/:id" element={<AdminArticleItem variant="detailed" useRouteParams={true} />} />
						<Route path="admin/articles/create" element={<AdminArticleForm />} />
						<Route path="admin/articles/:id/edit" element={<AdminArticleForm isEdit={true} />} />

						<Route path="admin/comments" element={<Comments />} />
						<Route path="admin/comments/create" element={<CommentForm />} />
						<Route path="admin/comments/:id" element={<CommentItem variant="detailed" useRouteParams={true} />} />
						<Route path="admin/comments/:id/edit" element={<CommentForm isEdit={true} />} />

						<Route path="admin/users" element={<Users />} />
						<Route path="admin/users/:id" element={<UserItem variant="detailed" useRouteParams={true} />} />
						<Route path="admin/users/:id/edit" element={<UserForm />} />

						{/* Error routes */}
						<Route path="forbidden" element={<Forbidden />} />
						<Route path="error" element={<ErrorPage />} />
						<Route path="notfound" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
} 