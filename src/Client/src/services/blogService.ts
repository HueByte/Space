import apiClient from './apiClient';
import type {
  BlogPost,
  BlogPostListItem,
  PaginatedResponse,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
} from '../types';

export const blogService = {
  async getPosts(page = 1, pageSize = 10): Promise<PaginatedResponse<BlogPostListItem>> {
    const response = await apiClient.get<PaginatedResponse<BlogPostListItem>>('/posts', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getAllPosts(page = 1, pageSize = 10): Promise<PaginatedResponse<BlogPostListItem>> {
    const response = await apiClient.get<PaginatedResponse<BlogPostListItem>>('/posts/all', {
      params: { page, pageSize },
    });
    return response.data;
  },

  async getPostById(id: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/posts/${id}`);
    return response.data;
  },

  async getPostBySlug(slug: string): Promise<BlogPost> {
    const response = await apiClient.get<BlogPost>(`/posts/slug/${slug}`);
    return response.data;
  },

  async createPost(data: CreateBlogPostRequest): Promise<BlogPost> {
    const response = await apiClient.post<BlogPost>('/posts', data);
    return response.data;
  },

  async uploadMarkdown(
    file: File,
    title: string,
    summary?: string,
    isPublished = false,
    tags?: string
  ): Promise<BlogPost> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    if (summary) formData.append('summary', summary);
    formData.append('isPublished', String(isPublished));
    if (tags) formData.append('tags', tags);

    const response = await apiClient.post<BlogPost>('/posts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updatePost(id: string, data: UpdateBlogPostRequest): Promise<BlogPost> {
    const response = await apiClient.put<BlogPost>(`/posts/${id}`, data);
    return response.data;
  },

  async deletePost(id: string): Promise<void> {
    await apiClient.delete(`/posts/${id}`);
  },
};

export default blogService;
