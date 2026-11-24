import { resumeData } from '../data/resume';
import '../styles/Experience.css';

const Experience = () => {
  return (
    <section id="experience" className="experience-section page-frame-section">
      <div className="experience-container page-frame-container">
        <div className="experience-timeline">
          {resumeData.experience.map((job, index) => (
            <article key={`${job.company}-${index}`} className="experience-card">
              <div className="experience-header">
                <div className="role-company">
                  <h2>{job.role}</h2>
                  {job.url ? (
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="company-name company-link"
                    >
                      {job.company}
                    </a>
                  ) : (
                    <span className="company-name">{job.company}</span>
                  )}
                </div>
                <div className="meta-info">
                  <span className="period">{job.period}</span>
                  <span className="location">{job.location}</span>
                </div>
              </div>
              {job.stack ? <p className="experience-stack">{job.stack}</p> : null}
              <ul className="experience-points">
                {job.description.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
