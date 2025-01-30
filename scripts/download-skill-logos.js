import fs from 'fs';
import path from 'path';
import https from 'https';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env.local
const result = dotenv.config({ path: path.join(__dirname, '../.env.local') });

if (result.error) {
  console.error('Error loading .env.local file:', result.error);
  process.exit(1);
}

// Create skills directory if it doesn't exist
const skillsDir = path.join(__dirname, '../public/images/skills');
if (!fs.existsSync(skillsDir)) {
  fs.mkdirSync(skillsDir, { recursive: true });
}

// Function to parse skills from environment variables
function getSkillsFromEnv() {
  const skills = new Set();
  const categories = process.env.VITE_SKILL_CATEGORIES?.split(',') || [];
  
  categories.forEach(category => {
    const categoryId = category.split(':')[0];
    const envKey = `VITE_SKILLS_${categoryId.toUpperCase()}`;
    const categorySkills = process.env[envKey]?.split(',') || [];
    
    categorySkills.forEach(skill => {
      const skillName = skill.split(':')[0].trim();
      skills.add(skillName);
    });
  });
  
  return Array.from(skills);
}

// Logo URLs - using official logos where possible
const logos = {
  'React.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
  'Redux': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/redux/redux-original.svg',
  'JavaScript': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg',
  'HTML': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original.svg',
  'CSS': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original.svg',
  'Jest': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/jest/jest-plain.svg',
  'Cypress': 'https://raw.githubusercontent.com/cypress-io/cypress-icons/master/src/logo/cypress-io-logo-round.svg',
  'Node.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/nodejs/nodejs-original.svg',
  'Express': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/express/express-original.svg',
  'Git CLI': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg',
  'GitHub': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/github/github-original.svg',
  'VS Code': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/vscode/vscode-original.svg',
  'Vercel': 'https://assets.vercel.com/image/upload/v1607554385/repositories/vercel/logo.png',
  'Heroku': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/heroku/heroku-original.svg',
  'Unreal Engine': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/unrealengine/unrealengine-original.svg',
  'Blender': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/blender/blender-original.svg',
  'SQL': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/mysql/mysql-original.svg',
  'SQLite': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/sqlite/sqlite-original.svg',
  'Webpack': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/webpack/webpack-original.svg',
  'Babel.js': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/babel/babel-original.svg',
  'npm': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/npm/npm-original-wordmark.svg',
  'Postman API': 'https://www.vectorlogo.zone/logos/getpostman/getpostman-icon.svg',
  'Axios': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/axios/axios-plain.svg',
  'styled-components': 'https://raw.githubusercontent.com/styled-components/brand/master/styled-components.svg',
  'Yup': 'https://www.svgrepo.com/download/374161/schema.svg',
  'Knex.js': 'https://www.svgrepo.com/download/373644/database.svg',
  'JWT': 'https://www.svgrepo.com/download/373701/jwt.svg',
  'bcrypt': 'https://www.svgrepo.com/download/373448/lock.svg',
  'Ableton': 'https://www.svgrepo.com/download/373771/music.svg',
  'Gaea': 'https://www.svgrepo.com/download/384978/terrain-landscape-mountains.svg',
  // New logos for previously missing skills
  'Hooks': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
  'Context API': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/react/react-original.svg',
  'Single Page Applications': 'https://www.svgrepo.com/download/374124/spa.svg',
  'Front-end Development': 'https://www.svgrepo.com/download/374627/frontend.svg',
  'Responsive Web Design': 'https://www.svgrepo.com/download/374111/responsive.svg',
  'State Management': 'https://www.svgrepo.com/download/374094/redux.svg',
  'RESTful APIs': 'https://www.svgrepo.com/download/374037/api.svg',
  'Authentication': 'https://www.svgrepo.com/download/374613/auth0.svg',
  'Back-End Development': 'https://www.svgrepo.com/download/374626/backend.svg',
  'Git': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg',
  'Git BASH': 'https://raw.githubusercontent.com/devicons/devicon/master/icons/git/git-original.svg',
  'Algorithms': 'https://www.svgrepo.com/download/373429/algorithm.svg',
  'Data Structures': 'https://www.svgrepo.com/download/373589/data.svg',
  'Architecture': 'https://www.svgrepo.com/download/373431/architecture.svg',
  'Software Development': 'https://www.svgrepo.com/download/373848/module.svg',
  'Computer Science': 'https://www.svgrepo.com/download/373541/computer.svg',
  'Big-O Notation': 'https://www.svgrepo.com/download/373429/algorithm.svg',
  'Debugging': 'https://www.svgrepo.com/download/373581/debug.svg',
  'Test Automation': 'https://www.svgrepo.com/download/373938/test.svg',
  'Agile Project Management': 'https://www.svgrepo.com/download/373419/agile.svg',
  'Deployment': 'https://www.svgrepo.com/download/373595/deploy.svg',
  'Unit Testing': 'https://www.svgrepo.com/download/373938/test.svg',
  'Integration Testing': 'https://www.svgrepo.com/download/373938/test.svg',
  'Software Testing': 'https://www.svgrepo.com/download/373938/test.svg',
  'End-to-end Testing': 'https://www.svgrepo.com/download/373938/test.svg',
  'Automated Unit Testing': 'https://www.svgrepo.com/download/373938/test.svg',
  'Teamwork & Collaboration': 'https://www.svgrepo.com/download/373968/users.svg',
  'Time Management': 'https://www.svgrepo.com/download/373954/time.svg',
  'Attention to Detail': 'https://www.svgrepo.com/download/373435/attention.svg',
  'Problem Solving': 'https://www.svgrepo.com/download/373829/lightbulb.svg',
  '3D Modeling': 'https://www.svgrepo.com/download/373412/3d.svg',
  'Sound Design': 'https://www.svgrepo.com/download/373891/sound.svg',
  'Music Production': 'https://www.svgrepo.com/download/373771/music.svg',
  // Default icons for categories
  'Frontend Development': '/images/skills/default-frontend.svg',
  'Backend Development': '/images/skills/default-backend.svg',
  'Development Tools': '/images/skills/default-tools.svg',
  'Testing': '/images/skills/default-testing.svg',
  'Game Development': '/images/skills/default-gamedev.svg',
  'Audio Production': '/images/skills/default-audio.svg',
  'Soft Skills': '/images/skills/default-soft.svg'
};

// Download and optimize function
async function downloadAndOptimizeLogo(name, url) {
  const ext = path.extname(url).toLowerCase();
  const outputPath = path.join(skillsDir, `${name.toLowerCase().replace(/\s+/g, '-')}${ext}`);
  
  // Skip if file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`✓ Already exists: ${name}`);
    return;
  }
  
  // Download file
  await new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        resolve();
      });
    }).on('error', reject);
  });

  // Optimize if it's not an SVG
  if (ext !== '.svg') {
    await sharp(outputPath)
      .resize(96, 96, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({ quality: 90 })
      .toFile(outputPath.replace(ext, '.webp'));
    
    // Remove original file if we created a WebP version
    fs.unlinkSync(outputPath);
  }

  console.log(`✓ Downloaded and optimized: ${name}`);
}

// Create default logo
const defaultSvg = `
<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="24" height="24" rx="6" fill="#2A2A2A"/>
  <path d="M12 6L14.5 8.5M12 6L9.5 8.5M12 6V14M12 18L14.5 15.5M12 18L9.5 15.5M12 18V14" stroke="white" stroke-width="2"/>
</svg>
`;
fs.writeFileSync(path.join(skillsDir, 'default.svg'), defaultSvg);

// Create category-specific default logos
const categories = ['frontend', 'backend', 'tools', 'testing', 'gamedev', 'audio', 'soft'];
categories.forEach(category => {
  fs.writeFileSync(
    path.join(skillsDir, `default-${category}.svg`),
    defaultSvg.replace('#2A2A2A', getColorForCategory(category))
  );
});

function getColorForCategory(category) {
  const colors = {
    frontend: '#61DAFB',
    backend: '#68A063',
    tools: '#FF6B6B',
    testing: '#99424F',
    gamedev: '#1B1F23',
    audio: '#00CF7F',
    soft: '#7952B3'
  };
  return colors[category] || '#2A2A2A';
}

// Download and optimize all logos
async function downloadAllLogos() {
  console.log('Analyzing skills from environment variables...');
  const skills = getSkillsFromEnv();
  
  console.log(`Found ${skills.length} unique skills`);
  console.log('Downloading and optimizing skill logos...');
  
  const missingLogos = [];
  
  for (const skill of skills) {
    if (logos[skill]) {
      try {
        await downloadAndOptimizeLogo(skill, logos[skill]);
      } catch (error) {
        console.error(`Failed to process ${skill}:`, error);
        missingLogos.push({ skill, error: error.message });
      }
    } else {
      console.warn(`⚠ No logo URL defined for: ${skill}`);
      missingLogos.push({ skill, error: 'No logo URL defined' });
    }
  }
  
  // Generate report
  if (missingLogos.length > 0) {
    console.log('\nMissing or failed logos:');
    missingLogos.forEach(({ skill, error }) => {
      console.log(`- ${skill}: ${error}`);
    });
    
    // Save report to file
    const report = {
      timestamp: new Date().toISOString(),
      totalSkills: skills.length,
      missingLogos,
      successfulDownloads: skills.length - missingLogos.length
    };
    
    fs.writeFileSync(
      path.join(__dirname, 'missing-logos-report.json'),
      JSON.stringify(report, null, 2)
    );
  }
  
  console.log('\nDone!');
  console.log(`Successfully processed: ${skills.length - missingLogos.length}/${skills.length} skills`);
}

downloadAllLogos(); 