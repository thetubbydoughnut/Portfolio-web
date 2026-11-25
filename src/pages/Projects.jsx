import { projects } from '../data/projects';
import '../styles/Projects.css';
import { PageFrame } from '../layout/PageFrame';
import { ProjectSpotlightCard } from '../components/ProjectSpotlightCard';
import { ProjectVisual } from '../components/ProjectVisual';
import { ProjectsAtmosphere } from '../components/ProjectsAtmosphere';

function ProjectLinks({ project }) {
  const links = [];
  if (project.html_url) {
    links.push(
      <a
        key="repo"
        href={project.html_url}
        target="_blank"
        rel="noopener noreferrer"
        className="project-link"
      >
        View on GitHub
      </a>
    );
  }
  if (project.homepage && project.homepage !== '/') {
    links.push(
      <a
        key="live"
        href={project.homepage}
        target="_blank"
        rel="noopener noreferrer"
        className="project-link live-link"
      >
        Live site
      </a>
    );
  }
  if (project.homepage === '/') {
    links.push(
      <a key="site" href="/" className="project-link live-link">
        This site
      </a>
    );
  }
  if (links.length === 0) return null;
  return <div className="project-links">{links}</div>;
}

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
                  <ProjectLinks project={project} />
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
