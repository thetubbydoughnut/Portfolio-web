/**
 * Curated projects for /projects — source of truth for the showcase list.
 * No GitHub API fetch, mock stars, or placeholder images.
 */
export const projects = [
  {
    id: 'legendary-printed-loot',
    name: 'Legendary Printed Loot',
    description:
      'Commercial full-stack e-commerce platform built with React, TypeScript, Node.js, and PostgreSQL. Features TanStack Query + Context state management, Stripe checkout, EasyPost logistics, and n8n automation for order routing and shipping labels.',
    stack: 'React / TypeScript / Node.js / PostgreSQL',
    homepage: 'https://lpl3d.com',
    html_url: '',
  },
  {
    id: 'bolt-2',
    name: 'BOLT 2.0',
    description:
      'Custom full-stack internal CRM and operational project management platform for Tatco Construction. Over 100 FastAPI endpoints with a TypeScript/React/Vite client and Jest test suites. Private internal tool — no public repository.',
    stack: 'Python / FastAPI / React / TypeScript / Vite',
    homepage: '',
    html_url: '',
  },
  {
    id: 'saap',
    name: 'SaaP',
    description:
      'siteConfig-driven React, Vite, Tailwind, and TypeScript site templates for local service businesses.',
    stack: 'React / Vite / Tailwind CSS / TypeScript',
    homepage: '',
    html_url: '',
  },
  {
    id: 'portfolio-web',
    name: 'Portfolio',
    description:
      'This portfolio site — a job-application showcase built with React, Vite, Framer Motion, and custom CSS.',
    stack: 'React / Vite',
    homepage: '/',
    html_url: 'https://github.com/thetubbydoughnut/Portfolio-web',
  },
];
