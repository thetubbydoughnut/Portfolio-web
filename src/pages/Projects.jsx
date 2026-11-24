import { projects } from '../data/projects';
import '../styles/Projects.css';
import { PageFrame } from '../layout/PageFrame';

const Projects = () => {
  return (
    <PageFrame
      eyebrow="Work"
      title="Projects"
      dek="Curated work from production and personal builds."
    >
      <section className="section projects-section page-frame-section">
        <div className="projects-container page-frame-container">
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project.id} className="project-card">
                <div className="project-content">
                  <h2 className="project-title">{project.name}</h2>
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    {project.stack && (
                      <span className="project-language">
                        <span className="language-dot"></span>
                        {project.stack}
                      </span>
                    )}
                  </div>
                  <div className="project-links">
                    {project.html_url ? (
                      <a
                        href={project.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link"
                      >
                        View on GitHub
                      </a>
                    ) : (
                      <span className="project-link btn-disabled">Private Code</span>
                    )}
                    {project.homepage && project.homepage !== '/' && (
                      <a
                        href={project.homepage}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-link live-link"
                      >
                        Live Demo
                      </a>
                    )}
                    {project.homepage === '/' && (
                      <a href="/" className="project-link live-link">
                        This Site
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
};

export default Projects;
