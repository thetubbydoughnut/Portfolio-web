import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import '../styles/Projects.css';

const Projects = () => {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pinnedRepos, setPinnedRepos] = useState([]);

  // Calculate an impression score for a repository
  const getImpressionScore = (repo) => {
    let score = 0;

    // Highest priority: Pinned repositories
    if (pinnedRepos.includes(repo.name)) score += 150;  // Pinned repos get top priority

    // Core project scoring
    if (repo.name === 'Portfolio-web') score += 100;  // Your portfolio is a showcase
    if (repo.topics && repo.topics.includes('featured')) score += 90;
    
    // Project type scoring
    const isFullStack = repo.topics?.includes('full-stack') || 
                       repo.description?.toLowerCase().includes('full stack') ||
                       repo.name.toLowerCase().includes('full-stack');
    const isReact = repo.topics?.includes('react') || 
                    repo.description?.toLowerCase().includes('react') ||
                    repo.language === 'JavaScript';
    const isWebApp = repo.topics?.includes('web-app') || 
                    repo.description?.toLowerCase().includes('web application');

    if (isFullStack) score += 50;
    if (isReact) score += 40;
    if (isWebApp) score += 30;

    // Metrics-based scoring
    score += (repo.stargazers_count * 5);  // Stars are valuable
    score += (repo.watchers_count * 3);    // Watchers show interest
    score += (repo.forks_count * 4);       // Forks show utility
    
    // Size and activity scoring
    if (repo.size > 1000) score += 20;     // Larger projects
    if (repo.has_pages) score += 10;       // Has GitHub Pages
    if (repo.homepage) score += 15;        // Has deployed version
    
    // Recent activity bonus
    const monthsAgo = (new Date() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24 * 30);
    if (monthsAgo < 1) score += 25;        // Updated in last month
    else if (monthsAgo < 3) score += 15;   // Updated in last 3 months

    // Important projects (based on your GitHub)
    const significantProjects = [
      'asylum-hrf-fe-starter',             // Human Rights First project
      'web-sprint-challenge-advanced-web-applications',
      'web-sprint-challenge-authentication-and-testing'
    ];
    if (significantProjects.includes(repo.name)) score += 60;

    return score;
  };

  const fetchPinnedRepos = async () => {
    try {
      // Check if GitHub token is available
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      if (!githubToken) {
        console.warn('GitHub token not found in environment variables');
        setPinnedRepos([]);
        return;
      }

      // Using the GraphQL API to fetch pinned repositories
      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${githubToken}`,
        },
        body: JSON.stringify({
          query: `{
            user(login: "thetubbydoughnut") {
              pinnedItems(first: 6, types: REPOSITORY) {
                nodes {
                  ... on Repository {
                    name
                  }
                }
              }
            }
          }`
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch pinned repositories');
      const data = await response.json();
      
      if (data.errors) {
        throw new Error(data.errors[0].message);
      }
      
      // Extract pinned repository names
      const pinnedNames = data.data.user.pinnedItems.nodes.map(node => node.name);
      setPinnedRepos(pinnedNames);
    } catch (err) {
      console.error('Error fetching pinned repos:', err);
      setPinnedRepos([]); // Set empty array on error
    }
  };

  const fetchRepos = async () => {
    try {
      const response = await fetch(
        'https://api.github.com/users/thetubbydoughnut/repos?type=public&sort=updated&per_page=100',
        {
          headers: {
            Accept: 'application/vnd.github.mercy-preview+json'
          }
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch repositories');
      const data = await response.json();
      
      // Filter and sort repositories by impression score
      const sortedRepos = data
        .filter(repo => !repo.private && repo.visibility === 'public')
        .map(repo => ({
          ...repo,
          impressionScore: getImpressionScore(repo)
        }))
        .sort((a, b) => b.impressionScore - a.impressionScore)
        .slice(0, 6);

      setRepos(sortedRepos);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch pinned repos first, then fetch all repos
    fetchPinnedRepos().then(fetchRepos);
    const pollInterval = setInterval(() => {
      fetchPinnedRepos().then(fetchRepos);
    }, 5 * 60 * 1000);
    return () => clearInterval(pollInterval);
  }, []);

  if (loading) {
    return <PageLoader />;
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