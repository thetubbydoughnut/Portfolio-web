import React, { useState, useEffect } from 'react';
import { FaBriefcase } from 'react-icons/fa';
import PageLoader from '../components/PageLoader';
import '../styles/Freelancing.css';

const Freelancing = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="freelancing-container">
      <h1>Freelancing Services</h1>
      <div className="services-grid">
        <div className="service-card">
          <div className="service-icon">
            <FaBriefcase />
          </div>
          <h2>Fiverr Services</h2>
          <p>Professional web development services including custom websites, React applications, and full-stack solutions.</p>
          <a 
            href="https://www.fiverr.com/s/Gzpe0RZ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="service-link"
          >
            View Fiverr Profile
          </a>
        </div>

        <div className="service-card">
          <div className="service-icon">
            <FaBriefcase />
          </div>
          <h2>Upwork Services</h2>
          <p>Expert React and JavaScript development services for modern web applications and custom website solutions.</p>
          <a 
            href="https://www.upwork.com/services/product/development-it-modern-react-javascript-web-solutions-custom-website-development-1900040919662094285?ref=project_share" 
            target="_blank" 
            rel="noopener noreferrer"
            className="service-link"
          >
            View Upwork Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default Freelancing; 