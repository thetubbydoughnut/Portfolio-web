import { useMemo } from 'react';
import { skillLogos, skillDescriptions, getLogoPath } from '../data/skillsData';
import '../styles/Skills.css';
import { PageFrame } from '../layout/PageFrame';

const SKILL_GROUPS = [
  {
    id: 'frontend',
    name: 'Frontend',
    skills: [
      'TypeScript',
      'JavaScript',
      'React',
      'TanStack Query',
      'Redux',
      'Vite',
      'Tailwind CSS',
      'HTML5',
      'CSS3',
      'Hooks',
      'Context API',
      'Responsive Web Design',
      'State Management',
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    skills: [
      'NestJS',
      'FastAPI',
      'Node.js',
      'Express',
      'Python',
      'SQL',
      'SQL Server',
      'PostgreSQL',
      'SQLite',
      'Knex.js',
      'Supabase',
      'RESTful APIs',
      'Authentication',
      'Microsoft Entra ID',
    ],
  },
  {
    id: 'testing',
    name: 'Testing',
    skills: ['Playwright', 'Vitest', 'Jest', 'Cypress', 'Pytest', 'Unit Testing', 'Integration Testing', 'End-to-end Testing'],
  },
  {
    id: 'tools',
    name: 'Tools & Cloud',
    skills: [
      'Azure',
      'Docker',
      'Git',
      'GitHub',
      'GitHub Actions',
      'VS Code',
      'Vercel',
      'n8n',
      'Cursor',
      'Deployment',
    ],
  },
  {
    id: 'core',
    name: 'Core',
    skills: ['Algorithms', 'Data Structures', 'Architecture', 'Debugging', 'Problem Solving', 'Teamwork & Collaboration'],
  },
];

function buildGroupedSkills() {
  const claimed = new Set();
  const groups = SKILL_GROUPS.map((group) => {
    const items = group.skills
      .filter((name) => skillDescriptions[name])
      .map((name) => {
        claimed.add(name);
        return {
          name,
          description: skillDescriptions[name],
        };
      });
    return { ...group, items };
  }).filter((g) => g.items.length > 0);

  const leftovers = Object.keys(skillDescriptions)
    .filter((name) => !claimed.has(name))
    .map((name) => ({ name, description: skillDescriptions[name] }));

  if (leftovers.length) {
    groups.push({ id: 'more', name: 'More', items: leftovers });
  }

  return groups;
}

const Skills = () => {
  const groups = useMemo(() => buildGroupedSkills(), []);

  return (
    <PageFrame
      eyebrow="Toolkit"
      title="Skills"
      dek="Technical inventory grouped for recruiters."
    >
      <div className="skills-groups" data-skills-groups>
        {groups.map((group) => (
          <section
            key={group.id}
            className="skills-group"
            data-skills-group={group.id}
            aria-labelledby={`skills-group-${group.id}`}
          >
            <h2 id={`skills-group-${group.id}`} className="skills-group-title">
              {group.name}
            </h2>
            <ul className="skills-grid" data-skills-grid>
              {group.items.map((skill) => (
                <li key={skill.name} className="skill-chip glass-panel" title={skill.description}>
                  <img
                    src={getLogoPath(skill.name)}
                    alt=""
                    className="skill-logo"
                    loading="lazy"
                    width="24"
                    height="24"
                    onError={(e) => {
                      e.target.src = skillLogos.default;
                      e.target.onerror = null;
                    }}
                  />
                  <span className="skill-name">{skill.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </PageFrame>
  );
};

export default Skills;
