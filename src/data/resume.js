export const resumeData = {
  profile: {
    name: "Cameron Graham",
    title: "High-velocity Software Engineer",
    location: "Oklahoma City, OK",
    phone: "661-972-5200",
    email: "cameron.graham.dev@outlook.com",
    links: {
      github: "https://github.com/thetubbydoughnut",
      linkedin: "https://www.linkedin.com/in/CameronGraham2001/", 
      portfolio: "/",
      resume: "https://docs.google.com/document/d/1d69zdOxy1qetCZDNJI_n_6T4Hs46kKo8zt1aR8ezi0Q/edit?usp=sharing"
    },
    summary: "Full-Stack Software Engineer with a proven track record of architecting scalable, revenue-generating platforms. By combining modern web architectures with advanced automation, I solve complex business bottlenecks—such as my recent work building a decentralized 3D-printing ERP and logistics pipeline. I am passionate about taking full-lifecycle ownership of products from conception to production deployment."
  },
  skills: {
    languages: ["JavaScript (ES6+)", "TypeScript", "Python", "SQL", "HTML5", "CSS3"],
    aiEnvironment: ["Cursor (Daily Driver)", "n8n (Workflow Automation)", "Google Antigravity (AI IDE)", "Gemini", "Meta Prompting", "BMAD Method"],
    frontend: ["React (Hooks, Context)", "Redux", "React Router", "Tailwind", "Vite", "Responsive Design", "Context API"],
    backend: ["Node.js", "Express", "FastAPI", "Pydantic", "REST architecture", "Authentication (JWT, Bcrypt)"],
    databases: ["PostgreSQL", "SQLite", "Knex"],
    testing: ["Jest", "Vitest", "Pytest", "Cypress", "Unit", "Integration", "& E2E Testing"],
    tools: ["Git", "GitHub", "VS Code", "Vercel", "Render", "Heroku", "Auth0", "NPM", "Stripe API", "EasyPost API", "Supabase"],
    concepts: ["Algorithms", "Data Structures", "State Management", "Deployment", "Debugging"]
  },
  experience: [
    {
      role: "Founder & Lead Software Engineer",
      company: "Legendary Printed Loot",
      url: "https://lpl3d.com",
      location: "Oklahoma City, OK",
      period: "October 2025 - Present",
      description: [
        "Architected and deployed a full-stack e-commerce platform using React 19, Node.js, and PostgreSQL, processing real-world transactions via Stripe and EasyPost integrations.",
        "Engineered a 'Semi-Autonomous Factory' pipeline using n8n and Webhooks to automatically slice and route 3D print jobs to local hardware immediately upon Stripe payment confirmation.",
        "Built a comprehensive 14-module enterprise resource planning (ERP) admin dashboard to manage inventory, production queues, and fulfillment.",
        "Optimized backend performance by refactoring N+1 database queries into batch operations using Knex.js, significantly reducing API latency.",
        "Hardened application security by implementing the Synchronizer Token Pattern for CSRF protection, JWT-based authentication, and automated role-based access control (RBAC) guards.",
        "Designed a zero-egress media storage pipeline using Cloudflare R2 and automated deployment workflows using Docker and GitHub Actions on Oracle Cloud infrastructure."
      ]
    },
    {
      role: "Software Engineer",
      company: "Tatco Construction",
      location: "Remote / OKC",
      period: "June 2025 - October 2025",
      description: [
        "Modernized operations by developing BOLT 2.0, a custom full-stack CRM, to address the lack of dedicated internal infrastructure.",
        "Served as the Sole Engineer, rapidly mastered Python and FastAPI to build a robust backend from scratch, including designing over 100+ API endpoints for secure user management and project analytics.",
        "Translated complex Figma wireframes into a pixel-perfect, responsive frontend utilizing TypeScript, React, and Vite.",
        "Delivered a production-ready internal tool that centralized project tracking, validated by a comprehensive suite of unit (Jest) and integration tests."
      ]
    },
    {
      role: "Software Engineer Intern",
      company: "American Dog Society",
      location: "Remote",
      period: "Jan 2025 - June 2025",
      description: [
        "User retention was suffering due to a fragmented experience across two separate legacy codebases.",
        "Spearheaded the frontend unification of both platforms, creating a cohesive and accessible Design System that aligned with modern branding.",
        "Streamlined the user journey into a single portal, significantly improving site navigation metrics and reducing technical debt for the maintenance team."
      ]
    }
  ],
  education: [
    {
      school: "BloomTech",
      program: "Full Stack Web Development Program (960+ hours)",
      period: "Nov 2023 - Jan 2025"
    }
  ]
};
