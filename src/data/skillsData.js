// Skill logos mapping — extend existing paths; missing logos fall back via getLogoPath
export const skillLogos = {
  // Languages & core web
  'TypeScript': '/images/skills/javascript.svg',
  'JavaScript': '/images/skills/javascript.svg',
  'Python': '/images/skills/default-backend.svg',
  'SQL': '/images/skills/sql.svg',
  'HTML5': '/images/skills/html5.svg',
  'CSS3': '/images/skills/css3.svg',
  'HTML': '/images/skills/html.svg',
  'CSS': '/images/skills/css.svg',

  // Frontend
  'React': '/images/skills/react.svg',
  'Redux': '/images/skills/redux.svg',
  'TanStack Query': '/images/skills/react.svg',
  'Vite': '/images/skills/default-frontend.svg',
  'Tailwind CSS': '/images/skills/css3.svg',
  'Hooks': '/images/skills/hooks.svg',
  'Context API': '/images/skills/context-api.svg',
  'Responsive Web Design': '/images/skills/responsive-web-design.svg',
  'State Management': '/images/skills/state-management.svg',
  'Front-end Development': '/images/skills/front-end-development.svg',
  'Single Page Applications': '/images/skills/single-page-applications.svg',
  'Axios': '/images/skills/axios.svg',
  'styled-components': '/images/skills/styled-components.svg',
  'Yup': '/images/skills/yup.svg',

  // Backend
  'NestJS': '/images/skills/default-backend.svg',
  'FastAPI': '/images/skills/default-backend.svg',
  'Node.js': '/images/skills/node.js.svg',
  'Express': '/images/skills/express.svg',
  'Express.js': '/images/skills/express.svg',
  'RESTful APIs': '/images/skills/restful-apis.svg',
  'Authentication': '/images/skills/authentication.svg',
  'JWT': '/images/skills/jwt.svg',
  'bcrypt': '/images/skills/bcrypt.svg',
  'Pydantic': '/images/skills/default-backend.svg',
  'Microsoft Entra ID': '/images/skills/authentication.svg',
  'Back-End Development': '/images/skills/back-end-development.svg',

  // Databases
  'SQL Server': '/images/skills/sql.svg',
  'PostgreSQL': '/images/skills/sql.svg',
  'SQLite': '/images/skills/sqlite.svg',
  'Knex.js': '/images/skills/knex.js.svg',
  'Supabase': '/images/skills/default-backend.svg',

  // Testing
  'Playwright': '/images/skills/end-to-end-testing.svg',
  'Vitest': '/images/skills/unit-testing.svg',
  'Jest': '/images/skills/jest.svg',
  'Cypress': '/images/skills/cypress.svg',
  'Pytest': '/images/skills/unit-testing.svg',
  'Unit Testing': '/images/skills/unit-testing.svg',
  'Integration Testing': '/images/skills/integration-testing.svg',
  'Software Testing': '/images/skills/software-testing.svg',
  'End-to-end Testing': '/images/skills/end-to-end-testing.svg',
  'Automated Unit Testing': '/images/skills/automated-unit-testing.svg',
  'Test Automation': '/images/skills/test-automation.svg',

  // Infrastructure & tools
  'Azure': '/images/skills/deployment.svg',
  'Docker': '/images/skills/deployment.svg',
  'Git': '/images/skills/git.svg',
  'Git CLI': '/images/skills/git-cli.svg',
  'GitHub': '/images/skills/github.svg',
  'GitHub Actions': '/images/skills/github.svg',
  'VS Code': '/images/skills/vs-code.svg',
  'Vercel': '/images/skills/vercel.webp',
  'Heroku': '/images/skills/heroku.svg',
  'npm': '/images/skills/npm.svg',
  'Webpack': '/images/skills/webpack.svg',
  'Babel.js': '/images/skills/babel.js.svg',
  'Postman API': '/images/skills/postman-api.svg',
  'Git BASH': '/images/skills/git-bash.svg',
  'n8n': '/images/skills/default-backend.svg',
  'Cursor': '/images/skills/vs-code.svg',
  'Deployment': '/images/skills/deployment.svg',

  // Core / soft
  'Algorithms': '/images/skills/algorithms.svg',
  'Data Structures': '/images/skills/data-structures.svg',
  'Architecture': '/images/skills/architecture.svg',
  'Software Development': '/images/skills/software-development.svg',
  'Computer Science': '/images/skills/computer-science.svg',
  'Big-O Notation': '/images/skills/big-o-notation.svg',
  'Debugging': '/images/skills/debugging.svg',
  'Agile Project Management': '/images/skills/agile-project-management.svg',
  'Teamwork & Collaboration': '/images/skills/teamwork-&-collaboration.svg',
  'Time Management': '/images/skills/time-management.svg',
  'Attention to Detail': '/images/skills/attention-to-detail.svg',
  'Problem Solving': '/images/skills/problem-solving.svg',

  // Category defaults
  'Frontend Development': '/images/skills/default-frontend.svg',
  'Backend Development': '/images/skills/default-backend.svg',
  'Development Tools': '/images/skills/default-tools.svg',
  'Testing': '/images/skills/default-testing.svg',
  'Soft Skills': '/images/skills/default-soft.svg',
  'default': '/images/skills/default.svg',
};

export const skillDescriptions = {
  // Required inventory (+ master-profile aligned)
  'TypeScript': 'Typed JavaScript for scalable front-end and NestJS/Node services.',
  'JavaScript': 'Built interactive web applications with modern JavaScript ES6+.',
  'Python': 'Backend services and scripting with Python, including FastAPI APIs.',
  'SQL': 'Designed and optimized relational queries for efficient data access.',
  'HTML5': 'Semantic, accessible markup for production web applications.',
  'CSS3': 'Responsive layouts and modern CSS techniques for polished UIs.',
  'React': 'Component-based UIs with Hooks, Context API, and modern React patterns.',
  'TanStack Query': 'Server-state management that keeps async UI and API data in sync.',
  'Redux': 'Predictable client state management for complex front-end flows.',
  'Vite': 'Fast front-end tooling for React and TypeScript applications.',
  'Tailwind CSS': 'Utility-first styling for responsive, consistent interfaces.',
  'NestJS': 'Scalable TypeScript backend services and monorepo APIs.',
  'FastAPI': 'High-performance Python APIs with clear request validation.',
  'Node.js': 'Server-side JavaScript for APIs, automation, and full-stack apps.',
  'Express': 'RESTful APIs and middleware with Express.',
  'SQL Server': 'Microsoft SQL Server for enterprise relational data and migrations.',
  'PostgreSQL': 'Relational modeling and production data stores with PostgreSQL.',
  'SQLite': 'Lightweight embedded databases for local and test environments.',
  'Knex.js': 'SQL query building, migrations, and schema management.',
  'Supabase': 'Postgres-backed app data and auth integrations.',
  'Playwright': 'End-to-end browser automation for role and permission coverage.',
  'Vitest': 'Fast unit and integration tests in TypeScript/JavaScript codebases.',
  'Jest': 'Unit and integration testing for React and Node services.',
  'Cypress': 'End-to-end UI testing for critical user journeys.',
  'Pytest': 'Python test suites for API and service validation.',
  'Azure': 'Cloud hosting, identity (Entra ID), and deployment for enterprise apps.',
  'Docker': 'Containerized multi-replica environments and shared session setups.',
  'GitHub Actions': 'CI/CD pipelines for automated test and deploy workflows.',
  'n8n': 'Event-driven automation for operations and webhook pipelines.',
  'Vercel': 'Front-end deployment and preview hosting.',
  'Git': 'Version control workflows for collaborative development.',
  'GitHub': 'Hosted collaboration, pull requests, and code review.',
  'VS Code': 'Primary editor for debugging and daily development.',
  'RESTful APIs': 'Designed and consumed REST APIs for client-server communication.',
  'Authentication': 'Secure auth patterns including OAuth/SSO and token-based flows.',
  'Microsoft Entra ID': 'Azure AD OAuth/SSO integration for enterprise access control.',
  'Hooks': 'React Hooks for state and side effects in functional components.',
  'Context API': 'Global React state without unnecessary prop drilling.',
  'Responsive Web Design': 'Mobile-friendly layouts with modern CSS techniques.',
  'State Management': 'Client and server state patterns for scalable apps.',
  'Algorithms': 'Efficient problem-solving with practical algorithmic techniques.',
  'Data Structures': 'Arrays, maps, and relational models for optimized solutions.',
  'Architecture': 'Maintainable full-stack architecture for production systems.',
  'Debugging': 'Systematic diagnosis with tooling, logs, and automated tests.',
  'Deployment': 'Shipping and operating applications in cloud environments.',
  'Unit Testing': 'Fast feedback with focused unit test coverage.',
  'Integration Testing': 'Validating service and component boundaries together.',
  'End-to-end Testing': 'Full-workflow verification that mirrors real user paths.',
  'Teamwork & Collaboration': 'Cross-functional delivery with clear communication.',
  'Problem Solving': 'Analytical debugging and delivery under real constraints.',
  'Cursor': 'AI-assisted development governed by specs and automated tests.',
};

export const skillExamples = {
  'TypeScript': 'Typed APIs, shared monorepo packages, safer refactors',
  'React': 'Hooks, Context, reusable components, accessible UI',
  'NestJS': 'Modules, controllers, enterprise workflow services',
  'FastAPI': 'Pydantic models, REST endpoints, validation',
  'SQL Server': 'Relational schemas, migrations, complex queries',
  'PostgreSQL': 'Transactional e-commerce data, Knex migrations',
  'Playwright': 'Role/permission E2E suites, regression gates',
  'Vitest': 'Integration tests alongside TDD workflows',
  'Vite': 'React + TypeScript app scaffolding and builds',
  'Tailwind CSS': 'Responsive utility-first layouts',
  'Docker': 'Multi-replica containers, shared sessions',
  'Azure': 'Entra ID SSO, cloud-hosted enterprise apps',
  'Python': 'FastAPI services, scripting, Pytest',
};

// Helper function to get the correct logo path
export const getLogoPath = (skillName) => {
  if (skillLogos[skillName]) {
    return skillLogos[skillName];
  }

  const categoryMatch = Object.entries(skillLogos).find(([key]) =>
    key.toLowerCase().includes('development') &&
    skillName.toLowerCase().includes(key.toLowerCase().replace(' development', ''))
  );

  if (categoryMatch) {
    return categoryMatch[1];
  }

  return skillLogos.default;
};
