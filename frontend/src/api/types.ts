// Authentication types
export interface RegisterUserData {
	lastName: string;
	firstName: string;
	username: string;
	password: string;
	email: string;
}

export interface UserEditRequest {
	lastName: string;
	firstName: string;
	email: string;
	username: string;
	role: string;
}

export interface LoginUserData {
	username: string;
	password: string;
}

export interface AuthResponse {
	token: string;
	username: string;
}

export interface User {
	id?: string;
	username: string;
	authorities: string[];
}

export interface JwtAuthority {
	authority: string;
}

export interface JwtPayload {
	sub: string;
	authorities: JwtAuthority[];
}

// Article types
export interface Article {
	id?: string;
	title: string;
	content: string;
	summary?: string;
	imageUrl?: string;
	author?: UserDetail;
	editor?: UserDetail;
	createdAt?: string;
	updatedAt?: string;
	createdDate?: string;
	updatedDate?: string;
	// Crop metadata for cover image display
	cropX?: number;
	cropY?: number;
	cropWidth?: number;
	cropHeight?: number;
	cropScale?: number;
}

export interface ArticleFilters {
	title?: string;
	author?: string;
	[key: string]: string | undefined;
}

export interface SortCriteria {
	field: string;
	direction: 'ASC' | 'DESC';
}

export interface FetchArticlesParams {
	filters: ArticleFilters;
	sortCriteria: SortCriteria[];
	size?: number;
	from?: number;
}

export interface ArticlesResponse {
	articles: Article[];
	totalElements: number;
	totalPages: number;
	currentPage: number;
}

// Comment types
export interface Comment {
	id?: string;
	content: string;
	author?: UserDetail;
	editor?: UserDetail;
	createdAt?: string;
	dateCreated?: string;
	dateEdited?: string;
	article?: Article;
}

// User Management types
export interface UserDetail {
	id: string;
	username: string;
	firstName: string;
	lastName: string;
	email: string;
	role?: string;
	authorities: string[];
	createdAt?: string;
	createdDate?: string;
	profilePicture?: string;
}

export interface UserRole {
	role: string;
}

// Error types
export interface ApiError {
	message?: string;
	detail?: string;
} 