import { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');

  const contactInfo = {
    email: 'thetubbydoughnut@gmail.com',
    phone: '(661) 972-5200',
    github: 'https://github.com/thetubbydoughnut',
    linkedin: 'https://www.linkedin.com/in/thetubbydoughnut/'
  };

  const handleCopy = (text, item) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedItem(item);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setCopiedItem('');
      }, 2000);
    });
  };

  return (
    <section className="section contact-section">
      <div className="contact-container">
        <h2 className="section-title">Get in Touch</h2>
        <p className="section-subtitle">
          Feel free to reach out for collaborations or just a friendly hello
        </p>

        <div className="contact-grid">
          {/* Email Card */}
          <div className="contact-card">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <h3>Email</h3>
            <div className="contact-value" onClick={() => handleCopy(contactInfo.email, 'email')}>
              {contactInfo.email}
              <span className={`copy-tooltip ${copied && copiedItem === 'email' ? 'visible' : ''}`}>
                Copied!
              </span>
            </div>
          </div>

          {/* Phone Card */}
          <div className="contact-card">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h3>Phone</h3>
            <div className="contact-value" onClick={() => handleCopy(contactInfo.phone, 'phone')}>
              {contactInfo.phone}
              <span className={`copy-tooltip ${copied && copiedItem === 'phone' ? 'visible' : ''}`}>
                Copied!
              </span>
            </div>
          </div>

          {/* Social Links */}
          <div className="contact-card">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
              </svg>
            </div>
            <h3>GitHub</h3>
            <a 
              href={contactInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              @thetubbydoughnut
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </div>
            <h3>LinkedIn</h3>
            <a 
              href={contactInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-link"
            >
              Cameron Graham
            </a>
          </div>
        </div>

        <div className="contact-message">
          <p>
            Whether you're interested in collaboration, have a project in mind, or just want to connect,
            I'm always open to discussing new opportunities and ideas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact; 