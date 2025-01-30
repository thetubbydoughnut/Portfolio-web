import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import '../styles/Certifications.css';

const Certifications = () => {
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  const certifications = [
    {
      id: 1,
      title: "Full Stack Web Development + Technical Interviewing",
      issuer: "BloomTech",
      date: "2025",
      credentialUrl: "https://drive.google.com/file/d/118YvczGUNXpa1yL06cVlXeEwb6_x8LKU/view?usp=sharing",
      previewUrl: "https://drive.google.com/thumbnail?id=118YvczGUNXpa1yL06cVlXeEwb6_x8LKU",
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
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handlePreviewClick = (url) => {
    setPreviewUrl(url === previewUrl ? null : url);
  };

  if (loading) {
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
                <div className="certification-actions">
                  {cert.previewUrl && (
                    <button 
                      onClick={() => handlePreviewClick(cert.previewUrl)}
                      className="preview-button"
                    >
                      {previewUrl === cert.previewUrl ? 'Hide Preview' : 'Show Preview'}
                    </button>
                  )}
                  {cert.credentialUrl && (
                    <a 
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certification-link"
                    >
                      View Credential
                    </a>
                  )}
                </div>
                {previewUrl === cert.previewUrl && (
                  <div className="preview-container">
                    <a 
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="preview-link"
                    >
                      <img 
                        src={cert.previewUrl} 
                        alt={`${cert.title} Preview`} 
                        className="credential-preview"
                      />
                      <div className="preview-overlay">
                        <span>Click to view full credential</span>
                      </div>
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