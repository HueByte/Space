import { Link } from 'react-router-dom';
import { HiOutlineArrowRight, HiOutlineBookOpen, HiOutlineSparkles } from 'react-icons/hi2';
import { PointCloud } from '../../components/three/PointCloud';
import './HomePage.css';

export function HomePage() {
  return (
    <div className="home-page">
      <div className="home-page__background">
        <PointCloud particleCount={6000} />
      </div>

      <section className="hero">
        <div className="hero__content">
          <h1 className="hero__title">
            Welcome to <span className="text-gradient">Space</span>
          </h1>
          <p className="hero__subtitle">
            A personal corner of the universe for thoughts, ideas, and creative explorations.
            Dive into the void and discover something new.
          </p>
          <div className="hero__actions">
            <Link to="/blog" className="glass-btn glass-btn-primary glass-btn-lg">
              <HiOutlineBookOpen size={20} />
              Explore Blog
              <HiOutlineArrowRight size={18} />
            </Link>
            <Link to="/login" className="glass-btn glass-btn-lg">
              <HiOutlineSparkles size={20} />
              Get Started
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
