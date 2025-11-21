const API_BASE = import.meta.env.VITE_API_URL || '';
const BLOG_BASE = `${API_BASE}/api/blog`;

export const getBlogPostsRoute = (): string => BLOG_BASE;

export const getBlogPostByIdRoute = (id: number | string): string => `${BLOG_BASE}/${id}`;

export const postBlogPostRoute = (): string => BLOG_BASE;

export const putBlogPostRoute = (id: number | string): string => `${BLOG_BASE}/${id}`;

export const deleteBlogPostRoute = (id: number | string): string => `${BLOG_BASE}/${id}`;
