export interface User {
  id: string;
  email: string;
  displayName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  author: Author;
  tags: string[];
}

export interface BlogPostListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: string;
  isPublished: boolean;
  createdAt: string;
  publishedAt?: string;
  author: Author;
  tags: string[];
}

export interface Author {
  id: string;
  displayName?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateBlogPostRequest {
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  isPublished: boolean;
  tags: string[];
}

export interface UpdateBlogPostRequest {
  title: string;
  content: string;
  summary?: string;
  coverImage?: string;
  isPublished: boolean;
  tags: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  displayName?: string;
}

export interface ApiError {
  title: string;
  detail: string;
  status: number;
}
