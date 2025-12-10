import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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

    // Highest priority: Manual projects (Legendary, BOLT) and Pinned Repos
    if (['legendary-loot', 'bolt-crm'].includes(repo.id)) score += 500; // Manual projects top priority
    if (pinnedRepos.includes(repo.name)) score += 200;  // Pinned repos high priority

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

  const fetchPinnedRepos = async (username) => {
    try {
      const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
      if (!githubToken) {
        console.warn('GitHub token not found. Skipping pinned repos fetch.');
        setPinnedRepos([]);
        return;
      }

      const response = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${githubToken}`,
        },
        body: JSON.stringify({
          query: `{
            user(login: "${username}") {
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

      setPinnedRepos(pinnedNames);
    } catch (err) {
      console.error('Error fetching pinned repos:', err);
      setPinnedRepos([]);
    }
  };

  const MANUAL_PROJECTS = [
    {
      id: 'legendary-loot',
      name: 'Legendary Printed Loot',
      description: 'Custom e-commerce platform & automated logistics pipeline. reduced administrative workload by 40% via n8n & EasyPost integration.',
      language: 'React / Node.js',
      stargazers_count: 50, // Mock score for sorting
      html_url: 'https://lpl3d.com',
      homepage: 'https://lpl3d.com',
      image: 'https://via.placeholder.com/600x400', // Placeholder
      topics: ['full-stack', 'react', 'stripe', 'n8n']
    },
    {
      id: 'bolt-crm',
      name: 'BOLT 2.0 (Tatco)',
      description: 'Internal CRM for construction management. Built with FastAPI & React to centralize project tracking and analytics. (Private Internal Tool)',
      language: 'Python / React',
      stargazers_count: 45, // Retaining mock score for visibility
      html_url: '', // Empty URL indicates no link
      homepage: '',
      private: true, // Explicit flag
      topics: ['crm', 'fastapi', 'typescript', 'internal-tool']
    }
  ];

  const fetchRepos = async (username) => {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?type=public&sort=updated&per_page=100`,
        {
          headers: {
            Accept: 'application/vnd.github.mercy-preview+json'
            // Authorization header removed to allow public access without token if limit permits, 
            // or handled via try/catch for 403/401
          }
        }
      );

      let fetchedRepos = [];
      if (response.ok) {
        fetchedRepos = await response.json();
      } else {
        console.warn('GitHub API failed, using manual/fallback data only.');
      }

      // Combine manual projects with fetched repos
      // Manual projects should be treated as "Repositories" for the UI
      const finalRepos = [...MANUAL_PROJECTS, ...fetchedRepos];

      // Filter and sort repositories by impression score
      const sortedRepos = finalRepos
        .filter(repo => (!repo.private && repo.visibility === 'public') || repo.id.toString().startsWith('legendary') || repo.id.toString().startsWith('bolt'))
        .map(repo => ({
          ...repo,
          impressionScore: getImpressionScore(repo)
        }))
        .sort((a, b) => b.impressionScore - a.impressionScore)
        .slice(0, 8); // Increased slice to show more content

      setRepos(sortedRepos);
      setLoading(false);
    } catch (err) {
      console.error("Repo fetch error:", err);
      // Fallback to just manual projects on hard error
      setRepos(MANUAL_PROJECTS);
      setLoading(false);
    }
  };

  useEffect(() => {
    const githubUsername = import.meta.env.VITE_GITHUB_USERNAME;
    if (!githubUsername) {
      console.error("GitHub username not found in environment variables. Please set VITE_GITHUB_USERNAME in your .env file.");
      setError("Application configuration error: GitHub username is missing.");
      setLoading(false);
      return;
    }
    // Fetch pinned repos first, then fetch all repos
    fetchPinnedRepos(githubUsername).then(() => fetchRepos(githubUsername));
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

        <motion.div
          className="projects-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {repos.map(repo => (
            <motion.div
              key={repo.id}
              className="project-card"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
              }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
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
                  {repo.html_url ? (
                    <a
                      href={repo.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link"
                    >
                      View on GitHub
                    </a>
                  ) : (
                    <span className="project-link btn-disabled" style={{ opacity: 0.6, cursor: 'not-allowed', background: 'rgba(255,255,255,0.1)' }}>
                      Private Code
                    </span>
                  )}
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
            </motion.div>
          ))}
        </motion.div>

        <div className="view-more">
          <a
            href={`https://github.com/${import.meta.env.VITE_GITHUB_USERNAME}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            View More on GitHub
          </a>
        </div>
      </div>
    </section >
  );
};

export default Projects; 