import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import NET from 'vanta/dist/vanta.net.min';
import * as THREE from 'three';
import '../styles/Layout.css';

const Layout = ({ children }) => {
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
          speed: 0.3
        })
      );
    }

    const handleResize = () => {
      if (vantaEffect) {
        vantaEffect.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect]);

  return (
    <div className="layout" ref={vantaRef}>
      <div className="main-content">
        {children}
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout; 