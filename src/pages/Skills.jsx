import { useState, useMemo } from 'react';
import '../styles/Skills.css';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL;

  const skillExamples = {
    // Frontend
    'React.js': 'Building reusable components, managing state with hooks',
    'JavaScript': 'Async/await, ES6+, DOM manipulation',
    'HTML': 'Semantic markup, accessibility, forms',
    'CSS': 'Flexbox, Grid, animations, responsive design',
    'Redux.js': 'State management, actions, reducers, middleware',
    'styled-components': 'Dynamic styling, theme management, props-based styling',
    'Single Page Applications': 'Client-side routing, state persistence',
    'Front-end Development': 'UI/UX implementation, cross-browser compatibility',
    'Responsive Web Design': 'Mobile-first design, media queries, fluid layouts',
    'State Management': 'Context API, Redux, local state optimization',

    // Backend
    'Node.js': 'Server creation, middleware, async operations',
    'Express.js': 'REST APIs, middleware chains, routing',
    'RESTful APIs': 'CRUD operations, endpoint design, status codes',
    'Authentication': 'JWT, session management, OAuth',
    'SQL': 'Complex queries, joins, database design',
    'SQLite': 'Local database management, migrations',
    'Knex.js': 'Query building, migrations, seeds',
    'Back-End Development': 'Server architecture, API design, security',
    'JWT': 'Token-based auth, payload encryption',
    'bcrypt': 'Password hashing, salt rounds',

    // Tools
    'Git': 'Version control, branching strategies, conflict resolution',
    'GitHub': 'Pull requests, code review, project management',
    'VS Code': 'Extensions, debugging, customization',
    'Postman API': 'API testing, request automation, environment variables',
    'npm': 'Package management, scripts, versioning',
    'Jest': 'Unit testing, mocking, code coverage',
    'Webpack': 'Module bundling, optimization, config',
    'Git BASH': 'Command line operations, scripting',
    'Axios': 'HTTP requests, interceptors, error handling',
    'Babel.js': 'JavaScript transpilation, polyfills',

    // Core
    'Algorithms': 'Sorting, searching, optimization',
    'Data Structures': 'Arrays, linked lists, trees, graphs',
    'Problem Solving': 'Breaking down complex problems, optimization',
    'Software Development': 'SDLC, best practices, design patterns',
    'Computer Science': 'OOP, functional programming, complexity',
    'Big-O Notation': 'Time/space complexity analysis',
    'Debugging': 'Chrome DevTools, logging, error tracking',
    'Test Automation': 'CI/CD pipelines, test suites',

    // Testing
    'Unit Testing': 'Jest, test isolation, mocking',
    'Integration Testing': 'API testing, component integration',
    'Software Testing': 'Test planning, coverage analysis',
    'End-to-end Testing': 'Cypress, user flow testing',
    'Automated Unit Testing': 'Test automation, continuous testing',

    // Soft Skills
    'Teamwork & Collaboration': 'Code reviews, pair programming, mentoring',
    'Time Management': 'Project planning, deadlines, prioritization',
    'Attention to Detail': 'Code quality, documentation, testing',
    'Problem Solving': 'Debugging, optimization, architecture design'
  };

  // Parse skills from environment variables
  const parseSkills = (envString) => {
    if (!envString) return [];
    return envString.split(',').map(skill => {
      const [name, level] = skill.split(':');
      return { 
        name, 
        level: parseInt(level, 10),
        example: skillExamples[name] || 'Examples coming soon...'
      };
    });
  };

  const skillsData = useMemo(() => ({
    frontend: parseSkills(import.meta.env.VITE_SKILLS_FRONTEND),
    backend: parseSkills(import.meta.env.VITE_SKILLS_BACKEND),
    tools: parseSkills(import.meta.env.VITE_SKILLS_TOOLS),
    core: parseSkills(import.meta.env.VITE_SKILLS_CORE),
    testing: parseSkills(import.meta.env.VITE_SKILLS_TESTING),
    soft: parseSkills(import.meta.env.VITE_SKILLS_SOFT)
  }), []);

  const categories = [
    { id: 'all', name: 'All Skills' },
    { id: 'frontend', name: 'Frontend' },
    { id: 'backend', name: 'Backend' },
    { id: 'tools', name: 'Development Tools' },
    { id: 'core', name: 'Core Development' },
    { id: 'testing', name: 'Testing' },
    { id: 'soft', name: 'Soft Skills' }
  ];

  const getSkillsToShow = () => {
    if (activeCategory === 'all') {
      return Object.entries(skillsData).flatMap(([category, skills]) => 
        skills.map(skill => ({ ...skill, category }))
      );
    }
    return skillsData[activeCategory].map(skill => ({ ...skill, category: activeCategory }));
  };

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
              data-tooltip={skill.example}
            >
              <div className="skill-info">
                <h3 className="skill-name">{skill.name}</h3>
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