import '../styles/Certifications.css';
import bloomTechCertificatePreview from '../assets/certs-and-resume/bloomtech-certificate-preview.webp';
import { PageFrame } from '../layout/PageFrame';

const certifications = [
  {
    id: 1,
    title: 'Full Stack Web Development + Technical Interviewing',
    issuer: 'BloomTech',
    date: 'November 2023 – January 2025',
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
  },
  {
    id: 2,
    title: 'Programming for Everybody (Python Certification)',
    issuer: 'University of Michigan',
    date: 'September 2025',
    credentialPreviewUrl: null,
    credentialUrl: null,
    description: 'Python certification from the University of Michigan.',
    skills: ['Python'],
  },
];

const Certifications = () => {
  return (
    <PageFrame
      eyebrow="Credentials"
      title="Certifications"
      dek="BloomTech and University of Michigan."
    >
      <section className="section certifications-section page-frame-section">
        <div className="certifications-container page-frame-container">
          <div className="certifications-grid">
            {certifications.map((cert) => (
              <div key={cert.id} className="certification-card">
                <div className="cert-header">
                  <div className="cert-meta">
                    <span className="cert-issuer">{cert.issuer}</span>
                    <span className="cert-date">{cert.date}</span>
                  </div>
                </div>

                <h2 className="certification-title">{cert.title}</h2>
                <p className="certification-description">{cert.description}</p>

                <div className="certification-skills">
                  {cert.skills.map((skill) => (
                    <span key={skill} className="certification-skill">
                      {skill}
                    </span>
                  ))}
                </div>

                {cert.credentialPreviewUrl && (
                  <div className="certification-preview-container">
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cert-preview-link"
                      aria-label={`View ${cert.title} Certificate`}
                    >
                      <img
                        src={cert.credentialPreviewUrl}
                        alt={`${cert.title} Certificate Preview`}
                        className="certification-preview-image"
                        width={600}
                        height={400}
                      />
                    </a>
                  </div>
                )}

                {cert.credentialUrl && (
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
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
};

export default Certifications;
