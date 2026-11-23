import { motion } from 'framer-motion';
import { projects } from '../data/projects';
import '../styles/Projects.css';

const Projects = () => {
  return (
    <section className="section projects-section">
      <div className="projects-container">
        <h2 className="section-title">My Projects</h2>
        <p className="section-subtitle">Curated work from production and personal builds</p>

        <motion.div
          className="projects-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="show"
        >
          {projects.map((project) => (
            <motion.div
              key={project.id}
              className="project-card"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="project-content">
                <h3 className="project-title">{project.name}</h3>
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
                    <span
                      className="project-link btn-disabled"
                      style={{
                        opacity: 0.6,
                        cursor: 'not-allowed',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    >
                      Private Code
                    </span>
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
            </motion.div>
          ))}
        </motion.div>

        <div className="view-more">
          <a
            href="https://github.com/thetubbydoughnut?tab=repositories"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            View More on GitHub
          </a>
        </div>
      </div>
    </section>
  );
};

export default Projects;
