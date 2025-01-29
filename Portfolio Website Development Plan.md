# Portfolio Website Development Plan

## Tech Stack
- **Frontend**: React.js (Vite)
- **Backend**: Node.js/Express (optional for API)
- **Hosting**: Netlify/Vercel (free tier)
- **CI/CD**: GitHub Actions
- **Database**: None required (use static data + GitHub API)

## Documentation Links
### Core Technologies
- **React**: [Official React Documentation](https://react.dev/)
- **Vite**: [Vite Documentation](https://vitejs.dev/guide/)
- **Node.js**: [Node.js Documentation](https://nodejs.org/en/docs/)
- **Express**: [Express Documentation](https://expressjs.com/)

### Hosting & Deployment
- **Netlify**: [Netlify Documentation](https://docs.netlify.com/)
- **Vercel**: [Vercel Documentation](https://vercel.com/docs)
- **GitHub Actions**: [GitHub Actions Documentation](https://docs.github.com/en/actions)

### APIs & Integrations
- **GitHub REST API**: [GitHub API Documentation](https://docs.github.com/en/rest)
- **EmailJS**: [EmailJS Documentation](https://www.emailjs.com/docs/)
- **Font Awesome**: [Font Awesome Documentation](https://fontawesome.com/docs)
- **Google Fonts**: [Google Fonts Documentation](https://developers.google.com/fonts/docs)

### Additional Tools
- **Framer Motion**: [Framer Motion Documentation](https://www.framer.com/motion/)
- **MDX**: [MDX Documentation](https://mdxjs.com/)
- **CSS Grid**: [MDN CSS Grid Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- **CSS Flexbox**: [MDN Flexbox Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- **WCAG**: [Web Content Accessibility Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)

## 1. Project Setup
bash
Create React app
npm create vite@latest portfolio -- --template react
cd portfolio
npm install


## 2. Website Structure
text:src/
src/
├── components/
│ ├── Header.jsx
│ ├── HeroSection.jsx
│ ├── Projects.jsx
│ ├── Skills.jsx
│ ├── Experience.jsx
│ └── Contact.jsx
├── assets/
│ ├── resume.pdf # Export from Google Docs as PDF
│ └── images/
├── App.jsx
└── main.jsx


## 3. Key Features Implementation

### GitHub Integration (src/components/Projects.jsx)
javascript:src/components/Projects.jsx
import { useEffect, useState } from 'react';
const Projects = () => {
const [repos, setRepos] = useState([]);
useEffect(() => {
fetch('https://api.github.com/users/YOUR_USERNAME/repos?sort=updated')
.then(res => res.json())
.then(data => setRepos(data.filter(repo => !repo.fork)));
}, []);
return (
<section id="projects">
<h2>My Projects</h2>
<div className="projects-grid">
{repos.map(repo => (
<div key={repo.id} className="project-card">
<h3>{repo.name}</h3>
<p>{repo.description}</p>
<a href={repo.html_url} target="blank" rel="noopener noreferrer">
View on GitHub
</a>
</div>
))}
</div>
</section>
);
};


## 4. Design Requirements
- Use CSS Grid/Flexbox for layouts
- Implement responsive design
- Choose professional color scheme (recommend: primary dark, accent, and light neutrals)
- Add subtle animations (framer-motion or CSS transitions)
- Ensure WCAG accessibility compliance

## 5. Resume Integration
1. Export Google Doc as PDF
2. Place in `public/documents/your-resume.pdf`
3. Add download button:

javascript:src/components/Header.jsx
<a
href="/documents/your-resume.pdf"
download
className="resume-download"
>
Download Resume
</a>


## 6. Deployment (Free Options)
1. **Netlify**:
   - Connect GitHub repo
   - Build command: `npm run build`
   - Publish directory: `dist`

2. **Vercel**:
   - Import GitHub repo
   - Preset: React
   - Automatic deployments

## 7. Cost Optimization
- Use free hosting tiers
- Leverage GitHub Pages if needed
- Optimize images with Squoosh.app
- Implement caching headers
- Use serverless functions for API calls (Netlify/Vercel)

## 8. Security
- Use environment variables for API keys
- Implement rate limiting
- Add security headers
- Use HTTPS

## 9. Required Integrations
1. GitHub API for projects
2. Font Awesome for icons
3. Google Fonts (Recommend: Inter + Space Mono)
4. EmailJS (free tier) for contact form

## 10. Timeline
1. Setup: 1 day
2. Core Development: 3-5 days
3. Testing: 1 day
4. Deployment: 0.5 day

## 11. Optional Enhancements
- Blog section (use MDX)
- Dark mode toggle
- Analytics with Plausible (free tier)
- PWA capabilities
- PDF resume viewer

## 12. Maintenance
- Update projects quarterly
- Refresh design annually
- Monitor uptime with Statuspal (free)
- Keep dependencies updated

This plan uses entirely free services and open-source tools. The total estimated cost is $0 unless you choose to add a custom domain (typically $10-15/year).
To start:
1. Create a new GitHub repository
2. Follow the project setup steps
3. Begin with the Hero section and work through components sequentially
4. Deploy early and update frequently