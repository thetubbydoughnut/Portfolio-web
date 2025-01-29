import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
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
          speed: 0.3
        })
      );

      // Handle window resize
      const handleResize = () => {
        if (vantaEffect) {
          vantaEffect.resize();
        }
      };
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
        if (vantaEffect) vantaEffect.destroy();
      };
    }
  }, [vantaEffect]);

  return (
    <div className="hero-wrapper">
      <section id="home" className="hero-section" ref={vantaRef}>
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="glitch-text">Cameron Graham</h1>
            <div className="subtitle-container">
              <p className="subtitle">Full Stack Developer</p>
              <div className="subtitle-underline"></div>
            </div>
            <div className="scroll-indicator">
              <div className="arrow-button-container">
                <Link to="/projects" className="arrow-button">
                  <svg
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </Link>
              </div>
              <div className="arrow-button-container">
                <Link to="/contact" className="arrow-button">
                  <svg
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>
            <div className="hero-buttons">
              <Link to="/projects" className="btn btn-primary">View Projects</Link>
              <Link to="/contact" className="btn btn-secondary">Contact Me</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HeroSection;
