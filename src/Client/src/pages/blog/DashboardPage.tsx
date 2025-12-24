import { useState, useCallback, FormEvent, ChangeEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlinePencil,
  HiOutlineDocument,
  HiOutlineEye,
  HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import blogService from '../../services/blogService';
import { useAuth } from '../../contexts/AuthContext';
import './DashboardPage.css';

export function DashboardPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['allPosts'],
    queryFn: () => blogService.getAllPosts(1, 50),
  });

  const deleteMutation = useMutation({
    mutationFn: blogService.deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
    },
  });

  const handleDelete = useCallback(
    (id: string) => {
      if (window.confirm('Are you sure you want to delete this post?')) {
        deleteMutation.mutate(id);
      }
    },
    [deleteMutation]
  );

  return (
    <div className="dashboard-page container">
      <header className="page-header">
        <div className="dashboard-header">
          <div>
            <h1>
              <span className="text-gradient">Dashboard</span>
            </h1>
            <p className="page-subtitle">Welcome back, {user?.displayName || user?.email}</p>
          </div>
          <button
            className="glass-btn glass-btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <HiOutlinePlus size={18} />
            New Post
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="page-loading">
          <div className="spinner" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="empty-state glass-card">
          <HiOutlineDocument size={48} />
          <h3>No posts yet</h3>
          <p>Create your first post to get started</p>
          <button
            className="glass-btn glass-btn-primary"
            onClick={() => setShowUploadModal(true)}
          >
            <HiOutlinePlus size={18} />
            Create Post
          </button>
        </div>
      ) : (
        <div className="posts-table glass-panel">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((post) => (
                <tr key={post.id}>
                  <td>
                    <Link to={`/blog/${post.slug}`} className="post-title-link">
                      {post.title}
                    </Link>
                  </td>
                  <td>
                    {post.isPublished ? (
                      <span className="status-badge status-badge--success">
                        <HiOutlineEye size={12} />
                        Published
                      </span>
                    ) : (
                      <span className="status-badge status-badge--warning">
                        <HiOutlineEyeSlash size={12} />
                        Draft
                      </span>
                    )}
                  </td>
                  <td>
                    {new Date(post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <div className="table-actions">
                      <button
                        className="glass-btn glass-btn-ghost glass-btn-sm"
                        title="Edit"
                      >
                        <HiOutlinePencil size={16} />
                      </button>
                      <button
                        className="glass-btn glass-btn-ghost glass-btn-sm"
                        onClick={() => handleDelete(post.id)}
                        title="Delete"
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUploadModal && (
        <UploadModal onClose={() => setShowUploadModal(false)} />
      )}
    </div>
  );
}

function UploadModal({ onClose }: { onClose: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: () =>
      blogService.uploadMarkdown(file!, title, summary || undefined, isPublished, tags || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allPosts'] });
      onClose();
    },
    onError: () => {
      setError('Failed to upload post. Please try again.');
    },
  });

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.(md|markdown)$/i, ''));
      }
    }
  }, [title]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      if (!file || !title) {
        setError('Please select a file and enter a title');
        return;
      }
      uploadMutation.mutate();
    },
    [file, title, uploadMutation]
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal glass-panel" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal__title">Upload Markdown Post</h2>

        <form onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="form-group">
            <label className="form-label">Markdown File</label>
            <input
              type="file"
              accept=".md,.markdown"
              onChange={handleFileChange}
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="glass-input"
              placeholder="Post title"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Summary (optional)</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="glass-textarea"
              placeholder="Brief summary of the post"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="glass-input"
              placeholder="tech, ideas, thoughts"
            />
          </div>

          <div className="form-group form-group--checkbox">
            <label>
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
              />
              <span>Publish immediately</span>
            </label>
          </div>

          <div className="modal__actions">
            <button type="button" className="glass-btn" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="glass-btn glass-btn-primary"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? <span className="spinner" /> : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
