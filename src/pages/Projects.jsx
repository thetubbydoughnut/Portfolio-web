import React, { useState, useEffect } from 'react';
import '../styles/Projects.css';

const Projects = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch('https://api.github.com/users/thetubbydoughnut/repos?sort=updated&per_page=6');
        if (!response.ok) throw new Error('Failed to fetch repositories');
        const data = await response.json();
        // Filter out forked repositories and sort by updated date
        const filteredRepos = data
          .filter(repo => !repo.fork)
          .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        setRepos(filteredRepos);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRepos();
  }, []);

  if (loading) {
    return (
      <section className="section projects-section">
        <div className="loading">Loading projects...</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section projects-section">
        <div className="error">Error: {error}</div>
      </section>
    );
  }

  return (
    <section className="section projects-section">
      <div className="projects-container">
        <h2 className="section-title">My Projects</h2>
        <p className="section-subtitle">Check out some of my recent work</p>
        
        <div className="projects-grid">
          {repos.map(repo => (
            <div key={repo.id} className="project-card">
              <div className="project-content">
                <h3 className="project-title">{repo.name}</h3>
                <p className="project-description">
                  {repo.description || 'No description available'}
                </p>
                <div className="project-meta">
                  {repo.language && (
                    <span className="project-language">
                      <span className="language-dot"></span>
                      {repo.language}
                    </span>
                  )}
                  {repo.stargazers_count > 0 && (
                    <span className="project-stars">
                      ⭐ {repo.stargazers_count}
                    </span>
                  )}
                </div>
                <div className="project-links">
                  <a 
                    href={repo.html_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="project-link"
                  >
                    View on GitHub
                  </a>
                  {repo.homepage && (
                    <a 
                      href={repo.homepage} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="project-link live-link"
                    >
                      Live Demo
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        
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