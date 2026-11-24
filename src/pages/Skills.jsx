import { useState, useEffect, useMemo } from 'react';
import { skillLogos, skillDescriptions, skillExamples, getLogoPath } from '../data/skillsData';
import '../styles/Skills.css';
import { PageFrame } from '../layout/PageFrame';

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
    <PageFrame
      eyebrow="Toolkit"
      title="Skills"
      dek="Technical inventory grouped for recruiters."
    >
      <section className="section skills-section page-frame-section">
        <div className="skills-container page-frame-container">
          <div className="skills-categories">
            <button
              key="all"
              type="button"
              className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Skills
            </button>
            {SKILL_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
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
                    <h2 className="skill-name">{skill.name}</h2>
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
                        type="button"
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
    </PageFrame>
  );
};

export default Skills; 