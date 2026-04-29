import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PageLoader from '../components/PageLoader';
import '../styles/Certifications.css';
import bloomTechCertificatePreview from '../assets/certs-and-resume/bloomtech-certificate-preview.webp';

const certifications = [
  {
    id: 1,
    title: 'Full Stack Web Development + Technical Interviewing',
    issuer: 'BloomTech',
    date: '2025',
    credentialPreviewUrl: bloomTechCertificatePreview,
    credentialUrl: 'https://drive.google.com/file/d/118YvczGUNXpa1yL06cVlXeEwb6_x8LKU/view?usp=sharing',
    description:
      'A 960+ hour intensive program demonstrating mastery in modern full-stack web development and technical interview proficiency. Built real-world full-stack applications through rigorous technical assessments, BloomTech Labs, and advanced computer science curriculum.',
    skills: [
      'React',
      'Node.js',
      'Express',
      'SQL',
      'RESTful APIs',
      'Data Structures',
      'Algorithms',
      'Testing',
      'Git/GitHub',
      'Technical Communication',
    ],
    icon: '🎓',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const Certifications = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <section className="section certifications-section">
      <div className="certifications-container">
        <h2 className="section-title">Certifications</h2>
        <p className="section-subtitle">Professional certifications and achievements</p>

        <motion.div
          className="certifications-grid"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {certifications.map((cert) => (
            <motion.div
              key={cert.id}
              className="certification-card"
              variants={cardVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Card Header */}
              <div className="cert-header">
                <span className="cert-icon">{cert.icon}</span>
                <div className="cert-meta">
                  <span className="cert-issuer">{cert.issuer}</span>
                  <span className="cert-date">{cert.date}</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="certification-title">{cert.title}</h3>

              {/* Description */}
              <p className="certification-description">{cert.description}</p>

              {/* Skills */}
              <div className="certification-skills">
                {cert.skills.map((skill, index) => (
                  <span key={index} className="certification-skill">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Certificate Preview */}
              {cert.credentialPreviewUrl && (
                <div className="certification-preview-container">
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cert-preview-link"
                    aria-label={`View ${cert.title} Certificate`}
                  >
                    <div className="cert-preview-overlay">
                      <span>🔗 View Full Certificate</span>
                    </div>
                    <img
                      src={cert.credentialPreviewUrl}
                      alt={`${cert.title} Certificate Preview`}
                      className="certification-preview-image"
                    />
                  </a>
                </div>
              )}

              {/* CTA Button */}
              <div className="cert-actions">
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link live-link"
                >
                  View Certificate
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Certifications;