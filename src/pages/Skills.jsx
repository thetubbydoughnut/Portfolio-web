import React, { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import { skillLogos, skillDescriptions, skillExamples, getLogoPath } from '../data/skillsData';
import '../styles/Skills.css';

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [debug, setDebug] = useState('');
  const [categories, setCategories] = useState([]);
  const [mergedSkills, setMergedSkills] = useState({});
  const linkedInUrl = import.meta.env.VITE_LINKEDIN_URL;
  const githubUrl = import.meta.env.VITE_GITHUB_URL;
  const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
  const isProd = import.meta.env.PROD;
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Add useEffect to detect mobile devices
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSkillInteraction = (skillName) => {
    console.log('Skill interaction:', skillName, 'Description:', skillDescriptions[skillName]);
    if (isMobile) {
      // On mobile, toggle the description
      setShowDescription(prev => prev === skillName ? null : skillName);
    } else {
      // On desktop, show on hover
      setShowDescription(skillName);
    }
  };

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
      } finally {
        setLoading(false);
      }
    };

    if (categories.length > 0) {
      initializeSkills();
    }
  }, [categories, isProd]);

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

  if (loading) {
    return <PageLoader />;
  }

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
              onClick={() => isMobile && handleSkillInteraction(skill.name)}
              onMouseEnter={() => !isMobile && handleSkillInteraction(skill.name)}
              onMouseLeave={() => !isMobile && setShowDescription(null)}
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
              {showDescription === skill.name && (
                <div className={`skill-description ${isMobile ? 'mobile' : ''}`}>
                  {skillDescriptions[skill.name] || skillExamples[skill.name] || 'Description coming soon...'}
                  {isMobile && (
                    <button 
                      className="close-description" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDescription(null);
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills; 