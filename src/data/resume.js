export const resumeData = {
  profile: {
    name: "Cameron Graham",
    title: "Full-Stack Software Engineer",
    location: "Oklahoma City, OK",
    email: "cameron.graham.dev@outlook.com",
    availability:
      "Available for full-time software engineering.",
    links: {
      github: "https://github.com/thetubbydoughnut",
      linkedin: "https://www.linkedin.com/in/CameronGraham2001/",
      portfolio: "/",
      // Prefer local PDF when present; otherwise the existing public Google Doc URL
      resume: "https://docs.google.com/document/d/1d69zdOxy1qetCZDNJI_n_6T4Hs46kKo8zt1aR8ezi0Q/edit?usp=sharing",
    },
    summary:
      "Full-Stack Software Engineer in Oklahoma City, OK. Recently delivered TypeScript/NestJS monorepo modernization, Excel ingestion pipelines, and Playwright/Vitest suites at Continental Resources, and continue building Legendary Printed Loot — a React, TypeScript, Node.js, and PostgreSQL e-commerce platform with Stripe, EasyPost, and n8n automation. Available for full-time software engineering.",
  },
  skills: {
    languages: ["TypeScript", "JavaScript (ES6+)", "Python", "SQL", "HTML5", "CSS3"],
    frontend: [
      "React (Hooks, Context API)",
      "TanStack Query",
      "Redux",
      "Vite",
      "Tailwind CSS",
      "Responsive Design Systems",
      "Dynamic Data Grids",
    ],
    backend: [
      "NestJS",
      "Python (FastAPI)",
      "Node.js",
      "Express.js",
      "RESTful API Design & Consumption",
      "Microservices",
      "Pydantic",
      "Microsoft Entra ID (Azure AD OAuth/SSO)",
    ],
    databases: [
      "Microsoft SQL Server",
      "PostgreSQL",
      "SQLite",
      "Knex.js",
      "Supabase",
      "Schema Migrations",
    ],
    testing: [
      "Test-Driven Development (TDD)",
      "Playwright (E2E)",
      "Vitest",
      "Jest",
      "Cypress",
      "Pytest",
    ],
    infrastructure: [
      "Azure",
      "Docker",
      "Multi-Replica Container Environments",
      "CI/CD Pipelines",
      "GitHub Actions",
      "n8n Event-Driven Automation",
      "Vercel",
    ],
  },
  experience: [
    {
      role: "Software Engineer",
      company: "Continental Resources",
      location: "Oklahoma City, OK",
      period: "July 2026 – November 2026",
      description: [
        "Modernized internal land and asset management infrastructure by migrating mission-critical business workflows from a legacy low-code platform into a scalable TypeScript and NestJS monorepo.",
        "Engineered parity-focused core features across well search, well overview, ownership data entry, operator/interest details, and Quorum/SAP enterprise data integrations.",
        "Implemented role-aware editing, audit metadata tracking, and reusable persistent data grids with multi-column sorting, advanced filtering, server-side pagination, and user state caching.",
        "Built and hardened high-volume Excel data ingestion pipelines featuring spreadsheet-style column mapping, JOA and contract schema validation, replace-on-save safeguards, and relationship-aware data imports.",
        "Spearheaded a spec-first Test-Driven Development workflow, authoring Playwright E2E and Vitest integration suites that automate role/permission gating verification and prevent regressions across production deploys.",
        "Supported high availability across containerized multi-replica environments through shared session configurations and environment-aware application architecture on Azure.",
      ],
    },
    {
      role: "Founder & Lead Software Engineer",
      company: "Legendary Printed Loot",
      url: "https://lpl3d.com",
      location: "Oklahoma City, OK",
      period: "October 2025 – Present",
      description: [
        "Architected, built, and launched an end-to-end commercial full-stack e-commerce platform using React, TypeScript, Node.js, and PostgreSQL, maintaining 99.9% production availability across 25 dynamic routes.",
        "Designed and implemented a resilient 3-tier state management architecture combining TanStack Query with Context API, eliminating asynchronous race conditions between Stripe payment webhooks, relational database transactions, and client-side UI states.",
        "Engineered an event-driven operations pipeline using self-hosted n8n and EasyPost APIs to automate customer order routing, tracking updates, and shipping label generation, reducing manual administrative overhead by 40%.",
        "Built autonomous bot integrations and scheduled webhook handlers on cloud VMs to monitor inventory, reconcile Stripe payment events, and broadcast real-time operational alerts.",
      ],
    },
    {
      role: "Software Engineer",
      company: "Tatco Construction",
      location: "Remote / Oklahoma City, OK",
      period: "June 2025 – October 2025",
      description: [
        "Engineered BOLT 2.0, a custom full-stack internal CRM and operational project management platform, designing and implementing over 100 high-performance RESTful API endpoints using Python, FastAPI, and PostgreSQL.",
        "Translated complex Figma component hierarchies and user flows into a responsive, accessible client UI with TypeScript, React, and Vite.",
        "Established unit and integration testing suites with Jest, ensuring strict request payload validation and data integrity across multi-stage project milestones.",
      ],
    },
    {
      role: "Software Engineer Intern",
      company: "American Dog Society",
      location: "Remote",
      period: "January 2025 – June 2025",
      description: [
        "Spearheaded the frontend unification of two legacy web codebases into a single cohesive member portal.",
        "Built a shared, accessible Design System component library, improving cross-platform consistency and significantly reducing technical debt for the engineering team.",
      ],
    },
  ],
  education: [
    {
      school: "BloomTech (Bloom Institute of Technology)",
      program:
        "Full Stack Web Development & Computer Science Program (960+ hours of intensive, production-oriented software engineering)",
      period: "November 2023 – January 2025",
    },
    {
      school: "University of Michigan",
      program: "Programming for Everybody (Python Certification)",
      period: "September 2025",
    },
  ],
};

/**
 * Resume CTA href. When a confirmed PDF is added at
 * public/documents/cameron-graham-resume.pdf, point links.resume there.
 * Until then, use the existing public Google Doc URL (label as "Resume", not "Download").
 */
export function getResumeHref() {
  return resumeData.profile.links.resume;
}
