import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import HeroSection from '../components/HeroSection';

const Home = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return <HeroSection />;
};

export default Home; 