import React from 'react';
import { Link } from 'react-router-dom';
import { resumeData } from '../data/resume';
import '../styles/HeroSection.css';
import profileImage from '../assets/images/cameron-profile.webp';
import { motion } from 'framer-motion';

const HeroSection = () => {
  return (
    <div className="hero-wrapper">
      <section id="home" className="hero-section">
        <div className="hero-background-overlay"></div>
        <div className="hero-content">
          <motion.div
            className="hero-image-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src={profileImage} alt={resumeData.profile.name} className="hero-image" />
          </motion.div>
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <h1 className="hero-name">{resumeData.profile.name}</h1>
            <p className="hero-title">{resumeData.profile.title}</p>
            <p className="hero-summary">
              {resumeData.profile.summary}
            </p>
            <motion.div
              className="hero-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              <Link to="/projects" className="btn btn-primary">View Projects</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Me</Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
