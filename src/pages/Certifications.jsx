import { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import '../styles/Certifications.css';
// Import the local PDF file
import bloomTechCertificate from '../assets/BloomTech Certificate of Completion - Cameron Graham (Full Stack Web Development).pdf';

const Certifications = () => {
  const [loading, setLoading] = useState(true);

  const certifications = [
    {
      id: 1,
      title: "Full Stack Web Development + Technical Interviewing",
      issuer: "BloomTech",
      date: "2025",
      // Use the imported PDF path for the iframe source
      credentialPreviewUrl: bloomTechCertificate, 
      // Keep the Google Drive link as a fallback or external link if needed
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
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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
                {cert.credentialPreviewUrl && (
                  <div className="certification-iframe-container">
                    <iframe 
                      src={cert.credentialPreviewUrl} 
                      title={`${cert.title} Preview`} 
                      width="100%" 
                      className="certification-iframe"
                      allowFullScreen
                    ></iframe>
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