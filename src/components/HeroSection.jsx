import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import '../styles/HeroSection.css';
// import { FaGithub, FaLinkedin, FaEnvelope, FaFilePdf } from 'react-icons/fa'; // Removed unused icons
import profileImage from '../assets/images/cameron-profile.webp';
import { motion } from 'framer-motion';

const HeroSection = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      setVantaEffect(
        NET({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: window.innerHeight,
          minWidth: window.innerWidth,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0xBDC3C7,         // Light Gray
          backgroundColor: 0x2C3E50, // Dark Blue
          points: 8.00,
          maxDistance: 25.00,
          spacing: 20.00,
          showDots: false,
          speed: 0.3,
          vertexColors: false
        })
      );
    }

    // Handle window resize
    const handleResize = () => {
      if (vantaEffect) {
        vantaEffect.resize();
      }
    };
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div className="hero-wrapper">
      <section id="home" className="hero-section" ref={vantaRef}>
        <div className="hero-content">
          <motion.div 
            className="hero-image-container"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <img src={profileImage} alt="Cameron Graham" className="hero-image" />
          </motion.div>
          <motion.div 
            className="hero-text"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          >
            <h1 className="hero-name">Cameron Graham</h1>
            <p className="hero-title">Full Stack Web Developer</p>
            <p className="hero-summary">
              Full Stack Web Developer with BloomTech training (960+ hours) in React, Node.js, and secure application development. Proven ability to integrate APIs and manage authentication. Seeking to contribute to innovative web solutions.
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
