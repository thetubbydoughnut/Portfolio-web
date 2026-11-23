# Personal Portfolio Website

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

A modern, responsive portfolio website built with React and Vite, showcasing my professional journey, projects, and technical expertise.

## 🌟 Features

- **Responsive Design**: Seamlessly adapts to all device sizes
- **Modern UI/UX**: Clean and intuitive interface with smooth animations
- **Project Showcase**: Dynamic project gallery with GitHub integration
- **Performance Optimized**: Built with Vite for lightning-fast load times
- **SEO Friendly**: Optimized for search engine visibility
- **Contact Integration**: Easy-to-use contact form for professional inquiries

## 🚀 Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Deployment**: Vercel
- **Styling**: CSS Modules
- **Version Control**: Git & GitHub

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/Portfolio-web.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🛠️ Development

### Prerequisites
- Node.js >= 22.0.0 (required by jsdom 31 / Vitest in CI)
- npm or yarn package manager

### Environment Setup
No client-side GitHub tokens are required. Project data is curated in `src/data/projects.js` — do not add `VITE_*` secrets for the browser bundle.

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run the Vitest suite
- `npm run test:secrets` - Assert the client build has no token patterns
- `npm run typecheck` - Run `tsc --noEmit`

## 📱 Project Structure

```
Portfolio-web/
├── src/
│   ├── components/     # Reusable UI components
│   ├── assets/        # Static assets (images, fonts)
│   ├── styles/        # Global styles and CSS modules
│   ├── App.jsx        # Main application component
│   └── main.jsx       # Application entry point
├── public/            # Static files
├── dist/             # Production build
└── vite.config.js    # Vite configuration
```

## 🔧 Configuration

### Vite Configuration
The project uses Vite for fast development and optimized production builds. Key configurations include:
- Optimized dependency pre-bundling
- CSS Modules support
- Environment variable handling
- Production build optimization

### Deployment
The website is deployed on Vercel with:
- Automatic deployments on push to main branch
- Custom domain configuration
- Environment variable management
- Edge network distribution


## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

Cameron Graham - [thetubbydoughnut@gmail.com](mailto:thetubbydoughnut@gmail.com)

Project Link: [https://github.com/thetubbydoughnut/Portfolio-web](https://github.com/thetubbydoughnut/Portfolio-web)

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Vercel](https://vercel.com/)
- [React Router](https://reactrouter.com/)

---
⭐️ From [Cameron Graham](https://github.com/thetubbydoughnut)
