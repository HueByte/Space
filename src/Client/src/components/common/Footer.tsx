import { HiOutlineHeart } from 'react-icons/hi2';
import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__container">
        <p className="footer__text">
          Made with <HiOutlineHeart className="footer__heart" /> {year}
        </p>
        <p className="footer__text footer__brand">
          <span className="text-gradient">Space</span>
        </p>
      </div>
    </footer>
  );
}
