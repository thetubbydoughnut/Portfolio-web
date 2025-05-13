import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import freelanceThumbnail from '../assets/images/upwork-thumbnail.webp'; // Ensure .webp extension
import '../styles/Freelancing.css';

const Freelancing = () => {
  const [loading, setLoading] = useState(true);

  const serviceDescription = `Custom React & Node.js Web Solutions!\n\nNeed a secure, modern website or web application? I'm Cameron, a BloomTech-trained Full Stack Developer (960+ hours) specializing in React.js and Node.js. I build high-quality, custom solutions tailored to your unique needs.\n\nWhat I Deliver:\n- Full-Stack Development: End-to-end creation of web applications using React for engaging frontends (Hooks, Context, Redux, Tailwind CSS) and Node.js/Express for robust, secure backends.\n- Secure API & Authentication: Expertise in RESTful APIs, JWT, Bcrypt, and seamless Auth0 integration for ironclad user authentication.\n- Interactive & Responsive UIs: Crafting dynamic user interfaces that look great on all devices.\n- Reliable & Tested Code: Implementing Jest and Cypress testing for dependable applications.\n- Database Solutions: SQL database (SQLite, Knex) integration and management.\n\nMy portfolio (including data visualization with Auth0 and secure Node.js authentication systems) showcases my commitment to quality and solving complex problems. I focus on clear communication and delivering value.\n\nTo Get Started, I'll Need:\n- A clear description of your project requirements and goals.\n- Any design mockups or specific assets`;

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
      <h1>My Freelancing Services</h1>
      <p className="freelancing-intro">
        I offer a range of web development services on popular platforms. 
        Explore my profiles below to see how I can help with your next project!
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