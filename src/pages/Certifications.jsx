import '../styles/Certifications.css';
import { PageFrame } from '../layout/PageFrame';
import { certifications } from '../data/certifications';

const Certifications = () => {
  return (
    <PageFrame
      eyebrow="Credentials"
      title="Certifications"
      dek="BloomTech and University of Michigan."
    >
      <div className="certifications-list" data-certifications-list>
        {certifications.map((cert) => (
          <article key={cert.id} className="certification-entry glass-panel">
            <div className="cert-meta">
              <span className="cert-issuer">{cert.issuer}</span>
              <span className="cert-date">{cert.date}</span>
            </div>

            <h2 className="certification-title">{cert.title}</h2>
            <p className="certification-description">{cert.description}</p>

            <ul className="certification-skills">
              {cert.skills.map((skill) => (
                <li key={skill} className="certification-skill">
                  {skill}
                </li>
              ))}
            </ul>

            {cert.credentialPreviewUrl ? (
              <div className="cert-media-well" data-cert-media-well>
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
                    width={1056}
                    height={816}
                  />
                </a>
              </div>
            ) : null}

            {cert.credentialUrl ? (
              <div className="cert-actions">
                <a
                  href={cert.credentialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cert-link"
                >
                  View Certificate
                </a>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </PageFrame>
  );
};

export default Certifications;
