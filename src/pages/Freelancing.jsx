import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLoader from '../components/PageLoader';
import freelanceThumbnail from '../assets/images/upwork-thumbnail.webp'; // Ensure .webp extension
import '../styles/Freelancing.css';

const Freelancing = () => {
  const [loading, setLoading] = useState(true);

  const serviceDescription = `Expert Software Engineering & Automation: Custom Scalable Solutions!\n\nI am a High-velocity Software Engineer and Founder with a proven track record of architecting scalable full-stack platforms and automating complex business logistics. Specializing in React, Node.js, and Python (FastAPI), I deliver production-grade solutions that solve critical business inefficiencies.\n\nWhat My Services Include:\n- Full-Stack Architecture: End-to-end development of robust web applications using React, TypeScript, and Node.js/FastAPI.\n- Workflow Automation: Custom n8n pipelines to automate logistics, data routing, and internal operations, significantly reducing administrative overhead.\n- High-Performance Backends: secure API design (REST) with advanced authentication (JWT, OAuth) and database management (PostgreSQL, SQLite).\n- Modern Dyes & AI Integration: Leveraging latest tools (AI IDEs, LLMs) to accelerate development cycles and deliver premium results faster.\n- E-commerce & Payments: deep integration with Stripe API and logistics providers like EasyPost for seamless revenue generation.\n\nAs the Founder of Legendary Printed Loot, I understand the intersection of technical excellence and business value. I don't just write code; I build systems that help your business scale.`;

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
    <motion.div
      className="freelancing-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
    </motion.div>
  );
};

export default Freelancing; 