import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import freelanceThumbnail from '../assets/images/upwork-thumbnail.webp'; // Ensure .webp extension
import '../styles/Freelancing.css';

const Freelancing = () => {
  const [loading, setLoading] = useState(true);

  const serviceDescription = `Expert Freelance Web Development: Custom React & Node.js Solutions!\n\nSeeking reliable freelance web development services for your secure, modern website or web application? I'm Cameron, a BloomTech-trained Full Stack Developer (960+ hours) specializing in freelance React.js and Node.js projects. I deliver high-quality, custom web solutions tailored to your unique business needs, from small business websites to complex web app development services.\n\nWhat My Freelance Web Development Services Include:\n- Full-Stack Development: End-to-end creation of web applications using React for engaging frontends (Hooks, Context, Redux, Tailwind CSS) and Node.js/Express for robust, secure backends.\n- Secure API & Authentication: Expertise in RESTful APIs, JWT, Bcrypt, and seamless Auth0 integration for ironclad user authentication.\n- Interactive & Responsive UIs: Crafting dynamic user interfaces that look great on all devices, enhancing user experience for your clients.\n- Reliable & Tested Code: Implementing Jest and Cypress testing for dependable and maintainable applications.\n- Database Solutions: SQL database (SQLite, Knex) integration and management for your data-driven projects.\n\nMy portfolio (including data visualization with Auth0 and secure Node.js authentication systems) showcases my commitment to quality and solving complex problems. As a dedicated freelance developer, I focus on clear communication and delivering tangible value.\n\nTo Get Started with My Web Development Services, I'll Need:\n- A clear description of your project requirements and goals.\n- Any design mockups or specific assets you wish to incorporate.`;

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
      <h1>My Freelancing Web Development Services</h1>
      <p className="freelancing-intro">
        As a freelance web developer, I offer a range of professional web development services on popular platforms and directly to clients. 
        Explore my profiles or contact me to see how I can provide custom web solutions for your next project!
      </p>
      
      <div className="single-service-card">
        <img 
          src={freelanceThumbnail} 
          alt="Freelance Services Thumbnail" 
          className="freelance-service-thumbnail"
        />
        <h2>Custom React & Node.js Web Solutions</h2>
        <div className="service-description">
          {serviceDescription.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
        <div className="freelance-buttons-container">
          <a 
            href="https://www.fiverr.com/s/Gzpe0RZ" 
            target="_blank" 
            rel="noopener noreferrer"
            className="service-link fiverr-link"
          >
            View Fiverr Profile
          </a>
          <a 
            href="https://www.upwork.com/services/product/development-it-modern-react-javascript-web-solutions-custom-website-development-1900040919662094285?ref=project_share" 
            target="_blank" 
            rel="noopener noreferrer"
            className="service-link upwork-link"
          >
            View Upwork Profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default Freelancing; 