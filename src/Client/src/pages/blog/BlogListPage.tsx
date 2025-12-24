import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineCalendar, HiOutlineTag, HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineDocumentText } from 'react-icons/hi2';
import blogService from '../../services/blogService';
import type { BlogPostListItem } from '../../types';
import './BlogListPage.css';

export function BlogListPage() {
  const [page, setPage] = useState(1);
  const pageSize = 9;

  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', page, pageSize],
    queryFn: () => blogService.getPosts(page, pageSize),
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  // Treat errors the same as empty - API might not be running or no posts exist
  const posts = data?.items ?? [];
  const isEmpty = error || posts.length === 0;

  return (
    <div className="blog-list-page container">
      <header className="page-header">
        <h1>
          <span className="text-gradient">Blog</span>
        </h1>
        <p className="page-subtitle">Thoughts, ideas, and explorations from the void</p>
      </header>

      {isEmpty ? (
        <div className="empty-state glass-card">
          <HiOutlineDocumentText size={48} className="empty-state__icon" />
          <h3>No posts yet</h3>
          <p>The void is empty... for now. Check back soon for new content!</p>
        </div>
      ) : (
        <>
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>

          {data && data.totalPages > 1 && (
            <div className="pagination">
              <button
                className="glass-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.hasPreviousPage}
              >
                <HiOutlineChevronLeft size={18} />
                Previous
              </button>
              <span className="pagination__info">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                className="glass-btn"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.hasNextPage}
              >
                Next
                <HiOutlineChevronRight size={18} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BlogCard({ post }: { post: BlogPostListItem }) {
  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link to={`/blog/${post.slug}`} className="blog-card glass-card">
      {post.coverImage && (
        <div className="blog-card__image">
          <img src={post.coverImage} alt={post.title} />
        </div>
      )}
      <div className="blog-card__content">
        <h2 className="blog-card__title">{post.title}</h2>
        {post.summary && <p className="blog-card__summary">{post.summary}</p>}

        <div className="blog-card__meta">
          <span className="blog-card__date">
            <HiOutlineCalendar size={14} />
            {formattedDate}
          </span>
          {post.tags.length > 0 && (
            <span className="blog-card__tags">
              <HiOutlineTag size={14} />
              {post.tags.slice(0, 2).join(', ')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
