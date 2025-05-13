import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import profileImage from '../assets/images/cameron-profile.webp';
import resumeWebpPath from '../assets/Certs and resume/05-12-2025 Cameron Graham Full Stack Web Developer Resume.webp';
import '../styles/Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        <div className="logo-container">
          <NavLink to="/" className="logo-image-link">
            <img 
              src={profileImage}
              alt="Cameron Graham Profile Picture" 
              className="logo-image"
            />
          </NavLink>
          <NavLink to="/" className="logo-text-link">
            <span className="logo-text">PixelPerfectDev</span>
          </NavLink>
        </div>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`nav-links ${isMenuOpen ? 'active' : ''}`}>
          <NavLink 
            to="/" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink 
            to="/projects" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Projects
          </NavLink>
          <NavLink 
            to="/skills" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Skills
          </NavLink>
          <NavLink 
            to="/certifications" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Certifications
          </NavLink>
          <NavLink 
            to="/freelancing" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Freelancing
          </NavLink>
          <NavLink 
            to="/contact" 
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </NavLink>
          <NavLink 
            to="/hire-me"
            className={({ isActive }) => `nav-link nav-link-hire ${isActive ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Hire Me
          </NavLink>
          <a 
            href={resumeWebpPath} 
            download="Cameron_Graham_Resume.webp"
            className="nav-link resume-download"
            onClick={() => setIsMenuOpen(false)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download Resume
          </a>
          <div className="social-links">
            <a
              href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}`}
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="GitHub Profile"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/thetubbydoughnut/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="LinkedIn Profile"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://x.com/thetubbydonut"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
              aria-label="Twitter Profile"
            >
              <FaTwitter />
            </a>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
