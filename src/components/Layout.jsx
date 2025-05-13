import React from 'react';
import PropTypes from 'prop-types';
// import NET from 'vanta/dist/vanta.net.min'; // Removed Vanta import
// import * as THREE from 'three'; // Removed Three.js import
import '../styles/Layout.css';

const Layout = ({ children }) => {
  // const [vantaEffect, setVantaEffect] = useState(null); // Removed Vanta state
  // const vantaRef = useRef(null); // Removed Vanta ref

  // useEffect(() => { // Removed Vanta effect
  //   if (!vantaEffect && vantaRef.current) {
  //     setVantaEffect(
  //       NET({
  //         el: vantaRef.current,
  //         THREE,
  //         mouseControls: true,
  //         touchControls: true,
  //         gyroControls: false,
  //         minHeight: window.innerHeight,
  //         minWidth: window.innerWidth,
  //         scale: 1.00,
  //         scaleMobile: 1.00,
  //         color: 0xBDC3C7,
  //         backgroundColor: 0x2C3E50,
  //         points: 8.00,
  //         maxDistance: 25.00,
  //         spacing: 20.00,
  //         showDots: false,
  //         speed: 0.3,
  //         vertexColors: false
  //       })
  //     );
  //   }
  //
  //   const handleResize = () => {
  //     if (vantaEffect) {
  //       vantaEffect.resize();
  //     }
  //   };
  //
  //   window.addEventListener('resize', handleResize);
  //   return () => {
  //     window.removeEventListener('resize', handleResize);
  //     if (vantaEffect) {
  //       vantaEffect.destroy();
  //     }
  //   };
  // }, [vantaEffect]);

  return (
    <div className="layout"> {/* Removed vantaRef */}
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