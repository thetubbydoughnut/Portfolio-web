import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import PageLoader from '../components/PageLoader';
import '../styles/Certifications.css';
// Remove the unused PDF import
// import bloomTechCertificatePath from '../assets/Certs and resume/BloomTech Certificate of Completion - Cameron Graham (Full Stack Web Development).pdf'; 
// Import the preview image
import bloomTechCertificatePreview from '../assets/certs-and-resume/bloomtech-certificate-preview.webp';

const Certifications = () => {
  const [isLoading, setIsLoading] = useState(true);

  const certifications = [
    {
      id: 1,
      title: "Full Stack Web Development + Technical Interviewing",
      issuer: "BloomTech",
      date: "2025",
      // Use the imported image for the preview source
      credentialPreviewUrl: bloomTechCertificatePreview,
      // Keep the Google Drive link for the actual verification link
      credentialUrl: "https://drive.google.com/file/d/118YvczGUNXpa1yL06cVlXeEwb6_x8LKU/view?usp=sharing",
      description: "A comprehensive certification demonstrating mastery in modern web development technologies and technical interview proficiency. Achieved through rigorous technical assessments, development of full-stack applications, advanced computer science curriculum completion, and successful participation in BloomTech Labs working on complex real-world projects. Demonstrates expertise in front-end (React, HTML5, CSS3), back-end (Node.js, Express, SQL), testing methodologies, and professional development practices.",
      skills: [
        "React", "Node.js", "Express", "SQL", "RESTful APIs",
        "Data Structures", "Algorithms", "Testing", "Git/GitHub",
        "Technical Communication"
      ]
    },
    // Add more certifications here
  ];

  useEffect(() => {
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <section className="section certifications-section">
      <div className="certifications-container">
        <h2 className="section-title">Certifications</h2>
        <p className="section-subtitle">Professional certifications and achievements</p>

        <div className="certifications-grid">
          {certifications.map(cert => (
            <div key={cert.id} className="certification-card">
              <div className="certification-content">
                <h3 className="certification-title">{cert.title}</h3>
                <div className="certification-issuer">
                  <span className="issuer-name">{cert.issuer}</span>
                  <span className="certification-date">{cert.date}</span>
                </div>
                <p className="certification-description">
                  {cert.description}
                </p>
                <div className="certification-skills">
                  {cert.skills.map((skill, index) => (
                    <span key={index} className="certification-skill">
                      {skill}
                    </span>
                  ))}
                </div>
                {/* Replace iframe with linked image */}
                {cert.credentialPreviewUrl && cert.credentialUrl && (
                  <div className="certification-preview-container">
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" title={`View ${cert.title} Certificate (opens in new tab)`}>
                      <img
                        src={cert.credentialPreviewUrl}
                        alt={`${cert.title} Preview`}
                        className="certification-preview-image"
                      />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Certifications; 