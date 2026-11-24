import { useState, useEffect, useId, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { Glass, Button, TabBar } from 'glisse';
import profileHeaderImage from '../assets/images/cameron-profile-header.webp';
import { resumeData, getResumeHref, getResumeCtaLabel } from '../data/resume';
import resumePreview from '../assets/certs-and-resume/Cameron-Graham-Resume.webp';
import { useTheme } from '../theme/useTheme';
import { useMotionBudget } from '../motion/useMotionBudget';
import '../styles/Header.css';

const NAV_ITEMS = [
  { value: '/', label: 'Home' },
  { value: '/projects', label: 'Projects' },
  { value: '/skills', label: 'Skills' },
  { value: '/experience', label: 'Experience' },
  { value: '/certifications', label: 'Certifications' },
  { value: '/contact', label: 'Contact' },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const budget = useMotionBudget();
  const navigate = useNavigate();
  const location = useLocation();
  const menuId = useId();
  const menuToggleRef = useRef(null);
  const resumeHref = getResumeHref();
  const resumeLabel = getResumeCtaLabel(resumeHref);
  const effectsOn = budget === 'effects-on';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isMenuOpen]);

  // A3.5.6: Glisse CSS only on effects-on (keeps initial-route CSS on budget).
  useEffect(() => {
    if (!effectsOn) return undefined;
    let cancelled = false;
    import('glisse/styles.css').catch(() => {
      /* non-fatal: static shell still works */
    });
    return () => {
      cancelled = true;
      void cancelled;
    };
  }, [effectsOn]);

  const activeNav =
    NAV_ITEMS.find((item) =>
      item.value === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(item.value)
    )?.value ?? '/';

  const glassClass = effectsOn ? 'shell-glass shell-glass--live' : 'shell-glass shell-glass--static';

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header
        className={`header ${isScrolled ? 'scrolled' : ''} ${glassClass}`}
        data-motion-budget={budget}
      >
        <div className="header-content" data-glisse-backdrop={effectsOn ? '' : undefined}>
          <div className="logo-container">
            <NavLink to="/" className="logo-image-link" aria-label="Home">
              <img
                src={profileHeaderImage}
                alt={`${resumeData.profile.name}`}
                className="logo-image"
                width={32}
                height={32}
              />
            </NavLink>
            <NavLink to="/" className="logo-text-link">
              <span className="logo-text">&lt;Cameron Graham /&gt;</span>
            </NavLink>
          </div>

          <button
            ref={menuToggleRef}
            type="button"
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label="Toggle navigation menu"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav
            id={menuId}
            className={`nav-links ${isMenuOpen ? 'active' : ''}`}
            aria-label="Primary"
          >
            <div className="nav-glass-wrap desktop-nav">
              {effectsOn ? (
                <Glass className="nav-glisse-bar" style={{ borderRadius: 'var(--radius-glass)' }}>
                  <TabBar
                    aria-label="Primary"
                    items={NAV_ITEMS.map(({ value, label }) => ({ value, label }))}
                    value={activeNav}
                    onValueChange={(value) => {
                      if (value) navigate(value);
                    }}
                  />
                </Glass>
              ) : (
                <ul className="nav-list-static">
                  {NAV_ITEMS.map(({ value, label }) => (
                    <li key={value}>
                      <NavLink
                        to={value}
                        className={({ isActive }) =>
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {label}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <ul className="nav-list-mobile">
              {NAV_ITEMS.map(({ value, label }) => (
                <li key={value}>
                  <NavLink
                    to={value}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className="resume-download-container">
              <a
                href={resumeHref}
                className="nav-link resume-download"
                onClick={() => setIsMenuOpen(false)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {resumeLabel}
              </a>
              <div className="resume-preview">
                <img
                  src={resumePreview}
                  alt="Resume Preview"
                  width={600}
                  height={776}
                />
              </div>
            </div>

            <div className="theme-toggle-wrap">
              {effectsOn ? (
                <Button
                  type="button"
                  variant="glass"
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  onClick={() => toggleTheme()}
                >
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              ) : (
                <button
                  type="button"
                  className="theme-toggle theme-toggle--static"
                  aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                  onClick={() => toggleTheme()}
                >
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              )}
            </div>

            <div className="social-links">
              <a
                href={resumeData?.profile?.links?.github}
                target="_blank"
                rel="noopener noreferrer"
                className="social-link"
                aria-label="GitHub Profile"
              >
                <FaGithub />
              </a>
              <a
                href={resumeData?.profile?.links?.linkedin}
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
    </>
  );
};

export default Header;
