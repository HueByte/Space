import { useState, useCallback, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineUser,
  HiOutlineArrowRight,
} from 'react-icons/hi2';
import { useAuth } from '../../contexts/AuthContext';
import './AuthPage.css';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
        await register({ email, password, displayName: displayName || undefined });
        navigate('/dashboard');
      } catch (err) {
        setError('Registration failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, displayName, register, navigate]
  );

  return (
    <div className="auth-page">
      <div className="auth-card glass-panel">
        <div className="auth-card__header">
          <h1 className="auth-card__title">
            Join <span className="text-gradient">Space</span>
          </h1>
          <p className="auth-card__subtitle">Create your account and start sharing</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-form__error">{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="displayName">
              Display Name (optional)
            </label>
            <div className="input-with-icon">
              <HiOutlineUser className="input-icon" />
              <input
                id="displayName"
                type="text"
                className="glass-input"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-with-icon">
              <HiOutlineEnvelope className="input-icon" />
              <input
                id="email"
                type="email"
                className="glass-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-with-icon">
              <HiOutlineLockClosed className="input-icon" />
              <input
                id="password"
                type="password"
                className="glass-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="glass-btn glass-btn-primary glass-btn-lg auth-form__submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <>
                Create Account
                <HiOutlineArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-card__footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
