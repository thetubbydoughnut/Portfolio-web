import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { resumeData, getResumeHref, getResumeCtaLabel } from '../data/resume';
import '../styles/HeroSection.css';
import profile480Webp from '../assets/images/cameron-profile-480.webp';
import profile960Webp from '../assets/images/cameron-profile-960.webp';
import profile480Avif from '../assets/images/cameron-profile-480.avif';
import profile960Avif from '../assets/images/cameron-profile-960.avif';
import profileFallback from '../assets/images/cameron-profile.webp';
import { useMotionBudget } from '../motion/useMotionBudget';
import { HeroThreeBackground } from './HeroThreeBackground';
import { PageFrame } from '../layout/PageFrame';

const HeroSection = () => {
  const resumeHref = getResumeHref();
  const resumeLabel = getResumeCtaLabel(resumeHref);
  const budget = useMotionBudget();
  // Defer portrait decode until after first paint so text owns LCP (A3.4).
  const [showPortrait, setShowPortrait] = useState(false);
  useEffect(() => {
    const ric = window.requestIdleCallback;
    let id;
    if (typeof ric === 'function') {
      id = ric(() => setShowPortrait(true), { timeout: 2000 });
      return () => window.cancelIdleCallback?.(id);
    }
    id = window.setTimeout(() => setShowPortrait(true), 1);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <PageFrame home>
      <div className="hero-wrapper" data-motion-budget={budget}>
        <section id="home" className="hero-section" data-testid="home-hero">
          <div className="hero-stage" aria-hidden="true">
            <HeroThreeBackground budget={budget} />
          </div>
          <div className="hero-content">
            <div className="hero-text">
              <h1 className="hero-name">{resumeData.profile.name}</h1>
              <p className="hero-title">{resumeData.profile.title}</p>
              <p className="hero-location">{resumeData.profile.location}</p>
              <p className="hero-availability">{resumeData.profile.availability}</p>
              <p className="hero-summary">{resumeData.profile.summary}</p>
              <div className="hero-buttons">
                <Link to="/projects" className="btn btn-primary">
                  View Projects
                </Link>
                <a
                  href={resumeHref}
                  className="btn btn-secondary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {resumeLabel}
                </a>
                <Link to="/contact" className="btn btn-secondary">
                  Contact
                </Link>
              </div>
            </div>
            <div className="hero-image-container">
              {showPortrait ? (
                <picture>
                  <source
                    type="image/avif"
                    srcSet={`${profile480Avif} 480w, ${profile960Avif} 960w`}
                    sizes="(max-width: 1023px) 480px, 960px"
                  />
                  <source
                    type="image/webp"
                    srcSet={`${profile480Webp} 480w, ${profile960Webp} 960w`}
                    sizes="(max-width: 1023px) 480px, 960px"
                  />
                  <img
                    src={profileFallback}
                    alt={resumeData.profile.name}
                    className="hero-image"
                    width={960}
                    height={1280}
                    decoding="async"
                    fetchPriority="low"
                  />
                </picture>
              ) : (
                <div
                  className="hero-image hero-image--placeholder"
                  role="img"
                  aria-label={resumeData.profile.name}
                />
              )}
            </div>
          </div>
        </section>
      </div>
    </PageFrame>
  );
};

export default HeroSection;
