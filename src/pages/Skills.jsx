import { useState, useEffect } from 'react';
import PageLoader from '../components/PageLoader';
import { skillLogos, skillDescriptions, skillExamples, getLogoPath } from '../data/skillsData';
import '../styles/Skills.css';

const SKILL_CATEGORIES = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'development', name: 'Development Tools' },
  { id: 'core', name: 'Core Development' },
  { id: 'testing', name: 'Testing' },
  { id: 'soft', name: 'Soft Skills' },
  { id: 'game', name: 'Game Development' },
  { id: 'audio', name: 'Audio Production' }
];

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showDescription, setShowDescription] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [skills, setSkills] = useState({});

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
    if (isMobile) {
      // On mobile, toggle the description
      setShowDescription(prev => prev === skillName ? null : skillName);
    } else {
      // On desktop, show on hover
      setShowDescription(skillName);
    }
  };

  // Initialize skills data
  useEffect(() => {
    // Create skills object based on descriptions
    const skillsData = {};
    
    // Group skills by category based on the skillDescriptions
    Object.entries(skillDescriptions).forEach(([skillName, description]) => {
      // Determine category based on skill name or default to 'frontend'
      let category = 'frontend';
      
      if (skillName.includes('Test')) category = 'testing';
      else if (['Node.js', 'Express', 'SQL', 'SQLite', 'Authentication', 'JWT', 'bcrypt'].includes(skillName)) category = 'backend';
      else if (['Git', 'GitHub', 'VS Code', 'npm', 'Webpack', 'Babel.js'].includes(skillName)) category = 'development';
      else if (['Algorithms', 'Data Structures', 'Architecture', 'Computer Science'].includes(skillName)) category = 'core';
      else if (['Teamwork', 'Time Management', 'Attention to Detail', 'Problem Solving'].some(term => skillName.includes(term))) category = 'soft';
      else if (['Unreal Engine', 'Blender', 'Gaea', '3D Modeling'].includes(skillName)) category = 'game';
      else if (['Ableton', 'Sound Design', 'Music Production'].includes(skillName)) category = 'audio';
      
      if (!skillsData[category]) {
        skillsData[category] = [];
      }
      
      skillsData[category].push({
        name: skillName,
        level: 85, // Default level, you can adjust this as needed
        description: description,
        example: skillExamples[skillName]
      });
    });

    setSkills(skillsData);
    setLoading(false);
  }, []);

  const getSkillsToShow = () => {
    if (activeCategory === 'all') {
      return Object.entries(skills).flatMap(([category, categorySkills]) => 
        categorySkills.map(skill => ({ ...skill, category }))
      );
    }
    return skills[activeCategory]?.map(skill => ({ 
      ...skill, 
      category: activeCategory 
    })) || [];
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <section className="section skills-section">
      <div className="skills-container">
        <h2 className="section-title">Skills & Expertise</h2>
        <p className="section-subtitle">
          My technical skill set and proficiency levels
        </p>

        <div className="skills-categories">
          <button
            key="all"
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Skills
          </button>
          {SKILL_CATEGORIES.map(category => (
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
                  {skill.description || skill.example || 'Description coming soon...'}
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