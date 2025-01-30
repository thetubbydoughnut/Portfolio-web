import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

const VantaBackground = ({ children }) => {
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
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return (
    <div ref={vantaRef} className="vanta-background">
      {children}
    </div>
  );
};

export default VantaBackground; 