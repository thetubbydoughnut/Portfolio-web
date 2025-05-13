import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load pages
const HeroSection = lazy(() => import('./components/HeroSection'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Contact = lazy(() => import('./pages/Contact'));
const Certifications = lazy(() => import('./pages/Certifications'));
const Freelancing = lazy(() => import('./pages/Freelancing'));
const HireMe = lazy(() => import('./pages/HireMe'));

// Loading component
const Loading = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Layout>
        <Header />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/certifications" element={<Certifications />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/freelancing" element={<Freelancing />} />
            <Route path="/hire-me" element={<HireMe />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
