import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineMoon, HiOutlineSun, HiOutlineUser, HiOutlineArrowRightOnRectangle } from 'react-icons/hi2';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="header glass">
      <div className="header__container">
        <Link to="/" className="header__logo">
          <span className="text-gradient">Space</span>
        </Link>

        <nav className="header__nav">
          <Link to="/blog" className="header__link">
            Blog
          </Link>
          {isAuthenticated && (
            <Link to="/dashboard" className="header__link">
              Dashboard
            </Link>
          )}
        </nav>

        <div className="header__actions">
          <button
            className="header__icon-btn"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <HiOutlineSun size={20} /> : <HiOutlineMoon size={20} />}
          </button>

          {isAuthenticated ? (
            <>
              <span className="header__user">
                <HiOutlineUser size={18} />
                {user?.displayName || user?.email}
              </span>
              <button
                className="header__icon-btn"
                onClick={handleLogout}
                aria-label="Logout"
              >
                <HiOutlineArrowRightOnRectangle size={20} />
              </button>
            </>
          ) : (
            <Link to="/login" className="glass-btn glass-btn-primary glass-btn-sm">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
