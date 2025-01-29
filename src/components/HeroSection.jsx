import React, { useState, useEffect, useRef } from 'react';
import WAVES from 'vanta/dist/vanta.waves.min';
import * as THREE from 'three';
import '../styles/HeroSection.css';

const HeroSection = () => {
  const [vantaEffect, setVantaEffect] = useState(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        WAVES({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          gyroControls: false,
          minHeight: 200.00,
          minWidth: 200.00,
          scale: 1.00,
          scaleMobile: 1.00,
          color: 0x646cff,
          shininess: 35.00,
          waveHeight: 15.00,
          waveSpeed: 0.75,
          zoom: 0.65
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <section id="home" className="hero-section" ref={vantaRef}>
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="glitch-text">Cameron Graham</h1>
          <p className="subtitle">Full Stack Developer</p>
          <div className="hero-buttons">
            <a href="#projects" className="btn btn-primary">View Projects</a>
            <a href="#contact" className="btn btn-secondary">Contact Me</a>
          </div>
        </div>
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <div className="arrow"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
