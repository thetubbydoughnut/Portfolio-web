import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

// Lazy load pages
const HeroSection = lazy(() => import('./components/HeroSection'));
const Projects = lazy(() => import('./pages/Projects'));
const Skills = lazy(() => import('./pages/Skills'));
const Contact = lazy(() => import('./pages/Contact'));

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
        <Navigation />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<HeroSection />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </Layout>
    </ErrorBoundary>
  );
}

export default App;
