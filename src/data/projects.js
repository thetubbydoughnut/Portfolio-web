/**
 * Curated projects for /projects — source of truth for the showcase list.
 * No GitHub API fetch, mock stars, or placeholder images.
 * First entry is Appendix F (AC-28) verbatim.
 */
export const projects = [
  {
    id: 'clr-land-asset-platform',
    name: 'Internal land and asset platform',
    label: 'Professional work at Continental Resources (internal tool, not public)',
    period: 'July 2026 – November 2026',
    description:
      'An enterprise migration of internal land and asset workflows from a legacy low-code platform to a TypeScript monorepo. The work covered well search and overview, role-aware editing with audit metadata, reusable data grids with sorting, filtering, and server-side pagination, Excel import pipelines with column mapping and schema validation, spec-first test-driven development with Playwright end-to-end tests and Vitest integration suites, and multi-replica deploys on Azure.',
    stack: 'React, TypeScript, NestJS, SQL Server, Microsoft Entra ID, Azure, Playwright, Vitest',
    homepage: '',
    html_url: '',
    visual: {
      kind: 'abstract',
      label: 'Illustrative abstract geometric mark — not a product screenshot',
      alt: 'Illustrative abstract geometric composition for an internal land and asset platform',
    },
  },
  {
    id: 'legendary-printed-loot',
    name: 'Legendary Printed Loot',
    description:
      'Commercial full-stack e-commerce platform built with React, TypeScript, Node.js, and PostgreSQL. Features TanStack Query + Context state management, Stripe checkout, EasyPost logistics, and n8n automation for order routing and shipping labels.',
    stack: 'React / TypeScript / Node.js / PostgreSQL',
    homepage: 'https://lpl3d.com',
    html_url: '',
    visual: {
      kind: 'mockup',
      label: 'Illustrative device-frame mockup — not a live capture',
      alt: 'Illustrative mockup representing Legendary Printed Loot storefront',
    },
  },
  {
    id: 'bolt-2',
    name: 'BOLT 2.0',
    description:
      'Custom full-stack internal CRM and operational project management platform for Tatco Construction. Over 100 FastAPI endpoints with a TypeScript/React/Vite client and Jest test suites. Private internal tool — no public repository.',
    stack: 'Python / FastAPI / React / TypeScript / Vite',
    homepage: '',
    html_url: '',
    visual: {
      kind: 'mockup',
      label: 'Illustrative typographic mockup — not a product screenshot',
      alt: 'Illustrative mockup for BOLT 2.0 internal CRM',
    },
  },
  {
    id: 'saap',
    name: 'SaaP',
    description:
      'siteConfig-driven React, Vite, Tailwind, and TypeScript site templates for local service businesses.',
    stack: 'React / Vite / Tailwind CSS / TypeScript',
    homepage: '',
    html_url: '',
    visual: {
      kind: 'mockup',
      label: 'Illustrative typographic mockup — not a product screenshot',
      alt: 'Illustrative mockup for SaaP site templates',
    },
  },
  {
    id: 'portfolio-web',
    name: 'Portfolio',
    description:
      'This portfolio site — a job-application showcase built with React, Vite, Framer Motion, and custom CSS.',
    stack: 'React / Vite',
    homepage: '/',
    html_url: 'https://github.com/thetubbydoughnut/Portfolio-web',
    visual: {
      kind: 'mockup',
      label: 'Illustrative device-frame mockup of this site',
      alt: 'Illustrative mockup representing this portfolio site',
    },
  },
];
