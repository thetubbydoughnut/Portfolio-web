import { useState } from 'react';
import '../styles/Contact.css';
import { resumeData } from '../data/resume';
import { PageFrame } from '../layout/PageFrame';

const Contact = () => {
  const [copied, setCopied] = useState(false);

  const email = resumeData.profile.email;
  const github = resumeData.profile.links.github;
  const linkedin = resumeData.profile.links.linkedin;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <PageFrame
      eyebrow="Connect"
      title="Get in Touch"
      dek="Email, GitHub, and LinkedIn — already public on this site."
    >
      <div className="contact-tiles" data-contact-tiles>
        <div
          className="contact-tile glass-panel"
          data-contact-tile="email"
          data-contact-email
        >
          <h2 className="contact-tile-title">Email</h2>
          <a className="contact-tile-value" href={`mailto:${email}`}>
            {email}
          </a>
          <button
            type="button"
            className="contact-copy"
            onClick={handleCopyEmail}
            aria-label="Copy email address"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        <div className="contact-tile glass-panel" data-contact-tile="github">
          <h2 className="contact-tile-title">GitHub</h2>
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-tile-value"
          >
            @thetubbydoughnut
          </a>
        </div>

        <div className="contact-tile glass-panel" data-contact-tile="linkedin">
          <h2 className="contact-tile-title">LinkedIn</h2>
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-tile-value"
          >
            Cameron Graham
          </a>
        </div>
      </div>
    </PageFrame>
  );
};

export default Contact;
