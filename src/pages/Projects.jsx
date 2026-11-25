import { projects } from '../data/projects';
import '../styles/Projects.css';
import { PageFrame } from '../layout/PageFrame';
import { ProjectSpotlightCard } from '../components/ProjectSpotlightCard';
import { ProjectVisual } from '../components/ProjectVisual';
import { ProjectsAtmosphere } from '../components/ProjectsAtmosphere';

const Projects = () => {
  return (
    <PageFrame
      eyebrow="Work"
      title="Projects"
      dek="Curated work from production and personal builds."
    >
      <ProjectsAtmosphere />
      <section className="section projects-section page-frame-section" data-projects-section>
        <div className="projects-container page-frame-container">
          <div className="projects-grid" data-projects-grid>
            {projects.map((project) => (
              <ProjectSpotlightCard key={project.id} className="project-card-shell">
                <article data-project-card={project.id} className="project-content">
                  {project.visual ? (
                    <ProjectVisual
                      kind={project.visual.kind}
                      label={project.visual.label}
                      alt={project.visual.alt}
                      title={project.name}
                    />
                  ) : null}
                  <h2 className="project-title">{project.name}</h2>
                  {project.label ? (
                    <p className="project-label">{project.label}</p>
                  ) : null}
                  {project.period ? (
                    <p className="project-period">{project.period}</p>
                  ) : null}
                  <p className="project-description">{project.description}</p>
                  <div className="project-meta">
                    {project.stack ? (
                      <span className="project-language">
                        <span className="language-dot" aria-hidden="true" />
                        {project.stack}
                      </span>
                    ) : null}
                  </div>
                  {(project.html_url || project.homepage) ? (
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
                      ) : null}
                      {project.homepage && project.homepage !== '/' ? (
                        <a
                          href={project.homepage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link live-link"
                        >
                          Live site
                        </a>
                      ) : null}
                      {project.homepage === '/' ? (
                        <a href="/" className="project-link live-link">
                          This site
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              </ProjectSpotlightCard>
            ))}
          </div>
        </div>
      </section>
    </PageFrame>
  );
};

export default Projects;
