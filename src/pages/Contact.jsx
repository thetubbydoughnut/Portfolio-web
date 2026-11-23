import { useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/Contact.css';

import { resumeData } from '../data/resume';

const Contact = () => {
  const [copied, setCopied] = useState(false);
  const [copiedItem, setCopiedItem] = useState('');

  // Email, GitHub, and LinkedIn only — no phone or new contact fields
  const contactInfo = {
    email: resumeData.profile.email,
    github: resumeData.profile.links.github,
    linkedin: resumeData.profile.links.linkedin,
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

        <motion.div
          className="contact-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          <motion.div
            className="contact-card"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </div>
            <h3>Email</h3>
            <div className="contact-value" onClick={() => handleCopy(contactInfo.email, 'email')}>
              {contactInfo.email}
              <span className={`copy-tooltip ${copied && copiedItem === 'email' ? 'visible' : ''}`}>
                Copied!
              </span>
            </div>
          </motion.div>

          <motion.div
            className="contact-card"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
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
          </motion.div>

          <motion.div
            className="contact-card"
            variants={{
              hidden: { opacity: 0, scale: 0.9 },
              show: { opacity: 1, scale: 1 },
            }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="contact-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
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
          </motion.div>
        </motion.div>

        <div className="contact-message">
          <p>
            Whether you&apos;re interested in collaboration, have a project in mind, or just want to connect,
            I&apos;m always open to discussing new opportunities and ideas.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
