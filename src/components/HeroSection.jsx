import { Link } from 'react-router-dom';
import { resumeData, getResumeHref, getResumeCtaLabel } from '../data/resume';
import '../styles/HeroSection.css';
import profileImage from '../assets/images/cameron-profile.webp';
import { motion } from 'framer-motion';
import { useMotionBudget } from '../motion/useMotionBudget';
import { HeroThreeBackground } from './HeroThreeBackground';
import { PageFrame } from '../layout/PageFrame';

const HeroSection = () => {
  const resumeHref = getResumeHref();
  const resumeLabel = getResumeCtaLabel(resumeHref);
  const budget = useMotionBudget();
  const effectsOn = budget === 'effects-on';

  const typeMotion = effectsOn
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0.5, ease: 'easeOut' },
      }
    : {
        initial: false,
        animate: { opacity: 1 },
        transition: { duration: 0 },
      };

  return (
    <PageFrame home>
      <div className="hero-wrapper" data-motion-budget={budget}>
        <section id="home" className="hero-section" data-testid="home-hero">
          <div className="hero-stage" aria-hidden="true">
            <HeroThreeBackground budget={budget} />
          </div>
          <div className="hero-content">
            <motion.div className="hero-text" {...typeMotion}>
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
            </motion.div>
            <div className="hero-image-container">
              <img
                src={profileImage}
                alt={resumeData.profile.name}
                className="hero-image"
                width={960}
                height={1280}
                decoding="async"
              />
            </div>
          </div>
        </section>
      </div>
    </PageFrame>
  );
};

export default HeroSection;
