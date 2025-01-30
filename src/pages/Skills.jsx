import { useState, useEffect } from 'react';
import '../styles/Skills.css';

// Skill logos mapping
const skillLogos = {
  // Frontend
  'React.js': '/images/skills/react.js.svg',
  'Redux': '/images/skills/redux.svg',
  'JavaScript': '/images/skills/javascript.svg',
  'HTML': '/images/skills/html.svg',
  'CSS': '/images/skills/css.svg',
  'Jest': '/images/skills/jest.svg',
  'Cypress': '/images/skills/cypress.svg',
  'Yup': '/images/skills/yup.svg',
  'Axios': '/images/skills/axios.svg',
  'styled-components': '/images/skills/styled-components.svg',
  'Hooks': '/images/skills/hooks.svg',
  'Context API': '/images/skills/context-api.svg',
  'Single Page Applications': '/images/skills/single-page-applications.svg',
  'Front-end Development': '/images/skills/front-end-development.svg',
  'Responsive Web Design': '/images/skills/responsive-web-design.svg',
  'State Management': '/images/skills/state-management.svg',

  // Backend
  'Node.js': '/images/skills/node.js.svg',
  'Express': '/images/skills/express.svg',
  'SQL': '/images/skills/sql.svg',
  'SQLite': '/images/skills/sqlite.svg',
  'Git CLI': '/images/skills/git-cli.svg',
  'GitHub': '/images/skills/github.svg',
  'VS Code': '/images/skills/vs-code.svg',
  'Vercel': '/images/skills/vercel.svg',
  'Heroku': '/images/skills/heroku.svg',
  'RESTful APIs': '/images/skills/restful-apis.svg',
  'Authentication': '/images/skills/authentication.svg',
  'Knex.js': '/images/skills/knex.js.svg',
  'Back-End Development': '/images/skills/back-end-development.svg',
  'JWT': '/images/skills/jwt.svg',
  'bcrypt': '/images/skills/bcrypt.svg',

  // Development Tools
  'Git': '/images/skills/git.svg',
  'Git BASH': '/images/skills/git-bash.svg',
  'Postman API': '/images/skills/postman-api.svg',
  'npm': '/images/skills/npm.svg',
  'Webpack': '/images/skills/webpack.svg',
  'Babel.js': '/images/skills/babel.js.svg',

  // Core Development
  'Algorithms': '/images/skills/algorithms.svg',
  'Data Structures': '/images/skills/data-structures.svg',
  'Architecture': '/images/skills/architecture.svg',
  'Software Development': '/images/skills/software-development.svg',
  'Computer Science': '/images/skills/computer-science.svg',
  'Big-O Notation': '/images/skills/big-o-notation.svg',
  'Debugging': '/images/skills/debugging.svg',
  'Test Automation': '/images/skills/test-automation.svg',
  'Agile Project Management': '/images/skills/agile-project-management.svg',
  'Deployment': '/images/skills/deployment.svg',

  // Testing
  'Unit Testing': '/images/skills/unit-testing.svg',
  'Integration Testing': '/images/skills/integration-testing.svg',
  'Software Testing': '/images/skills/software-testing.svg',
  'End-to-end Testing': '/images/skills/end-to-end-testing.svg',
  'Automated Unit Testing': '/images/skills/automated-unit-testing.svg',

  // Soft Skills
  'Teamwork & Collaboration': '/images/skills/teamwork-&-collaboration.svg',
  'Time Management': '/images/skills/time-management.svg',
  'Attention to Detail': '/images/skills/attention-to-detail.svg',
  'Problem Solving': '/images/skills/problem-solving.svg',

  // Game Development
  'Unreal Engine': '/images/skills/unreal-engine.svg',
  'Blender': '/images/skills/blender.svg',
  'Gaea': '/images/skills/gaea.svg',
  '3D Modeling': '/images/skills/3d-modeling.svg',

  // Audio Production
  'Ableton': '/images/skills/ableton.svg',
  'Sound Design': '/images/skills/sound-design.svg',
  'Music Production': '/images/skills/music-production.svg',

  // Default category-specific fallbacks
  'Frontend Development': '/images/skills/default-frontend.svg',
  'Backend Development': '/images/skills/default-backend.svg',
  'Development Tools': '/images/skills/default-tools.svg',
  'Testing': '/images/skills/default-testing.svg',
  'Game Development': '/images/skills/default-gamedev.svg',
  'Audio Production': '/images/skills/default-audio.svg',
  'Soft Skills': '/images/skills/default-soft.svg',

  // Default fallback
  'default': '/images/skills/default.svg'
};

// Helper function to get the correct logo path
function getLogoPath(skillName) {
  // Try to get the exact match first
  if (skillLogos[skillName]) {
    return skillLogos[skillName];
  }

  // Try to get the category-specific default
  const categoryMatch = Object.entries(skillLogos).find(([key]) => 
    key.toLowerCase().includes('development') && 
    skillName.toLowerCase().includes(key.toLowerCase().replace(' development', ''))
  );
  
  if (categoryMatch) {
    return categoryMatch[1];
  }

  // Fallback to default logo
  return skillLogos.default;
}

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [debug, setDebug] = useState('');
  const [categories, setCategories] = useState([]);
  const [mergedSkills, setMergedSkills] = useState({});
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  const isProd = import.meta.env.PROD;

  // Parse categories from environment variable
  const parseCategories = () => {
    const categoriesStr = import.meta.env.VITE_SKILL_CATEGORIES;
    if (!categoriesStr) {
      console.warn('No skill categories found in environment variables');
      return [];
    }

    try {
      return categoriesStr.split(',').map(category => {
        const [id, name] = category.split(':');
        return { id, name };
      });
    } catch (error) {
      console.error('Error parsing skill categories:', error);
      return [];
    }
  };

  // Initialize categories and skills
  useEffect(() => {
    // Parse categories
    const parsedCategories = parseCategories();
    setCategories([
      { id: 'all', name: 'All Skills' },
      ...parsedCategories
    ]);

    // Initialize empty skills object with all categories
    const initialSkills = parsedCategories.reduce((acc, { id }) => {
      acc[id] = [];
      return acc;
    }, {});
    setMergedSkills(initialSkills);
  }, []);

  // Fetch GitHub repositories and extract skills
  const fetchGitHubSkills = async () => {
    try {
      const username = githubUrl.split('/').pop();
      const response = await fetch(`https://api.github.com/users/${username}/repos`, {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch GitHub repos');
      
      const repos = await response.json();
      
      // Extract languages and topics from repos
      const languages = new Set();
      const topics = new Set();
      
      await Promise.all(repos.map(async (repo) => {
        if (repo.language) languages.add(repo.language);
        if (repo.topics) repo.topics.forEach(topic => topics.add(topic));
        
        const langResponse = await fetch(repo.languages_url, {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        });
        if (langResponse.ok) {
          const langData = await langResponse.json();
          Object.keys(langData).forEach(lang => languages.add(lang));
        }
      }));

      // Convert to skill format based on categories
      const githubSkills = {};
      categories.forEach(({ id }) => {
        if (id === 'all') return;
        
        const categorySkills = Array.from(languages)
          .concat(Array.from(topics))
          .filter(skill => {
            const envSkills = getEnvSkills(id);
            return envSkills.toLowerCase().includes(skill.toLowerCase());
          })
          .map(name => ({
            name,
            level: 85,
            source: 'github'
          }));

        if (categorySkills.length > 0) {
          githubSkills[id] = categorySkills;
        }
      });

      return githubSkills;
    } catch (error) {
      console.error('Error fetching GitHub skills:', error);
      return null;
    }
  };

  // Get environment variables based on environment
  const getEnvSkills = (categoryId) => {
    const envVar = `VITE_SKILLS_${categoryId.toUpperCase()}`;
    const value = import.meta.env[envVar];
    if (!value && isProd) {
      console.warn(`Missing environment variable: ${envVar}`);
    }
    return value || '';
  };

  // Initialize skills data based on environment
  useEffect(() => {
    const initializeSkills = async () => {
      try {
        setDebug('Fetching skills...');
        
        // Get environment skills
        const envSkills = categories.reduce((acc, { id }) => {
          if (id === 'all') return acc;
          acc[id] = parseSkills(getEnvSkills(id));
          return acc;
        }, {});

        // Get GitHub skills
        const githubSkills = await fetchGitHubSkills();

        // Merge skills from all sources
        const merged = mergeSkills(envSkills, githubSkills);
        setMergedSkills(merged);
        
        setDebug('Skills loaded successfully');
      } catch (error) {
        console.error('Error initializing skills:', error);
        setDebug(`Error loading skills: ${error.message}`);
      }
    };

    if (categories.length > 0) {
      initializeSkills();
    }
  }, [categories, isProd]);

  const skillExamples = {
    // Frontend
    'React.js': 'Building reusable components, managing state with hooks, context API',
    'Redux': 'State management, actions, reducers, middleware, Redux Toolkit',
    'Hooks': 'useState, useEffect, useContext, custom hooks',
    'Context API': 'Global state management, theme providers, auth context',
    'JavaScript': 'ES6+, async/await, DOM manipulation, event handling',
    'HTML': 'Semantic markup, accessibility, forms, meta tags',
    'CSS': 'Flexbox, Grid, animations, responsive design, SASS',
    'Jest': 'Unit testing, component testing, mocking, code coverage',
    'Cypress': 'End-to-end testing, integration tests, custom commands',
    'Yup': 'Form validation, schema validation, custom validation rules',
    'Axios': 'HTTP requests, interceptors, error handling, async operations',

    // Backend
    'Node.js': 'Server creation, middleware, async operations, file system',
    'Express': 'REST APIs, middleware chains, routing, error handling',
    'SQL': 'Complex queries, joins, database design, migrations',
    'SQLite': 'Local database management, migrations, CRUD operations',
    'Git CLI': 'Version control, branching, merging, conflict resolution',
    'GitHub': 'Pull requests, code review, project management, actions',
    'VS Code': 'Extensions, debugging, customization, integrated terminal',
    'Vercel': 'Deployment, environment variables, domain management',
    'Heroku': 'Deployment, CI/CD, add-ons, monitoring',

    // Game Development
    'Unreal Engine': '3D game development, blueprints, level design',
    'Blender': '3D modeling, texturing, animation, rendering',
    'Gaea': 'Terrain generation, texturing, erosion simulation',

    // Music Production
    'FL Studio': 'Music production, sound design, mixing, mastering',
    'Sound Design': 'Sound effects, synthesis, audio processing',
    'Music Production': 'Composition, arrangement, mixing, mastering',

    // Additional Skills
    'Agile Project Management': 'Scrum, sprints, backlog management, standups',
    'Algorithms': 'Data structures, optimization, problem-solving',
    'Architecture': 'System design, scalability, best practices',
    'Debugging': 'Chrome DevTools, logging, error tracking, testing',
    'Deployment': 'CI/CD, environment setup, monitoring, maintenance',

    // ... keep existing skill examples ...
  };

  // Parse skills from environment variables
  const parseSkills = (envString) => {
    if (!envString) {
      console.warn(`No skills found for category with string: ${envString}`);
      return [];
    }
    try {
      return envString.split(',').map(skill => {
        const [name, level] = skill.split(':');
        if (!name || !level) {
          console.warn(`Invalid skill format: ${skill}`);
          return null;
        }
        return { 
          name, 
          level: parseInt(level, 10),
          example: skillExamples[name] || 'Examples coming soon...'
        };
      }).filter(Boolean); // Remove any null values
    } catch (error) {
      console.error('Error parsing skills:', error);
      return [];
    }
  };

  // Merge skills from different sources
  const mergeSkills = (envSkills, githubSkills) => {
    const merged = {};

    categories.forEach(({ id }) => {
      const envCategorySkills = envSkills[id] || [];
      const githubCategorySkills = (githubSkills && githubSkills[id]) || [];

      // Combine and deduplicate skills
      const skillMap = new Map();

      // Add environment skills
      envCategorySkills.forEach(skill => {
        skillMap.set(skill.name.toLowerCase(), {
          ...skill,
          sources: ['env']
        });
      });

      // Merge GitHub skills
      githubCategorySkills.forEach(skill => {
        const key = skill.name.toLowerCase();
        if (skillMap.has(key)) {
          const existing = skillMap.get(key);
          skillMap.set(key, {
            ...existing,
            level: Math.max(existing.level, skill.level),
            sources: [...existing.sources, 'github']
          });
        } else {
          skillMap.set(key, {
            ...skill,
            sources: ['github']
          });
        }
      });

      merged[id] = Array.from(skillMap.values());
    });

    return merged;
  };

  const getSkillsToShow = () => {
    if (activeCategory === 'all') {
      return Object.entries(mergedSkills).flatMap(([category, skills]) => 
        skills.map(skill => ({ ...skill, category }))
      );
    }
    return mergedSkills[activeCategory]?.map(skill => ({ 
      ...skill, 
      category: activeCategory 
    })) || [];
  };

  // Show loading state while fetching skills
  if (categories.length === 0) {
    return (
      <section className="section skills-section">
        <div className="skills-container">
          <h2 className="section-title">Loading Categories...</h2>
          {debug && (
            <p className="section-subtitle">
              {debug}
            </p>
          )}
        </div>
      </section>
    );
  }

  // If no skills data is available, show a message
  const hasSkills = Object.values(mergedSkills).some(skills => skills.length > 0);
  if (!hasSkills) {
    return (
      <section className="section skills-section">
        <div className="skills-container">
          <h2 className="section-title">Skills & Expertise</h2>
          <p className="section-subtitle error-message">
            Unable to load skills data. Please try again later.
            {isProd && debug && (
              <small style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.8rem' }}>
                {debug}
              </small>
            )}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="section skills-section">
      <div className="skills-container">
        <h2 className="section-title">Skills & Expertise</h2>
        <p className="section-subtitle">
          My technical skill set and proficiency levels
          {linkedInUrl && (
            <>
              {' • '}
              <a 
                href={linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="linkedin-link"
              >
                View on LinkedIn
              </a>
            </>
          )}
        </p>

        <div className="skills-categories">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${activeCategory === category.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="skills-grid">
          {getSkillsToShow().map((skill, index) => (
            <div 
              key={`${skill.category}-${skill.name}-${index}`}
              className="skill-card"
              style={{
                animationDelay: `${index * 0.1}s`
              }}
              data-tooltip={`${skillExamples[skill.name] || 'Examples coming soon...'}`}
            >
              <div className="skill-info">
                <div className="skill-header">
                  <img 
                    src={getLogoPath(skill.name)}
                    alt={`${skill.name} logo`}
                    className="skill-logo"
                    loading="lazy"
                    width="24"
                    height="24"
                    onError={(e) => {
                      e.target.src = skillLogos.default;
                      e.target.onerror = null;
                    }}
                  />
                  <h3 className="skill-name">{skill.name}</h3>
                </div>
                <div className="skill-level-container">
                  <div 
                    className="skill-level-bar"
                    style={{ width: `${skill.level}%` }}
                  />
                  <span className="skill-level-text">{skill.level}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills; 