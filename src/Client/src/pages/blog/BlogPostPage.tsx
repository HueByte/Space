import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineArrowLeft, HiOutlineCalendar, HiOutlineUser, HiOutlineTag } from 'react-icons/hi2';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import blogService from '../../services/blogService';
import './BlogPostPage.css';

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => blogService.getPostBySlug(slug!),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="spinner" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container container-narrow">
        <div className="page-error glass-card">
          <h2>Post not found</h2>
          <p>The post you're looking for doesn't exist or has been removed.</p>
          <Link to="/blog" className="glass-btn glass-btn-primary">
            <HiOutlineArrowLeft size={18} />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="blog-post-page">
      <div className="container container-narrow">
        <Link to="/blog" className="blog-post__back">
          <HiOutlineArrowLeft size={18} />
          Back to Blog
        </Link>

        <header className="blog-post__header">
          <h1 className="blog-post__title">{post.title}</h1>

          <div className="blog-post__meta">
            <span className="blog-post__meta-item">
              <HiOutlineCalendar size={16} />
              {formattedDate}
            </span>
            {post.author.displayName && (
              <span className="blog-post__meta-item">
                <HiOutlineUser size={16} />
                {post.author.displayName}
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="blog-post__tags">
              <HiOutlineTag size={16} />
              {post.tags.map((tag) => (
                <span key={tag} className="blog-post__tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {post.coverImage && (
          <div className="blog-post__cover">
            <img src={post.coverImage} alt={post.title} />
          </div>
        )}

        <div className="blog-post__content glass-panel">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
