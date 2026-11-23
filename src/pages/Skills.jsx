import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { skillLogos, skillDescriptions, skillExamples, getLogoPath } from '../data/skillsData';
import '../styles/Skills.css';

const SKILL_CATEGORIES = [
  { id: 'frontend', name: 'Frontend' },
  { id: 'backend', name: 'Backend' },
  { id: 'development', name: 'Development Tools' },
  { id: 'core', name: 'Core Development' },
  { id: 'ai', name: 'AI & Automation' },
  { id: 'testing', name: 'Testing' },
  { id: 'soft', name: 'Soft Skills' }
];

function buildSkillsData() {
  const skillsData = {};
  Object.entries(skillDescriptions).forEach(([skillName, description]) => {
    let category = 'frontend';

    if (skillName.includes('Test') || ['Playwright', 'Vitest', 'Jest', 'Cypress', 'Pytest'].includes(skillName)) category = 'testing';
    else if (['Node.js', 'Express', 'Express.js', 'NestJS', 'FastAPI', 'Python', 'SQL', 'SQL Server', 'PostgreSQL', 'SQLite', 'Knex.js', 'Supabase', 'Authentication', 'JWT', 'bcrypt', 'Pydantic', 'Microsoft Entra ID', 'RESTful APIs', 'Back-End Development'].includes(skillName)) category = 'backend';
    else if (['Git', 'GitHub', 'GitHub Actions', 'VS Code', 'npm', 'Webpack', 'Babel.js', 'Azure', 'Docker', 'Vercel', 'Heroku', 'Deployment', 'Postman API', 'Git CLI', 'Git BASH'].includes(skillName)) category = 'development';
    else if (['Algorithms', 'Data Structures', 'Architecture', 'Computer Science', 'Big-O Notation', 'Debugging', 'Software Development', 'Agile Project Management'].includes(skillName)) category = 'core';
    else if (['Cursor', 'n8n'].includes(skillName)) category = 'ai';
    else if (['Teamwork', 'Time Management', 'Attention to Detail', 'Problem Solving'].some(term => skillName.includes(term))) category = 'soft';

    if (!skillsData[category]) {
      skillsData[category] = [];
    }

    skillsData[category].push({
      name: skillName,
      level: 85,
      description: description,
      example: skillExamples[skillName]
    });
  });
  return skillsData;
}

const Skills = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [showDescription, setShowDescription] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const skills = useMemo(() => buildSkillsData(), []);

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
      setShowDescription(prev => prev === skillName ? null : skillName);
    } else {
      setShowDescription(skillName);
    }
  };

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

        <motion.div
          className="skills-grid"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {getSkillsToShow().map((skill, index) => (
            <motion.div
              key={`${skill.category}-${skill.name}-${index}`}
              className="skill-card"
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                show: { opacity: 1, scale: 1 }
              }}
              whileHover={{ scale: 1.05 }}
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
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills; 