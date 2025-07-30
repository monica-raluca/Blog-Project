import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Layout } from './layouts/Layout';
// import Articles from './pages/Articles';
// import ArticleItem from './pages/ArticleItem';
import Login from './pages/Login';
import Register from './pages/Register';
import AuthorItem from "./pages/AuthorItem";
import { ArticleForm } from './components/admin/Articles';
// import UserManagement from "./pages/UserManagement";
import { AuthProvider } from "./api/AuthContext";
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ErrorPage from './pages/ErrorPage';

import Articles from './components/admin/Articles/Articles';
import { ArticleItem } from './components/admin/Articles';
import { Comments, CommentForm, CommentItem } from './components/admin/Comments';
import { Users, UserForm, UserItem } from './components/admin/Users';


export function BlogApp(): React.ReactElement {
	return (
		<AuthProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route index element={<Navigate to="/articles" replace />} />
						<Route path="articles" element={<Articles />} />
						<Route path="articles/:id" element={<ArticleItem variant="detailed" useRouteParams={true} />} />
						<Route path="/articles/create" element={<ArticleForm />} />
						<Route path="/articles/:id/edit" element={<ArticleForm isEdit={true} />} />
						<Route path="login" element={<Login />} />
						<Route path="register" element={<Register />} />
						<Route path="users/:id" element={<AuthorItem />} />
						{/* <Route path="admin/users" element={<UserManagement />} /> */}
						<Route path="admin/comments" element={<Comments />} />
						<Route path="admin/comments/create" element={<CommentForm />} />
						<Route path="admin/comments/:id" element={<CommentItem variant="detailed" useRouteParams={true} />} />
						<Route path="admin/comments/:id/edit" element={<CommentForm isEdit={true} />} />
						<Route path="admin/users" element={<Users />} />
						<Route path="admin/users/:id" element={<UserItem variant="detailed" useRouteParams={true} />} />
						<Route path="admin/users/:id/edit" element={<UserForm />} />
						<Route path="forbidden" element={<Forbidden />} />
						<Route path="error" element={<ErrorPage />} />
						<Route path="*" element={<NotFound />} />
					</Route>
				</Routes>
			</BrowserRouter>
		</AuthProvider>
	);
} 