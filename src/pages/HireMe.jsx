import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageLoader from '../components/PageLoader';
import '../styles/HireMe.css';

const HireMe = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500); // Shorter delay for content page
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <PageLoader />;
  }

  return (
    <section className="section hire-me-section">
      <div className="hire-me-container">
        <h2 className="section-title">Hire Me</h2>
        <p className="section-subtitle">Ready to build something great together?</p>

        <div className="hire-me-content">
          <div className="hire-me-block">
            <h3>Professional Summary</h3>
            <p>
              {/* TODO: Replace with actual summary from resume */}
              Highly motivated and results-oriented Full Stack Web Developer with a passion for creating efficient, scalable, and user-friendly web applications. Proven ability to learn quickly and adapt to new technologies. Eager to contribute technical skills and collaborative spirit to a challenging and rewarding role.
            </p>
          </div>

          <div className="hire-me-block">
            <h3>Key Skills</h3>
            {/* TODO: Replace with categorized skills from resume */}
            <div className="skills-category">
              <h4>Frontend:</h4>
              <ul>
                <li>React, JavaScript (ES6+), HTML5, CSS3</li>
                <li>Responsive Design, CSS Frameworks (e.g., Tailwind - *if applicable*)</li>
              </ul>
            </div>
            <div className="skills-category">
              <h4>Backend:</h4>
              <ul>
                <li>Node.js, Express</li>
                <li>RESTful APIs, SQL (e.g., PostgreSQL - *if applicable*)</li>
                <li>Authentication/Authorization</li>
              </ul>
            </div>
            <div className="skills-category">
              <h4>Tools & Other:</h4>
              <ul>
                <li>Git, GitHub, Docker (*if applicable*), Testing (e.g., Jest - *if applicable*)</li>
                <li>Agile Methodologies</li>
              </ul>
            </div>
          </div>

          <div className="hire-me-block call-to-action">
            <h3>Let's Collaborate</h3>
            <p>
              I'm actively seeking new opportunities and challenges. If you have a project in mind or think my skills align with your team's needs, I'd love to hear from you!
            </p>
            <div className="hire-me-buttons">
              <Link to="/contact" className="btn btn-primary">Contact Me</Link>
              {/* Ensure cameron-graham-resume.pdf is in the /public folder */}
              <a href="/cameron-graham-resume.pdf" download className="btn btn-secondary">Download Resume</a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HireMe; 